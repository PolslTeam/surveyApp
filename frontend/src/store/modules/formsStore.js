import Vue from "vue";
import jwt_decode from "jwt-decode";

export default {
  state: {
    userForms: [],
    userFilledForms: [],
    form: {},
    isFormLoading: true,
    areMyAnswersLoading: true,
    isAlreadyFilled: false,
    loginRequired: true,
    tokenList: []
  },
  mutations: {
    setEditFormFields(state, res) {
      state.editForm = res;
    },
    addForm(state, form) {
      const foundForm = state.userForms.findIndex(
        existingForm => existingForm.form_id === form.form_id
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
    setAreMyAnswersLoading(state, isLoading) {
      state.areMyAnswersLoading = isLoading;
    },
    setIsAlreadyFilled(state, isAlreadyFilled) {
      state.isAlreadyFilled = isAlreadyFilled;
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
    },
    fillForm(state, answers) {
      if (!state.form.fields) return;
      for(const field of state.form.fields) {
        const answer = answers.find(ans => [
            field.text_field_id,
            field.slider_field_id,
            field.singlechoice_field_id,
          ].includes(ans.field_id)
        );
        if(!answer) continue;
        field.answer = answer.answer;
      }
    },
    switchForm(state, formId) {
      const form = state.userForms.find(form => form.form_id === formId);
      form.is_active = !form.is_active;
      state.userForms = [...state.userForms];
    },
    switchFormArchivedStatus(state, formId) {
      state.userForms = state.userForms.filter(
        existingForm => existingForm.form_id !== formId
      );
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
            if (payload.numberOfTokens != null) {
              const formId = res.data.form_id;
              context.dispatch("GENERATE_TOKENS", {
                formId: formId,
                numberOfTokens: payload.numberOfTokens
              });
            }
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
    async GET_MY_ANSWERS(context, payload) {
      try {
        context.commit("setAreMyAnswersLoading", true);
        const response = await Vue.prototype.backendApi.get(
          `/survey/${payload.formId}/myAnswers`,
          {
            params: {
              respondent: payload.respondent,
              anonToken: payload.anonToken
            },
            headers: {
              "x-auth-token": sessionStorage.getItem("loginToken")
            }
          }
        );
        context.commit("setIsAlreadyFilled", !!response.data.answers);
        if (response.data.answers)
          context.commit("fillForm", response.data.answers);
      } catch (e) {
        console.log(e);
      } finally {
        context.commit("setAreMyAnswersLoading", false);
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
    },
    async GENERATE_TOKENS(context, payload) {
      try {
        const formId = payload.formId,
          numberOfTokens = payload.numberOfTokens;
        await Vue.prototype.backendApi
          .post("/generateTokens", {
            formId,
            numberOfTokens
          })
          .then(res => {
            context.commit("setTokenList", res.data);
          });
      } catch (e) {
        console.log(e);
        throw "error";
      }
    },
    async BLOCK_RESUME_FORM(context, formId) {
      try {
        const id = jwt_decode(sessionStorage.getItem("loginToken")).id;
        const response = await Vue.prototype.backendApi.patch(
          "/blockResumeForm",
          {
            data: {
              formId,
              id
            }
          }
        );
        if (response.data.switched) {
          context.commit("switchForm", formId);
        }
      } catch (e) {
        console.log(e);
        throw "error";
      }
    },
    async ARCHIVE_FORM(context, formId) {
      try {
        await Vue.prototype.backendApi
          .put("/archiveForm", { formId })
          .then(res => {
            context.commit("switchFormArchivedStatus", formId);
            if (res.data === "archived") {
              console.log("Survey archived");
            }
          });
      } catch (e) {
        console.log(e);
        throw "error";
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
