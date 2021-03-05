FROM node:12.13-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=development

COPY . .

RUN npm run build

RUN npm run build:translations

RUN npm run build:mails