# Aquar Home
### 高度可定制的个人Home页，同时是强大的NAS服务控制台。

![responsive](https://gitee.com/firemaker/imgbed/raw/master/main.png)

AquarHome(水瓶Home页)是一个强大可定制，其本身具备基础导航功能（如搜索框、导航链接）的同时还适配了多种NAS常用服务的API，集成了NextCloud、Docker、Syncthing、TrueNas等服务，可以在同一页面直接看到各个服务的核心数据与最新状态。

![action](https://gitee.com/firemaker/imgbed/raw/master/readme_action.gif)

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
