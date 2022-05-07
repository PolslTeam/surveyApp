import Vue from "vue";
import jwt_decode from "jwt-decode";

export default {
  state: {
    userForms: [],
    userFilledForms: [],
    form: {},
    isFormLoading: true,
    loginRequired: true,
    tokenList: []
  },
  mutations: {
    setEditFormFields(state, res) {
      state.editForm = res;
    },
    addForm(state, form) {
      const foundForm = state.userForms.findIndex(
        existingForm => existingForm._id === form._id
      );
      if (foundForm >= 0) {
        state.userForms[foundForm] = form;
      } else {
        state.userForms.push(form);
      }
    },
    setForm(state, form) {
      state.form = form;
    },
    setIsFormLoading(state, isLoading) {
      state.isFormLoading = isLoading;
    },
    setLoginRequired(state, isRequired) {
      state.loginRequired = isRequired;
    },
    setUserForms(state, res) {
      state.userForms = res.forms;
    },
    setFilledForms(state, res) {
      state.userFilledForms = res.forms;
    },
    setTokenList(state, res) {
      state.tokenList = res;
    },
    resetTokenList(state) {
      state.tokenList = [];
    }
  },
  actions: {
    async GET_FORM(context, formId) {
      try {
        const id = jwt_decode(sessionStorage.getItem("loginToken")).id;
        const response = await Vue.prototype.backendApi.get("/getForm", {
          params: { id, formId }
        });
        context.commit("setEditFormFields", response.data);
      } catch (e) {
        console.log(e);
      }
    },
    async CREATE_FORM(context, payload) {
      try {
        const user_id = jwt_decode(sessionStorage.getItem("loginToken")).id;
        await Vue.prototype.backendApi
          .post("/createForm", {
            settings: payload.settings,
            fields: payload.fields,
            user_id
          })
          .then(res => {
            // TODO: generate tokens if needed
            context.commit("addForm", res.data);
          });
      } catch (e) {
        console.log(e);
        return e;
      }
    },
    async SET_FORM(context, payload) {
      try {
        context.commit("setIsFormLoading", true);
        const response = await Vue.prototype.backendApi.get(
          `/survey/${payload.formId}`,
          {
            params: {
              anonToken: payload?.anonToken
            },
            headers: {
              "x-auth-token": sessionStorage.getItem("loginToken")
            }
          }
        );
        context.commit("setForm", response.data);
      } catch (e) {
        console.log(e);
      } finally {
        context.commit("setIsFormLoading", false);
      }
    },
    async CREATE_SURVEY(context, payload) {
      try {
        await Vue.prototype.backendApi.post("/survey", payload);
      } catch (e) {
        console.log(e);
      }
    },
    async CHECK_SURVEY_TYPE(context, formId) {
      try {
        const response = await Vue.prototype.backendApi.get(
          `/survey/${formId}/type`
        );
        context.commit("setLoginRequired", response.data);
      } catch (e) {
        console.log(e);
      }
    },
    async GET_USER_FORMS(context) {
      try {
        const id = jwt_decode(sessionStorage.getItem("loginToken")).id;
        const response = await Vue.prototype.backendApi.get("/getUserForms", {
          params: { id }
        });
        context.commit("setUserForms", response.data);
      } catch (e) {
        console.log(e);
      }
    },
    async GET_FILLED_FORMS(context) {
      try {
        const id = jwt_decode(sessionStorage.getItem("loginToken")).id;
        const response = await Vue.prototype.backendApi.get("/getFilledForms", {
          params: { id }
        });
        context.commit("setFilledForms", response.data);
      } catch (e) {
        console.log(e);
      }
    },
    async GET_TOKENS(context, payload) {
      try {
        const formId = payload.formId;
        context.commit("resetTokenList");
        await Vue.prototype.backendApi
          .get("/getTokens", {
            params: { formId }
          })
          .then(res => {
            context.commit("setTokenList", res.data);
          });
      } catch (e) {
        console.log(e);
      }
    }
  },
  getters: {
    userSurveys(state) {
      return state.userForms;
    },
    filledSurveys(state) {
      return state.userFilledForms;
    },
    getTokens(state) {
      return state.tokenList;
    }
  }
};
