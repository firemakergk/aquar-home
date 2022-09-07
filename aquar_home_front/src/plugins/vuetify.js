import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'
Vue.use(Vuetify);

export default new Vuetify({
    theme: { 
      dark: false,
      options: { 
        customProperties: true ,
        // themeCache: {
        //   get: key => localStorage.getItem(key),
        //   set: (key, value) => localStorage.setItem(key, value),
        // }
      },
      themes: {
        light: {
          primary: colors.indigo,
          secondary: colors.grey,
          accent: colors.green,
          warning: colors.amber,
          error: colors.deepOrange,
        },
        dark: {
          primary: colors.cyan,
          secondary: colors.grey,
          accent: colors.green,
          warning: colors.amber,
          error: colors.deepOrange,
        }
      }
    },
    icons: {
        iconfont: 'mdi', // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
      },
});
