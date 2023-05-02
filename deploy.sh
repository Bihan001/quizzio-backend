#!/bin/bash

npm i
npm i -g pm2 nodemon
npm run build
cp .env dist/.env
cd ../quizzio-frontend
npm i
npm run build
mv build ../quizzio-backend/dist/
cd ../quizzio-backend/dist
# NODE_ENV=production pm2 start server.js --name quizzio --update-env