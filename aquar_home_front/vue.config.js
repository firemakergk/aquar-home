'use strict'
const path = require('path')
const fs = require('fs')
// const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const port = process.env.port || process.env.npm_config_port || 9528 // dev port

module.exports = {
  publicPath: '/',
  outputDir: 'dist',

  // assetsDir: 'assets',
  lintOnSave: process.env.NODE_ENV === 'development',

  productionSourceMap: false,

  devServer: {
    host: '0.0.0.0',
    port: port,
    open: true,
    https: {
      key: fs.readFileSync(path.join(__dirname, './cert/aquar.key')),
      cert: fs.readFileSync(path.join(__dirname, './cert/aquar.crt'))
    },
    proxy: {
      '/api': {
        // target: 'http://39.100.115.231:8130',
        target: 'https://localhost:8172',
        secusecure: false,
        changeOrigin: true,
        disableHostCheck: true,
        // onProxyReq: function(proxyReq, req, res, options) {
        //   // 由于vue中使用了body-parser 导致http中的body被序列化两次，从而使得配置代理后后端无法获取body中的数据
        //   if (req.body) {
        //     const reg = new RegExp('application/json')
        //     if (reg.test(proxyReq.getHeader('Content-Type'))) {
        //       const bodyData = JSON.stringify(req.body)
        //       proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
        //       // stream the content
        //       proxyReq.write(bodyData)
        //     }
        //   }
        // }
        // headers: {
        //   host: 'http://localhost:3000',
        //   origin: 'http://localhost:3000'
        // }
        // pathRewrite: {
        //   '^/api': '/'
        // }
      },
      '/img': {
        // target: 'http://39.100.115.231:8130',
        target: 'https://localhost:8172',
        changeOrigin: true
        // pathRewrite: {
        //   '^/api': '/'
        // }
      },
      '/icon_img': {
        // target: 'http://39.100.115.231:8130',
        target: 'https://localhost:8172',
        changeOrigin: true,
        disableHostCheck: true
      },
      '/bg_img': {
        // target: 'http://39.100.115.231:8130',
        target: 'https://localhost:8172',
        changeOrigin: true,
        disableHostCheck: true
      },
      '/assets': {
        // target: 'http://39.100.115.231:8130',
        target: 'https://localhost:8172',
        changeOrigin: true,
        disableHostCheck: true
      },
      '/socket.io': {
        target: 'https://localhost:8172',
        changeOrigin: true,
        disableHostCheck: true
      }
    },
    overlay: {
      warnings: false,
      errors: true
    },
    // before: require('./mock/mock-server.js')
  },

  // chainWebpack(config) {
  //   // config.resolve.alias.set('@', resolve('./src'))
  //   // it can improve the speed of the first screen, it is recommended to turn on preload
  //   config.plugin('preload').tap(() => [
  //     {
  //       rel: 'preload',
  //       // to ignore runtime.js
  //       // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
  //       fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
  //       include: 'initial'
  //     }
  //   ])
  //   // when there are many pages, it will cause too many meaningless requests
  //   config.plugins.delete('prefetch')
  //   // set svg-sprite-loader
  //   config.module
  //     .rule('svg')
  //     .exclude.add(resolve('src/icons'))
  //     .end()
  //   config.module
  //     .rule('icons')
  //     .test(/\.svg$/)
  //     .include.add(resolve('src/icons'))
  //     .end()
  //     .use('svg-sprite-loader')
  //     .loader('svg-sprite-loader')
  //     .options({
  //       symbolId: 'icon-[name]'
  //     })
  //     .end()
  //   config
  //     .when(process.env.NODE_ENV !== 'development',
  //       config => {
  //         config
  //           .plugin('ScriptExtHtmlWebpackPlugin')
  //           .after('html')
  //           .use('script-ext-html-webpack-plugin', [{
  //           // `runtime` must same as runtimeChunk name. default is `runtime`
  //             inline: /runtime\..*\.js$/
  //           }])
  //           .end()
  //         config
  //           .optimization.splitChunks({
  //             chunks: 'all',
  //             cacheGroups: {
  //               libs: {
  //                 name: 'chunk-libs',
  //                 test: /[\\/]node_modules[\\/]/,
  //                 priority: 10,
  //                 chunks: 'initial' // only package third parties that are initially dependent
  //               },
  //               elementUI: {
  //                 name: 'chunk-elementUI', // split elementUI into a single package
  //                 priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
  //                 test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
  //               },
  //               commons: {
  //                 name: 'chunk-commons',
  //                 test: resolve('src/components'), // can customize your rules
  //                 minChunks: 3, //  minimum common number
  //                 priority: 5,
  //                 reuseExistingChunk: true
  //               }
  //             }
  //           })
  //         // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
  //         config.optimization.runtimeChunk('single')
  //       }
  //     )
  // }
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: 'Aquar Home',
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': resolve('src')
      }
    },
    devtool: 'source-map'
  },

  transpileDependencies: [
    'vuetify'
  ]
}
