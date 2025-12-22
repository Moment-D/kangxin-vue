// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })
const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack') // 引入webpack

module.exports = defineConfig({
  // 配置webpack兼容Node.js模块
  configureWebpack: {
    resolve: {
      fallback: {
        // 核心必需的模块（解决已出现的报错）
        "os": require.resolve("os-browserify/browser"),
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        // 修正util配置（用正确的包名）
        "util": require.resolve("util/"),
        // 其他不支持的模块直接禁用，避免报错
        "fs": false,
        "zlib": false,
        "net": false,
        "tls": false,
        "http": false, // 暂时禁用，后续报错再装stream-http
        "https": false, // 暂时禁用，后续报错再装https-browserify
        "url": false // 暂时禁用，后续报错再装url
      }
    },
    plugins: [
      // 注入process和Buffer到浏览器环境
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ],
    // 忽略无关警告
    ignoreWarnings: [/Failed to parse source map/, /EBADENGINE/]
  },
  // 确保依赖被转译
  transpileDependencies: true
})