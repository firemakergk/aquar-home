# /bin/bash
pm2 stop all
git -C /opt/aquar/src/aquar_home/aquar_home_server pull
git -C /opt/aquar/src/aquar_home/aquar_home_front pull
cd aquar_home_front
npm install
npm run build
cd ../aquar_home_server
rm -rf public/static/
rm -rf public/favicon.ico
rm -rf public/index.html
cp -r ../aquar_home_front/dist/* public/
npm install
npm run prd
