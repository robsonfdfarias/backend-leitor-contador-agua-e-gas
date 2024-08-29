require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
// const multer = require('multer');

const User = require('./User.js')
const user = new User('Robson');
user.printEx();

// Inicializa o cliente da API com a chave da API
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// const genAI = new GoogleGenerativeAI("AIzaSyAGT7vr__ua8_3poJILBDil72yHkF31UKo");

const app = express();
const port = 3000;

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
// app.post('/upload', upload.single('imageBase64'), async (req, res) => {
app.post('/upload', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
        return res.status(400).json({ error: 'Both image base64 and prompt are required' });
    }

    const textPrompt = `Retorne somente os números com a maior font dentro do retangulo da figura da imagem`;

    // Configura o modelo
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepara a imagem e o prompt para a API
    const imagePart = base64ToGenerativePart(imageBase64, 'image/png'); // Ajuste o MIME type se necessário
    const result = await model.generateContent([textPrompt, imagePart]);

    // Obtém e processa a resposta
    const response = await result.response;
    const generatedText = await response.text();

    console.log(generatedText);
    // console.log(numeros);
    res.json({ generatedText });

  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
