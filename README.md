# Aquar Home
### 高度可定制的个人Home页，同时是强大的NAS服务控制台。

![responsive](https://gitee.com/firemaker/aquar-home-helper/raw/master/images/readme_muti_client.png)

AquarHome(水瓶Home页)是一个强大可定制，其本身具备基础导航功能（如搜索框、导航链接）的同时还适配了多种NAS常用服务的API，集成了NextCloud、Docker、Syncthing、TrueNas等服务，可以在同一页面直接看到各个服务的核心数据与最新状态。

![action](https://gitee.com/firemaker/aquar-home-helper/raw/master/images/readme_action.gif)

AquarHome的核心特性：
- 适配各种开源服务api的组件
  - nextcloud文件浏览器
  - trueNas存储池状态监控
  - docker容器状态监控
  - Syncthing同步目录状态监控
  - PVE虚拟机状态监控
  - 基于rsync的文件增量备份组件
- 完善的Home页导航功能
  - 多尺寸的图标样式
  - 自定义上传图标
  - 自动抓取网站ico图标
  - 链接批量导入
  - 搜索框组件
- 页面适配移动端设备显示
- 所有组件大小位置可自定义
- 多标签页
- 同时支持登录信息验证与无登录验证
- 风格主题可选
- 背景图片可自定义

技术特性：
- vue+nodejs技术栈
- docker镜像
- 不依赖数据库

目前项目仍处于早期，更多组件已列入开发计划：
- todoList组件
- 日历组件
- 留言板&相册幻灯片
- rtsp推流监视器
- emby/jellyfin组件
- ...


## 快速开始

### Docker方式

AquarHome的部署推荐使用docker-compose方式。

0.docker及docker-compose的安装不是本文档的重点，请参考其他资料安装。

1.在准备好docker-compose环境后，创建一个新文件夹。

例如: `mkdir aquarhome`

2.在文件夹中创建一个docker-compose.yml文件。

`touch docker-compose.yml`

3.将下面的配置粘贴在文档中,然后根据你自己的目录结构指定好三个docker卷挂载点。

``` yml
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
      - your/path/to/data:/var/aquardata #数据目录，包含核心配置数据，缓存/上传文件等
      - your/path/to/aquarpool:/opt/aquarpool #供文件同步功能使用，若不需要此功能可选择一个空文件夹填写
      - /opt/aquar/storages/apps/aquarhome/logs:/root/.pm2/logs #日志文件
  ports:
      - 8172:8172
  restart: unless-stopped
```

4.在aquarhome目录下，执行使用docker-compose启动容器。顺便一提，由于docker-compose是一个python工具，而python有时会使用虚拟环境，如果你发现自己安装了docker-compose后仍然无法使用docker-compose命令，可以确认一下自己当前所在的pyhton环境到底是哪一个。

``` bash 
cd aquarhome
docker-compose up -d
```

5.docker-compose正常启动后，访问宿主机在内网中的地址，如192.168.0.117:8172，如果可以看到AquarHome的登录页面，就说明部署成功了。

### 源码方式

如果你的环境不方便使用docker，或者你需要根据自己的需求修改AquarHome的代码，可以使用源码方式部署AquarHome。

0.首先需要确保环境上安装有nodejs 14+版本，node安装不是本文重点，请参考其他资料安装确认。

1.从github或码云上下载源码，如果你有git，可以直接使用git clone下载源码。此外也可以在页面上下载zip文件然后在服务器上解压。
```
git clone https://gitee.com/firemaker/aquar-home.git
```

2.进入到项目目录下，执行如下语句。脚本每一步都有解释，你可以根据自己的情况自行增减。

``` bash
sudo -i # 以管理员身份进行操作
npm config set registry https://registry.npm.taobao.org # 将下载源切换为国内npm源
npm install -g pm2 # 安装pm2，作为运行nodejs的容器
cd /path/to/aquar-home
cd aquar_home_front # 进入前端项目目录
npm install # 安装依赖
npm run build # 构建前端项目
cd ../aquar_home_server # 进入后端项目
rm -rf public/static/ # 清空原有静态资源文件，下两行同义
rm -rf public/favicon.ico
rm -rf public/index.html
cp -r ../aquar_home_front/dist/* public/ # 将打包好的前端项目拷贝进后端项目中
npm install --unsafe-perm # 安装后端项目依赖，由于后端项目依赖sharp.js，需要在系统中安装图像处理的C语言库，所以需要管理员权限，且下载时速度较慢，如果超时请多试几次
npm run prd # 调用pm2运行项目
```

## 更进一步

AquarHome的开发理念是尽可能轻量化，所以采用了纯javascript的技术栈。在数据存储上摒弃了数据库，采用配置文件的方式进行数据持久话，这除了带来架构上的轻量以外，也使系统的配置数据有了极高的可读性与可移植性，可以方便的手动维护与迁移。

进入数据目录(docker容器中/var/aquardata的宿主机挂载点)后可以看到目录结构大致如下：

```
.
├── bg_img   <====背景图上传目录
│   └── 999af70a4c8bf2d3f9c9f26145ba6cc9.webp
├── cache <====组件缓存目录
│   └── nextcloud
│       └── thumb <====NextCloud组件的缩略图缓存
│           ├── 01e2faad43078be9022130aeaaa2505d.webp
│           ├── 03ac2910226dd17cbb436978d908d852.webp
│           ├── 0550386419f81fa4c89eb499fa8431b8.webp
│           ...
│
├── db <====AquarHome的核心配置数据
│   └── db.json
├── icon_img <====图标文件目录，包括上传的与自动抓取的图标
│   ├── 0b6a2e93ae151351.ico
│   ├── 7ca77f3c376d9412.ico
│   ├── 850ce3dbe85b1c3e04b5a4d41c97249d.webp
│   ├── 86bd2266437333aa.ico
│   ├── 87a178c91ca60635.ico
│   ...
└── log <====日志目录

```

其中/db/db.json是AquarHome的核心配置文件，文件格式是json，内容也简单易懂，我在上面进行简单地标注后你应该可以很容易地明白各项配置的意思。
``` json
{
  "auth": { # 权限验证信息，包含了系统自动生成的密钥，以及用户自定义的用户名与密码的MD5散列值
    "secret": "p3xkCUbUte",
    "userName": "firemaker",
    "password": "3b774fe4f5d86e9b112789a2708e1e91"
  },
  "config": { # 系统配置信息，包含了背景图片、背景虚化值、主题方案及背景颜色
    "current_index": 0,
    "appearance": {
      "bgColor": "#455A65",
      "bgImg": "/bg_img/6bf762336ffa3a8b2cd39474d2bbdc7c.webp",
      "bgBlur": "0",
      "theme": "defaultLight"
    }
  },
  "tabs": [ # 标签页数据，包含了标签页的标题及内涵的所有组件
    {
      "title": "导航",
      "widgets": [ # 组件列表
        {
          "id": "cbaf8dda-8e77-4ab4-a328-c13f78b2c386", # 组件的唯一id值
          "sort": 1, #排序属性，暂时未使用
          "name": "syncthing local", # 组件的名称
          "href": "http://localhost:8384", # 链接地址
          "image": "img/nextcloud.jpg", # 组件的图标地址
          "widget": "SyncthingWidget", # 标记这是一个Syncthing组件
          "layout": { # 标记其所在的座标及大小
            "x": 4,
            "y": 2,
            "w": 3,
            "h": 4,
            "i": "cbaf8dda-8e77-4ab4-a328-c13f78b2c386",
            "moved": false
          },
          "data": {
            "server": "http://localhost:8384", # 服务器地址
            "app_key": "mESCgd6imiPvTfVGojshHRSwcAd9SYzp" # 用户自行配置的app_key,用来通过syncthing接口的鉴权
          }
        }
      ]
    }
  ]
}
```

这种设计不仅可以让你更有力地掌控整个系统，也可以在需要时对系统进行快速的迁移，你只需要将整个数据目录打包，放在想要迁移的地方即可，或者只把db.json文件带走，在新系统里重新上传一遍图标。一切都可见可控。

## 更多组件详细文档

[图标链接配置说明](https://gitee.com/firemaker/aquar-home-helper/blob/master/app/Icon.md "图标链接配置说明")

[Docker配置说明](https://gitee.com/firemaker/aquar-home-helper/blob/master/app/Docker.md "Docker配置说明")

[NextCloud配置说明](https://gitee.com/firemaker/aquar-home-helper/blob/master/app/NextCloud.md "NextCloud配置说明")

[TrueNas配置说明](https://gitee.com/firemaker/aquar-home-helper/blob/master/app/TrueNas.md "TrueNas配置说明")

[Syncthing配置说明](https://gitee.com/firemaker/aquar-home-helper/blob/master/app/Syncthing.md "Syncthing配置说明")