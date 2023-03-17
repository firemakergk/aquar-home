# cp /root/.pydistutils.cfg /root/.pydistutils.cfg.bak
# cp /root/.pip/pip.conf /root/.pip/pip.conf.bak
gitrepo=$1
if [ "$gitrepo" == "" ]; then
    echo "ERROR:未传入aquarhome仓库地址作为脚本参数"
    exit 0
fi
echo '********开始初始化aquar环境********'
apt update
apt install -y vim 
apt install -y git
apt install -y unzip
apt install -y lrzsz
apt install -y software-properties-common
apt update
echo '********安装python3及venv********'
apt install curl -y
apt install python3-pip -y
pip3 install virtualenv
pip3 install virtualenvwrapper
apt update
if ! grep -q '##\[aquar config start\]##' /root/.bashrc;
then
cp /root/.bashrc /root/.bashrc.bak
cat >> /root/.bashrc <<EOF
##[aquar config start]##
export WORKON_HOME=$HOME/.virtualenvs
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
source /usr/local/bin/virtualenvwrapper.sh
##[aquar config end]##
EOF
else
    echo '********探测到已配置成功，跳过/root/.bashrc的配置********'
fi
source /root/.bashrc
cat > /usr/local/bin/aqserv <<EOF
#!/bin/bash
cmd=\$1
if [ "\$cmd" != "start" ] && [ "\$cmd" != "stop" ] && [ "\$cmd" != "restart" ] && [ "\$cmd" != "ps" ]; then
    echo "error： input parameter only accept 'start','stop','restart' or'ps'"
    exit 0
fi
source /root/.bashrc
source /usr/local/bin/virtualenvwrapper.sh
workon aquar
cd /opt/aquar/src/docker-compose/
if [ "\$cmd" == "start" ]; then
    echo "aquar docker services starting"
    docker-compose up -d
elif [ "\$cmd" == "stop" ]; then
    echo "aquar docker services stoping"
    docker-compose stop
elif [ "\$cmd" == "restart" ]; then
    echo "aquar docker services restarting"
    docker-compose restart

else
    docker-compose ps
fi
EOF
chmod +x /usr/local/bin/aqserv

echo '********安装docker********'
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) \
stable"
apt-get update
apt-get install docker-ce docker-ce-cli containerd.io -y

echo '********创建python环境aquar并安装docker-compose********'
source /root/.bashrc
source /usr/local/bin/virtualenvwrapper.sh
if ! grep -q 'source /usr/local/bin/virtualenvwrapper.sh' /root/.bashrc;
then
cat >> /root/.bashrc <<EOF
source /usr/local/bin/virtualenvwrapper.sh
##[aquar config end]##
EOF
fi
mkvirtualenv aquar
workon aquar
pip install docker-compose

echo '********配置docker-compose********'
mkdir -p /opt/aquar/src/docker-compose/
touch /opt/aquar/src/docker-compose/docker-compose.yml
cat > /opt/aquar/src/docker-compose/docker-compose.yml <<EOF
version: "3"
services:
  aquarhome:
    image: finetu/aquarhome:latest
    container_name: aquarhome 
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    volumes:
      - /opt/aquar/storages/apps/aquarhome/data:/var/aquardata
      - /opt/aquar/storages/aquarpool:/opt/aquarpool
      - /opt/aquar/storages/apps/aquarhome/logs:/root/.pm2/logs
    ports:
      - 8172:8172
      - 10000-10100:10000-10100
    restart: unless-stopped
EOF
mkdir -p /opt/aquar/src/docker-compose/mariadb.init.d
touch /opt/aquar/src/docker-compose/mariadb.init.d/init.sql
cat > /opt/aquar/src/docker-compose/mariadb.init.d/init.sql <<EOF
CREATE DATABASE IF NOT EXISTS nextcloud;
CREATE DATABASE IF NOT EXISTS piwigo;
CREATE DATABASE IF NOT EXISTS shinobi;
CREATE DATABASE IF NOT EXISTS ccio;
CREATE DATABASE IF NOT EXISTS photoprism;
CREATE DATABASE IF NOT EXISTS filerun;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
EOF
cat >  /etc/docker/daemon.json <<EOF
{
"registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]
}
EOF

echo '********设置开机自启动docker-compose********'
cat >  /lib/systemd/system/aquar.service <<EOF
[Unit]
Description=Aquar service
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=root
Group=root
TimeoutStartSec=0
ExecStart=/usr/local/bin/aqserv start
SyslogIdentifier=aqserv

[Install]
WantedBy=multi-user.target
EOF
systemctl enable aquar

# 从gitlab下载源码包
# rz 选择aquar-home-master.zip
<<COMMENT
unzip -q aquar-home-master.zip
mv aquar-home-master aquar-home
cd /opt/aquar/src/aquar-home
./deploy_docker.sh
COMMENT

# pythone3.9


# 源码编译环境
git config --global http.sslverify false
git clone $gitrepo
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source /root/.bashrc
nvm install 16
nvm alias default 16
nvm use 16
cd /root/aquar-home/aquar_home_server/
npm install
