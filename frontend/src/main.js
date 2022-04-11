import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import store from "./store";
import axios from "axios";

Vue.config.productionTip = false;
const backendApi = axios.create({
  baseURL: "http://127.0.0.1:5000/api"
});

Vue.prototype.backendApi = backendApi;

Vue.use(require("vue-cookies"));

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount("#app");