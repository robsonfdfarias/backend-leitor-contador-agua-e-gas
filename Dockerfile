FROM node:20-alpine as build

WORKDIR /usr/src/app

ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json ./

# Instalar as dependências
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]

#docker build -t backend-medidor .
#docker run -it --rm -p 3000:3000 --env-file .env backend-medidor