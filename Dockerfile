FROM node:12

WORKDIR /usr/app

COPY . .

RUN npm install && npm run build

EXPOSE 80

CMD ["npm", "start"]
