import Vue from "vue";
import jwt_decode from "jwt-decode";

export default {
  state: {
    email: "",
    userLogged: false,
    users: []
  },
  mutations: {
    setEmail(state, email) {
      state.email = email;
    },
    setUserLogged(state, isLogged) {
      state.userLogged = isLogged;
    },
    setUsers(state, res) {
      state.users = res.users;
    },
    switchUser(state, user_id) {
      const user = state.users.find(user => user.user_id === user_id);
      user.is_blocked = !user.is_blocked
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
        return response.data.user.userType;
      } catch (e) {
        console.log(e);
        return -1;
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
    },

    async GET_USERS(context) {
      try {
        const id = jwt_decode(sessionStorage.getItem("loginToken")).id;
        const response = await Vue.prototype.backendApi.get("/getUsers", {
          params: { id }
        });
        context.commit("setUsers", response.data);
      } catch (e) {
        console.log(e);
      }
    },
    async BLOCK_UNBLOCK_USER(context, user_id) {
      try {
        const response = await Vue.prototype.backendApi.patch(
          "/blockUnblockUser",
          {
            data: {
              user_id
            }
          }
        );
        if (response.data.switched) {
          context.commit("switchUser", user_id);
        }
      } catch (e) {
        console.log(e);
        throw "error";
      }
    },
  },
  getters: {
    users(state) {
      return state.users;
    }
  }
};
