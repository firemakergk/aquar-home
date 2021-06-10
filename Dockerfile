ARG NPM_REGISTRY=http://registry.npmjs.org
FROM node:14 as builder
ARG NPM_REGISTRY
WORKDIR /app/aquar_home/aquar_home_front
COPY ./aquar_home_front/ ./
RUN npm install --registry ${NPM_REGISTRY}
RUN npm run build
WORKDIR /app/aquar_home/aquar_home_server
COPY ./aquar_home_server/ ./
RUN npm install --unsafe-perm --registry ${NPM_REGISTRY}
WORKDIR /app/aquar_home
RUN cp -r ./aquar_home_front/dist/* ./aquar_home_server/public/

FROM node:14
WORKDIR /app/aquar_home
COPY --from=builder /app/aquar_home/aquar_home_server/ .
COPY --from=builder /app/aquar_home/aquar_home_server/db.json /var/aquar_data/db.json
EXPOSE 3000
VOLUME ["/var/aquar_data"]
CMD "npm run start > /var/log/aquar/aquar_home.log 2>&1"
