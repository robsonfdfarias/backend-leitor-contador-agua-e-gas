FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

# Instalar as dependências
RUN npm install

COPY ./prisma/* /usr/src/app/prisma/

RUN npx prisma generate

RUN npm run prismaDB

RUN ls /usr/src/app/prisma

COPY . ./

EXPOSE 3000

CMD ["node", "index.js"]

#docker build -t backend-medidor .
#docker run -p 3000:3000 backend-medidor