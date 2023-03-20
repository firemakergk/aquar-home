ARG NPM_REGISTRY=https://registry.npm.taobao.org
FROM node:16-slim
ARG NPM_REGISTRY
WORKDIR /tmp
RUN apt update && apt install -y build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev wget rsync && npm install -g pm2 && wget https://www.python.org/ftp/python/3.10.0/Python-3.10.0.tar.xz && wget https://bootstrap.pypa.io/get-pip.py && tar -xf Python-3.10.0.tar.xz
RUN cd Python-3.10.0 && ./configure --enable-optimizations && make install && python3 /tmp/get-pip.py
WORKDIR /app/aquar_home/aquar_home_front
COPY ./aquar_home_front/ ./
RUN npm install --registry ${NPM_REGISTRY} && npm run build
WORKDIR /app/aquar_home/aquar_home_server
COPY ./aquar_home_server/ ./
RUN PYTHON=python3 npm install --unsafe-perm --registry ${NPM_REGISTRY}
WORKDIR /app/aquar_home
RUN rm -rf ./aquar_home_server/public/ && mkdir -p aquar_home_server/public/ && cp -r ./aquar_home_front/dist/* ./aquar_home_server/public/ 
EXPOSE 8172
VOLUME ["/var/aquardata"]
VOLUME ["/opt/aquarpool"]
VOLUME ["/root/.pm2/logs"]

CMD ["/bin/sh", "-c", "cd /app/aquar_home/aquar_home_server/ && mkdir -p /var/aquardata/log/ && npm run dcprd > /root/.pm2/logs/aquar_home.log 2>&1"]
