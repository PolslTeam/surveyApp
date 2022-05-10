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
    tokenList: [],
    editForm: [],
    elementsToRemove: []
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
    setElementsToRemove(state, elementToRemove) {
      const temArr = state.elementsToRemove;
      temArr.push(elementToRemove);
      state.elementsToRemove = temArr;
    },
    resetElementsToRemove(state) {
      state.elementsToRemove = [];
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
      for (const field of state.form.fields) {
        const answer = answers.find(ans =>
          [
            field.text_field_id,
            field.slider_field_id,
            field.singlechoice_field_id
          ].includes(ans.field_id)
        );
        if (!answer) continue;
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
    async ADD_TOREMOVE(context, payload) {
      try {
        context.commit("setElementsToRemove", payload);
      } catch (e) {
        console.log(e);
      }
    },
    async GET_FORM(context, formId) {
      try {
        const id = jwt_decode(sessionStorage.getItem("loginToken")).id;
        const response = await Vue.prototype.backendApi.get("/getForm", {
          params: {
            user_id: id,
            form_id: formId
          }
        });
        context.commit("setEditFormFields", response.data);
      } catch (e) {
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
      }
    },
    async EDIT_FORM(context, payload) {
      try {
        await Vue.prototype.backendApi
          .put("/editForm", {
            settings: payload.settings,
            fields: payload.fields,
            form_id: payload.formId,
            fieldToRem: context.state.elementsToRemove
          })
          .then(res => {
            context.commit("resetElementsToRemove");
            context.commit("POST_ERROR", {
              status: "success",
              message: "Form edited successfully",
              timestamp: Date.now()
            });
            context.commit("addForm", res.data);
          });
      } catch (e) {
        console.log(e);
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
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
            context.commit("POST_ERROR", {
              status: "success",
              message: "Survey created successfully",
              timestamp: Date.now()
            });
          });
      } catch (e) {
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
        throw "error";
      }
    },
    async SET_FORM(context, payload) {
      try {
        context.commit("setIsFormLoading", true);
        context.commit("setForm", {});
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
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
      } finally {
        context.commit("setIsFormLoading", false);
      }
    },
    async CREATE_SURVEY(context, payload) {
      try {
        await Vue.prototype.backendApi.post("/survey", payload);
        context.commit("POST_ERROR", {
          status: "success",
          message: "Answers saved",
          timestamp: Date.now()
        });
      } catch (e) {
        context.commit("POST_ERROR", {
          status: "error",
          message: "Answers not saved",
          timestamp: Date.now()
        });
      }
    },
    async CHECK_SURVEY_TYPE(context, formId) {
      try {
        const response = await Vue.prototype.backendApi.get(
          `/survey/${formId}/type`
        );
        context.commit("setLoginRequired", response.data);
      } catch (e) {
        context.commit("setLoginRequired", null);
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
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
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
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
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
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
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
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
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
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
            context.commit("POST_ERROR", {
              status: "success",
              message: "Tokens created successfully",
              timestamp: Date.now()
            });
          });
      } catch (e) {
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
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
          context.commit("POST_ERROR", {
            status: "success",
            message: "Survey status changed",
            timestamp: Date.now()
          });
        }
      } catch (e) {
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
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
            context.commit("POST_ERROR", {
              status: "success",
              message: "Survey archived",
              timestamp: Date.now()
            });
          });
      } catch (e) {
        context.commit("POST_ERROR", {
          status: "error",
          message: e.response.data.message,
          timestamp: Date.now()
        });
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
    },
    editSurvey(state) {
      return state.editForm;
    }
  }
};
