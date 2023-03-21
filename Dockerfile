ARG NPM_REGISTRY=http://registry.npmjs.org
FROM node:16-slim as builder
ARG NPM_REGISTRY
WORKDIR /tmp
RUN apt update && apt install -y build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev xz-utils wget rsync && npm install -g pm2 && wget --no-check-certificate https://www.python.org/ftp/python/3.10.0/Python-3.10.0.tar.xz && wget --no-check-certificate https://bootstrap.pypa.io/get-pip.py
RUN tar -xf Python-3.10.0.tar.xz && cd Python-3.10.0 && ./configure --enable-optimizations && make install && python3 /tmp/get-pip.py
WORKDIR /app/aquar_home/aquar_home_front
COPY ./aquar_home_front/ ./
RUN npm install --registry ${NPM_REGISTRY} && npm run build
WORKDIR /app/aquar_home/aquar_home_server
COPY ./aquar_home_server/ ./
RUN rm -rf ./aquar_home_server/public/ && cp -r /app/aquar_home/aquar_home_front/dist/* /app/aquar_home/aquar_home_server/public/
RUN PYTHON=python3 npm install --unsafe-perm --registry ${NPM_REGISTRY}

FROM node:16-slim
WORKDIR /app/aquar_home
RUN apt update && apt install -y --no-install-recommends xz-utils wget rsync && npm install -g pm2 && wget --no-check-certificate https://www.python.org/ftp/python/3.10.0/Python-3.10.0.tar.xz && wget --no-check-certificate https://bootstrap.pypa.io/get-pip.py
# RUN apt update && apt install -y --no-install-recommends build-essential zlib1g-dev xz-utils wget rsync && npm install -g pm2 && wget --no-check-certificate https://www.python.org/ftp/python/3.10.0/Python-3.10.0.tar.xz && wget --no-check-certificate https://bootstrap.pypa.io/get-pip.py
# RUN tar -xf Python-3.10.0.tar.xz && cd Python-3.10.0 && ./configure --enable-optimizations && make install
COPY --from=builder /app/aquar_home/aquar_home_server/ .
EXPOSE 8172
VOLUME ["/var/aquardata"]
VOLUME ["/opt/aquarpool"]
VOLUME ["/root/.pm2/logs"]

CMD ["/bin/sh", "-c", "cd /app/aquar_home && mkdir -p /var/aquardata/log/ && npm run dcprd > /root/.pm2/logs/aquar_home.log 2>&1"]
