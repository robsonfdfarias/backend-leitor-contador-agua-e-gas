require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
// const multer = require('multer');

//----------------- importações para usar na classe storage ------------------------------//
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
// const bodyParser = require('body-parser');
const StorageClass = require('./Storage_class.js');
const storage = new StorageClass(fs, bodyParser, __dirname, Buffer, process.env.URL);
//----------------- fim das importações para usar na classe storage ------------------------------//

const User = require('./User.js')
const user = new User('Robson');
user.printEx();

// Inicializa o cliente da API com a chave da API
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const app = express();
const port = 3000;

//permitir o acesso a pasta de imagens
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const upload = multer({dest: 'uploads/'})

// Middleware para analisar JSON
app.use(bodyParser.json({ limit: '10mb' }));

// Converte base64 para o formato esperado pela API
function base64ToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
}

app.use(cors())

// Endpoint para receber a imagem e o prompt
// app.post('/upload', upload.single('image'), async (req, res) => {
app.post('/upload', async (req, res) => {
  try {
    //RECUPERA AS VARIÁVEIS ENVIADAS-------------------------
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    /**
     * TESTE DAS VARIÁVEIS ENVIADAS
     */
    const checked = checkedTypes(image, customer_code, measure_datetime, measure_type);
    if (checked.filed) {
        return res.status(400).json({ error_code: 'INVALID_DATA', error_description: checked.message });
    }

    /**
     * SALVA A IMAGEM PARA CONSULTA POSTERIOR
     */
    const imgObj = storage.convertToImage(image, path);

    //


    // const textPrompt = `Retorne somente os números com a maior font dentro do retangulo da figura da imagem`;

    // // Configura o modelo
    // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // // Prepara a imagem e o prompt para a API
    // const imagePart = base64ToGenerativePart(image, 'image/png'); // Ajuste o MIME type se necessário
    // const result = await model.generateContent([textPrompt, imagePart]);

    // // Obtém e processa a resposta
    // const response = await result.response;
    // const generatedText = await response.text();

    // console.log(generatedText);
    // // res.status(200).json({ generatedText });
    // res.status(200).json({ image_url: generatedText, measure_value: generatedText, measure_uuid: '' });

  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    // res.status(500).json({ error: 'Failed to generate text' });
  }
});
function checkedTypes(image, customer_code, measure_datetime, measure_type){
  var faileds=[];
  var err = false;
  // Verifica se a string base64 é uma sequência válida de Base64
  const base64Pattern = /^(?:[A-Za-z0-9+\/]{4})* (?:[A-Za-z0-9+\/]{2}(?:==|=)?|[A-Za-z0-9+\/]{3}=?)$/;
  // Verifica se a string base64 atende ao padrão e se o comprimento é múltiplo de 4
  if(base64Pattern.test(image)){
    faileds.push('formato de imagem não compatível com base64');
    err=true;
  }
  if(typeof customer_code!="string"){
    faileds.push('tipo de dado do código do cliente inválido. Requer o tipo string');
    err=true;
  }
  if(new Date(measure_datetime) instanceof Date == false){
    faileds.push('o measure_datetime deve estar no formato datetime');
    err=true;
  }
  if(measure_type!="WATER" && measure_type!="GAS"){
    faileds.push('O measure_type deve ser WATER ou GAS');
    err=true;
  }
  var error = '';
  for(let i=0;i<faileds.length;i++){
    if(i<(faileds.length-1)){
      error+=faileds[i]+', ';
    }else{
      error+=faileds[i]+'.';
    }
  }
  return {filed: err, message: error};
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
