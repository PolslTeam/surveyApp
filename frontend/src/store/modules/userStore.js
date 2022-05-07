import Vue from "vue";

export default {
  state: {
    email: "",
    userLogged: false
  },
  mutations: {
    setEmail(state, email) {
      state.email = email;
    },
    setUserLogged(state, isLogged) {
      state.userLogged = isLogged;
    }
  },
  actions: {
    async LOGIN_USER(context, payload) {
      try {
        const { email, password, remember } = payload;
        const response = await Vue.prototype.backendApi.post("/login", {
          email,
          password
        });
        context.commit("setEmail", response.data.user.email);
        context.commit("setUserLogged", true);
        await sessionStorage.setItem("loginToken", response.data.token);
        if (remember) {
          Vue.$cookies.set(
            "loginToken",
            response.data.token,
            60 * 60 * 24 * 30
          );
        }
      } catch (e) {
        console.log(e);
      }
    },
    async REGISTER_USER(context, payload) {
      try {
        await Vue.prototype.backendApi.post("/register", payload);
      } catch (e) {
        console.log(e);
      }
    },
    LOG_OUT_USER(context) {
      context.commit("setEmail", "");
      context.commit("setUserLogged", false);
      sessionStorage.removeItem("loginToken");
      Vue.$cookies.remove("loginToken");
    }
  }
};
