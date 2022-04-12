import Vue from "vue";
import Vuex from "vuex";
import userStore from "./modules/userStore";
import formsStore from "./modules/formsStore";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    userStore,
    formsStore
  }
});

export default store;
