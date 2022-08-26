import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'
Vue.use(Vuetify);

export default new Vuetify({
    theme: { 
      dark: false,
      options: { customProperties: true },
      themes: {
        light: {
          primary: colors.indigo,
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
