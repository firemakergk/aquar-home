# /bin/bash
# pm2 stop all
source /root/.bashrc
source /usr/local/bin/virtualenvwrapper.sh
workon aquar
cd /opt/aquar/src/aquar-home
git pull
cd /opt/aquar/src/docker-compose/
docker-compose stop
cd /opt/aquar/src/aquar-home
DOCKER_BUILDKIT=0 docker image build --no-cache -t finetu/aquarhome:latest .
docker images
cmd=$1
if [ "$cmd" == "push" ]; then
    # docker tag 2f3890615562 finetu/aquarhome:1.1.9
    docker login --username=finetu -p $DOCKER_HUB_ACCESS_TOKEN
    docker push finetu/aquarhome:latest
    echo "最新镜像已推送至docker hub"
fi
cd /opt/aquar/src/docker-compose/
docker-compose up -d