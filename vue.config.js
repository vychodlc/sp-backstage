module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'assets': '@/assets',
        'common': '@/common',
        'components': '@/components',
        'network': '@/network',
        'views': '@/views',
      }
    }
  },
  devServer: {
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: "http://api.bupt404.cn/sp/",
        // target: process.env.VUE_APP_URL,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '/'
        }
      }
    },
    // public: '10.28.148.88:8080',
  },
  publicPath: './'
}