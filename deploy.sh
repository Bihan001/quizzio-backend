#!/bin/bash

npm i
npm i -g pm2 nodemon
npm run build
cp .env dist/.env
cd ../quizzio-frontend
npm i
npm run build
mv build ../quizzio-backend/dist