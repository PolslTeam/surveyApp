import Vue from "vue";
import jwt_decode from "jwt-decode";

export default {
  state: {
    userForms: []
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
    }
  }
};
