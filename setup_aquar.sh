nfspath=$1
if [ "$nfspath" == "" ]; then
    echo "ERROR:未传入nfs地址作为脚本参数"
    exit 0
fi

echo '********开始初始化aquar环境********'
apt update
echo '********安装&挂载NFS********'
apt install nfs-common -y
mkdir -p /opt/aquar/storages/aquarpool/
echo 'mount nfs'
mount -t nfs $nfspath:/mnt/aquar_pool /opt/aquar/storages/aquarpool/
if ! grep -q '##\[aquar config start\]##' /etc/fstab;
then
    cat >> /etc/fstab <<EOF
##[aquar config start]##
$nfspath:/mnt/aquar_pool /opt/aquar/storages/aquarpool nfs defaults,_netdev 0 0
##[aquar config end]##
EOF
else
    echo '********探测到已配置成功，跳过/etc/fstab的配置********'
fi

echo '********安装python3及venv********'
apt install curl -y
apt install python3-pip -y
pip3 install virtualenv
pip3 install virtualenvwrapper
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
  nextcloud:
    image: nextcloud
    volumes:
      # 挂载配置文件
      - /opt/aquar/storages/apps/nextcloud:/var/www/html
      - /opt/aquar/storages/apps/nextcloud/apps:/var/www/html/custom_apps
      - /opt/aquar/storages/apps/nextcloud/config:/var/www/html/config
      - /opt/aquar/storages/apps/nextcloud/data:/var/www/html/data
      - /opt/aquar/storages/aquarpool:/opt/aquarpool
    ports:
      - "8081:80"
    depends_on:
      - "mariadb"
    restart: unless-stopped
  # jellyfin:
  #   image: ghcr.io/linuxserver/jellyfin
  #   container_name: jellyfin
  #   environment:
  #     - PUID=1000
  #     - PGID=1000
  #     - TZ="Asia/Shanghai"
  #     # - UMASK_SET=<022> #optional
  #   volumes:
  #   - /opt/aquar/storages/apps/jellyfin/config:/config
  #   - /opt/aquar/storages/apps/jellyfin/data/tvshows:/data/tvshows
  #   - /opt/aquar/storages/aquarpool/movies:/data/movies
  #   # - /opt/vc/lib:/opt/vc/lib #optional
  #   ports:
  #   - 8096:8096
  #   - 8920:8920 #optional
  #   - 7359:7359/udp #optional
  #   - 1900:1900/udp #optional
  #   restart: unless-stopped
  syncthing:
    image: ghcr.io/linuxserver/syncthing
    container_name: syncthing
    # hostname: syncthing #optional
    environment:
      - PUID=1000
      - PGID=1000
      - TZ="Asia/Shanghai"
    volumes:
      - /opt/aquar/storages/apps/syncthing/config:/config
      - /opt/aquar/storages/aquarpool:/opt/aquarpool
      # - /path/to/data1:/data1
    ports:
      - 8384:8384
      - 22000:22000
      - 21027:21027/udp
    restart: unless-stopped
  # photoprism:
  #   image: photoprism/photoprism:latest
  #   depends_on:
  #     - "mariadb"
  #   # restart: unless-stopped
  #   security_opt:
  #     - seccomp:unconfined
  #     - apparmor:unconfined
  #   ports:
  #     - 8042:2342 # [local port]:[container port]
  #   environment:
  #     PHOTOPRISM_ADMIN_PASSWORD: "<utf-8>"
  #     PHOTOPRISM_HTTP_PORT: 2342
  #     PHOTOPRISM_HTTP_COMPRESSION: "gzip"
  #     PHOTOPRISM_DEBUG: "false"
  #     PHOTOPRISM_PUBLIC: "false"
  #     PHOTOPRISM_READONLY: "false"
  #     PHOTOPRISM_EXPERIMENTAL: "false"
  #     PHOTOPRISM_DISABLE_WEBDAV: "false"
  #     PHOTOPRISM_DISABLE_SETTINGS: "false"
  #     PHOTOPRISM_DISABLE_TENSORFLOW: "false"
  #     PHOTOPRISM_DARKTABLE_PRESETS: "false"
  #     PHOTOPRISM_DETECT_NSFW: "false"
  #     PHOTOPRISM_UPLOAD_NSFW: "true"
  #     PHOTOPRISM_DATABASE_DRIVER: "mysql"
  #     PHOTOPRISM_DATABASE_SERVER: "mariadb:3306"
  #     PHOTOPRISM_DATABASE_NAME: "photoprism"
  #     PHOTOPRISM_DATABASE_USER: "root"
  #     PHOTOPRISM_DATABASE_PASSWORD: "root"
  #     PHOTOPRISM_SITE_URL: "http://39.100.115.231:8142/"
  #     PHOTOPRISM_SITE_TITLE: "PhotoPrism"
  #     PHOTOPRISM_SITE_CAPTION: "Browse Your Life"
  #     PHOTOPRISM_SITE_DESCRIPTION: ""
  #     PHOTOPRISM_SITE_AUTHOR: ""
  #   volumes:
  #     - "/opt/aquar/storages/aquarpool/images:/photoprism/originals"
  #     # Multiple folders can be indexed by mounting them as sub-folders of /photoprism/originals:
  #     # - "/mnt/Family:/photoprism/originals/Family"    # [folder_1]:/photoprism/originals/[folder_1]
  #     # - "/mnt/Friends:/photoprism/originals/Friends"  # [folder_2]:/photoprism/originals/[folder_2]
  #     # Mounting an import folder is optional (see docs):
  #     # - "~/Import:/photoprism/import"
  #     # Permanent storage for settings, index & sidecar files (DON'T REMOVE):
  #     - "/opt/aquar/storages/apps/photoprism/storage:/photoprism/storage"
  mariadb:
    image: mariadb:10.4
    volumes:
      - /opt/aquar/storages/apps/mariadb:/var/lib/mysql
      - /opt/aquar/src/docker-compose/mariadb.init.d:/docker-entrypoint-initdb.d
    environment:
      MYSQL_DATABASE: nextcloud
      MYSQL_ROOT_PASSWORD: root
      TZ: "Asia/Shanghai"
    command:
      [
      "--character-set-server=utf8mb4",
      "--collation-server=utf8mb4_unicode_ci",
      "--default-time-zone=+8:00",
      ]
    ports:
      - "3306:3306"
    restart: unless-stopped
  transmission:
    image: ghcr.io/linuxserver/transmission
    container_name: transmission
    environment:
      - PUID=1000
      - PGID=1000
      - TZ="Asia/Shanghai"
      - TRANSMISSION_WEB_HOME=/combustion-release/
      - USER=admin
      - PASS=admin
    volumes:
      - /opt/aquar/storages/apps/transmission/config:/config
      - /opt/aquar/storages/aquarpool/btdownload:/downloads
      - /opt/aquar/storages/apps/transmission/watch:/watch
    ports:
      - 9091:9091
      - 51413:51413
      - 51413:51413/udp
    restart: unless-stopped
  gitlab:
    image: 'gitlab/gitlab-ce:latest'
    restart: unless-stopped
    hostname: 'gitlab'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'https://39.100.115.231/'
        # Add any other gitlab.rb configuration here, each on its own line
    ports:
      - '8083:80'
      - '8084:443'
      - '8822:22'
    volumes:
      - '/opt/aquar/storages/apps/gitlab/config:/etc/gitlab'
      - '/opt/aquar/storages/apps/gitlab/logs:/var/log/gitlab'
      - '/opt/aquar/storages/apps/gitlab/data:/var/opt/gitlab'
  # aquarhome:
  #   image: aquar-home 
  #   container_name: aquarhome 
  #   environment:
  #     - PUID=1000
  #     - PGID=1000
  #     - TZ=Asia/Shanghai
  #   volumes:
  #     - /opt/aquar/storages/apps/aquarhome/data:/var/aquardata
  #     - /opt/aquar/storages/aquarpool:/opt/aquarpool
  #     - /opt/aquar/storages/apps/aquarhome/logs:/root/.pm2/logs
  #   ports:
  #     - 8172:8172
  #   restart: unless-stopped
EOF
mkdir -p /opt/aquar/src/docker-compose/mariadb.init.d
touch /opt/aquar/src/docker-compose/mariadb.init.d/init.sql
cat > /opt/aquar/src/docker-compose/mariadb.init.d/init.sql <<EOF
CREATE DATABASE IF NOT EXISTS nextcloud;
CREATE DATABASE IF NOT EXISTS piwigo;
CREATE DATABASE IF NOT EXISTS shinobi;
CREATE DATABASE IF NOT EXISTS ccio;
CREATE DATABASE IF NOT EXISTS photoprism;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON . TO 'root'@'%';
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

echo '********启动docker-compose********'
cd /opt/aquar/src/docker-compose/
docker-compose up -d
# systemctl start aquar