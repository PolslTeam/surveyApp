import Vue from "vue";
import jwt_decode from "jwt-decode";

export default {
  state: {
    userForms: [],
    form: {},
    isFormLoading: true,
    loginRequired: true
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
    }
  }
};
