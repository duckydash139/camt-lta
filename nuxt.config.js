module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'CAMT - Learning through activities',
    meta: [
      {
        charset: 'utf-8'
      }, {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      }
    ]
  },
  loading: { color: '#594a42' },
  /*
  ** Global CSS
  */
  // css: ['~/assets/css/main.css'],
  /*
  ** Add axios globally
  */
  build: {
    extend (config) {
      config.resolve.alias['vue'] = 'vue/dist/vue.common'
    },
    vendor: ['axios', 'tui-image-editor']
    /*
    ** Run ESLINT on save
    */
    // extend (config, ctx) {
    //   if (ctx.isClient) {
    //     config.module.rules.push({enforce: 'pre', test: /\.(js|vue)$/, loader: 'eslint-loader', exclude: /(node_modules)/})
    //   }
    // }
  },
  plugins: ['~plugins/buefy', '~plugins/vue-datetime', '~plugins/async-computed', '~plugins/directives/drag'],
  modules: [
    '@nuxtjs/font-awesome'
  ]
}
