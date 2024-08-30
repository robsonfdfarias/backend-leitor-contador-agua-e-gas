require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
// const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

const querys = require('./all_function.js');

//---------------- Importação do prisma ----------------------------
const PrismaClient =  require('./PrismaReg.js');
// const prismaClass = new PrismaClient();
const prisma = new PrismaClient();
prisma.prisma.$connect();
// const prisma = prismaClass.prisma;
// prisma.$connect();

//----------------- importações para usar na classe storage ------------------------------//
const StorageClass = require('./Storage_class.js');
const storage = new StorageClass(__dirname, process.env.URL);
//----------------- fim das importações para usar na classe storage ------------------------------//

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


/**
 * -------------------------------------------------------------------------------------------
 * ENDPOINT POST
 * -------------------------------------------------------------------------------------------
 */
app.post('/upload', async (req, res) => {
  //RECUPERA AS VARIÁVEIS ENVIADAS-------------------------
  const { image, customer_code, measure_datetime, measure_type } = req.body;
  /**
   * TESTE DAS VARIÁVEIS ENVIADAS
   */
  const checked = checkedTypesPost(image, customer_code, measure_datetime, measure_type);
  if (checked.filed) {
      return res.status(400).json({ error_code: 'INVALID_DATA', error_description: checked.message });
  }

  /**
   * SALVA A IMAGEM PARA CONSULTA POSTERIOR
   */
  const imgObj = storage.convertToImage(image, Buffer);

  /**
   * Verifica se já existe um cadastro desse tipo nesse mês do mesmo cliente
   */
  const verify = await prisma.findFirst(customer_code, measure_datetime, measure_type);
  if(verify){
    console.log('Já existe uma leitura para este tipo no mês atual');
    return res.status(409).json({ error_code: 'DOUBLE_REPORT', error_description: "Leitura do mês já realizada" });
  }

  /**
   * Envia a foto para o Gemini para obter o número
   */
  const textPrompt = `Retorne somente os números com a maior font dentro do retangulo da figura da imagem. Retorne somente números.`;

  // Configura o modelo
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Prepara a imagem e o prompt para a API
  const imagePart = base64ToGenerativePart(image, 'image/png'); // Ajuste o MIME type se necessário
  const result = await model.generateContent([textPrompt, imagePart]);

  // Obtém e processa a resposta
  const response = await result.response;
  let number = await response.text();
  const generatedText = parseInt(number.replace(' ', ''));

  // console.log(generatedText);
  /**
   * Confirma se não existe o registro, cria um registro com esses dados e retorna para frontend as informações
   */
  if(!verify){
    const reg = await prisma.create(imgObj, customer_code, measure_datetime, measure_type, generatedText);
    if(reg!=null){
      console.log("Sucesso no cadastro e verificação. id: "+reg.id);
      res.status(200).json({ image_url: imgObj, measure_value: generatedText, measure_uuid: reg.id });
    }
  }else{
  /**
   * Caso ocorra algum erro no cadastro das informações, retorna uma mensagem de erro
   */
    console.log("Falha dentro do try....")
    res.status(400).json({ "error_code": "FAILURE_TO_RECORD_DATA", "error_description": "Falha ao registrar os dados na base de dados." });
  }
  
});
function checkedTypesPost(image, customer_code, measure_datetime, measure_type){
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


/**
 * -------------------------------------------------------------------------------------------
 * ENDPOINT PATCH
 * -------------------------------------------------------------------------------------------
 */
app.patch("/confirm", async (req, res) => {
  const { measure_uuid, confirmed_value } = req.body;
  /**
   * Valida o tipo de dados dos parâmetros enviados
   */
  const checked = checkedTypesPatch(measure_uuid, confirmed_value);
  if(checked.filed){
    res.status(400).json({ error_code: 'INVALID_DATA', error_description: checked.message });
  }
  /**
   * Verifica se o código de leitura informado existe
   */
  const verify = await prisma.findFirstPatch(measure_uuid);
  if(!verify){
    res.status(404).json({ error_code: 'MEASURE_NOT_FOUND', error_description: "Leitura não encontrada." });
  }
  /**
   * Verifica se a leitura já foi confirmada
   */
  if(verify.confirmed==true){
    res.status(409).json({ error_code: 'CONFIRMATION_DUPLICATE', error_description: "Leitura do mês já realizada." });
  }
  /**
   * Salva a atualização no banco de dados
   */
  const updateData = await prisma.update(measure_uuid, parseInt(confirmed_value), true);
  if(updateData!=null){
    console.log("Sucesso na confirmação. id: "+measure_uuid);
    res.status(200).json({ success: true });
  }
  console.log('******************************')

});

function checkedTypesPatch(measure_uuid, confirmed_value){
  const faileds = [];
  const err = false;
  if(typeof measure_uuid!="string"){
    faileds.push('tipo de dado do measure_uuid inválido. Requer o tipo string');
    err=true;
  }
  if(typeof confirmed_value === 'number'){
    faileds.push('tipo de dado do confirmed_value inválido. Requer o tipo number');
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


/**
 * -------------------------------------------------------------------------------------------
 * ENDPOINT GET
 * -------------------------------------------------------------------------------------------
 */
app.get("/:customer_code/list", async (req, res) => {
  const {customer_code} = req.params;
  const measureType = req.query.measure_type;
  /**
   * Checa se o measure_type é do tipo WATER ou GAS
   */
  const checked = checkedValueType(customer_code, measureType);
  if(checked.filed){
    return res.status(400).json({ error_code: 'INVALID_TYPE', error_description: "Tipo de medição não permitida." });
  }
  /**
   * Filtra as medidas realizados pelo cliente
   */
  const clientReg = await prisma.getMany(customer_code, checked.type);
  if(clientReg.length<=0){
    return res.status(404).json({ error_code: 'MEASURES_NOT_FOUND', error_description: "Nenhuma leitura encontrada." });
  }else{
    console.log('Registros listados com sucesso. cliente: '+customer_code);
    return res.status(200).json({ customer_code: customer_code, measures: clientReg });
  }
  
})

function checkedValueType(customer_code, measure_type){
  const faileds = [];
  let err = false;
  let type = null;
  if(customer_code==undefined){
    faileds.push("o código do cliente é obrigatório");
    err=true;
  }
  if(measure_type!=undefined){
    if(measure_type.toLowerCase() != "water" && measure_type.toLowerCase() != "gas"){
      faileds.push("o tipo precisa ser WATER ou GAS");
      err=true;
    }else{
      type = measure_type.toUpperCase();
    }
  }
  var error = '';
  for(let i=0;i<faileds.length;i++){
    if(i<(faileds.length-1)){
      error+=faileds[i]+', ';
    }else{
      error+=faileds[i]+'.';
    }
  }
  return {filed: err, message: error, type: type};
}



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('');
  console.log('-------------------------------------------------------------------------');
  console.log('');
});