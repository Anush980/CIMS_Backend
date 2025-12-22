#offical node js image
FROM node:20

#working directory
WORKDIR /app

#copy package.json
COPY package*.json ./

#install dependencies
RUN npm install

#copy other code...
COPY . .

#expose the port app uses
EXPOSE 5000

#start the app 
CMD ["node","server.js"]
