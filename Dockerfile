FROM node:14
WORKDIR /app/aquar_home/aquar_home_front
COPY package*.json ./

WORKDIR /app/aquar_home/aquar_home_server
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD "npm run start > /var/log/aquar/aquar_home.log 2>&1"