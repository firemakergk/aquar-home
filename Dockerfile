ARG NPM_REGISTR=http://registry.npmjs.org
FROM node:14 as builder
WORKDIR /app/aquar_home/aquar_home_front
COPY package*.json ./
RUN npm install --registry ${NPM_REGISTR}
RUN npm run build
WORKDIR /app/aquar_home/aquar_home_server
COPY package*.json ./
RUN npm install --unsafe-perm --registry ${NPM_REGISTR}
COPY . .
COPY /app/aquar_home/aquar_home_front/dist/ ./public/

FROM node:14
WORKDIR /app/aquar_home
COPY --from=builder /app/aquar_home/aquar_home_server/ .
EXPOSE 8222
VOLUME ["/var/aquar_data"]
CMD "npm run start > /var/log/aquar/aquar_home.log 2>&1"