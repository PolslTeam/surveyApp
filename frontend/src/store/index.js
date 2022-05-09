import Vue from "vue";
import Vuex from "vuex";
import userStore from "./modules/userStore";
import formsStore from "./modules/formsStore";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    alerts: []
  },
  mutations: {
    POST_ERROR: (state, payload) => {
      if (payload.message && payload.message.length) {
        state.alerts.push(payload);
        setTimeout(() => {
          state.alerts.shift();
        }, 2000);
      }
    }
  },
  modules: {
    userStore,
    formsStore
  }
});

export default store;
