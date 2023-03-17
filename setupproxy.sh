# sudo -i
pubip=$1
if [ "$pubip" == "" ]; then
    echo "ERROR:未传入节点的公网ip地址作为脚本参数"
    exit 0
fi
echo '********清理被阿里云污染的源配置信息********'
/dev/null > /root/.pip/pip.conf
/dev/null > /root/.pydistutils.cfg
cp /etc/apt/sources.list /etc/apt/sources.list.bak
cat > /etc/apt/sources.list <<EOF
deb http://cn.archive.ubuntu.com/ubuntu/ jammy main restricted
deb http://cn.archive.ubuntu.com/ubuntu/ jammy-updates main restricted
deb http://cn.archive.ubuntu.com/ubuntu/ jammy universe
deb http://cn.archive.ubuntu.com/ubuntu/ jammy-updates universe
deb http://cn.archive.ubuntu.com/ubuntu/ jammy multiverse
deb http://cn.archive.ubuntu.com/ubuntu/ jammy-updates multiverse
deb http://cn.archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu jammy-security main restricted
deb http://security.ubuntu.com/ubuntu jammy-security universe
deb http://security.ubuntu.com/ubuntu jammy-security multiverse

EOF

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
  openvpn:
    image: kylemanna/openvpn:latest
    container_name: openvpn
    cap_add:
      - NET_ADMIN
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - /opt/aquar/storages/apps/openvpn/:/etc/openvpn
    ports:
      - 45632:1194
      - 45632:1194/udp
    restart: unless-stopped
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

echo '********设置开机自启动docker-compose********'
OVPN_DATA=/opt/aquar/storages/apps/openvpn
# docker volume create --name $OVPN_DATA
# 初始化配置
docker run -v $OVPN_DATA:/etc/openvpn --rm kylemanna/openvpn ovpn_genconfig -u udp://$pubip
# 生成私钥
docker run -v $OVPN_DATA:/etc/openvpn --rm -it kylemanna/openvpn ovpn_initpki
# 启动服务端容器
# docker run -v $OVPN_DATA:/etc/openvpn -d -p 1194:1194/udp --cap-add=NET_ADMIN kylemanna/openvpn
# 生成客户端凭证
echo 'docker run -v /opt/aquar/storages/apps/openvpn:/etc/openvpn --rm -it kylemanna/openvpn easyrsa build-client-full aquarproxy nopass'
# 导出配置文件至/root/aquarproxy.ovpn
echo 'docker run -v /opt/aquar/storages/apps/openvpn:/etc/openvpn --rm kylemanna/openvpn ovpn_getclient aquarproxy > /root/aquarproxy.ovpn'

## 客户端安装openvpn
# sudo apt-get install openvpn
# sudo openvpn --config aquarproxy.ovpn