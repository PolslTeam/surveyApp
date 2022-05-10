<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col v-if="!loading && form.form_id" md="6">
        <v-row>
          <v-col>
            <v-card class="px-3">
              <v-card-title v-if="isAlreadyFilled" class="justify-center red">
                You already filled this form.
              </v-card-title>
              <v-card-title class="justify-center text-h4">
                {{ form.title }}
              </v-card-title>

              <v-card-subtitle v-if="form.description">
                Description: {{ form.description }}
              </v-card-subtitle>
              <v-card-subtitle v-else>No description provided.</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-form ref="form" v-model="validForm" lazy-validation>
              <v-row
                v-for="(field, index) in form.fields"
                :key="field._id"
                justify="center"
              >
                <v-col>
                  <v-card class="px-3">
                    <v-card-title>
                      {{ index + 1 }}.
                      {{ field.question }}
                      <span v-if="field.required" class="red--text">
                        &nbsp;*
                      </span>
                    </v-card-title>
                    <v-card-actions>
                      <v-row>
                        <v-col md="6">
                          <template v-if="'slider_field_id' in field">
                            <v-slider
                              v-model="field.answer"
                              :readonly="isAlreadyFilled"
                              :min="field.min"
                              :max="field.max"
                              :thumb-label="isAlreadyFilled ? 'always' : true"
                            ></v-slider>
                          </template>
                          <template v-if="'text_field_id' in field">
                            <v-text-field
                              dense
                              v-model="field.answer"
                              :readonly="isAlreadyFilled"
                              counter
                              :maxlength="field.max_length"
                              :rules="
                                field.required
                                  ? [
                                      rules.general,
                                      v =>
                                        !field.min_length ||
                                        (!!v && v.length >= field.min_length) ||
                                        `Min ${field.min_length} characters`,
                                      v =>
                                        !field.max_length ||
                                        (!!v && v.length <= field.max_length) ||
                                        `Max ${field.max_length} characters`
                                    ]
                                  : []
                              "
                            ></v-text-field>
                          </template>
                          <template v-if="'singlechoice_field_id' in field">
                            <v-radio-group
                              v-if="!field.is_list"
                              v-model="field.answer"
                              :readonly="isAlreadyFilled"
                              required
                              :rules="field.required ? [rules.radio] : []"
                            >
                              <v-radio
                                v-for="(choice, index) in field.options"
                                :key="index"
                                :value="choice.option_id"
                                :label="choice.option"
                              >
                              </v-radio>
                            </v-radio-group>
                            <v-select
                              v-else
                              v-model="field.answer"
                              :readonly="isAlreadyFilled"
                              :items="field.options"
                              item-value="option_id"
                              item-text="option"
                              :rules="field.required ? [rules.general] : []"
                            ></v-select>
                          </template>
                        </v-col>
                      </v-row>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn v-if="!isAlreadyFilled" @click="submit">Submit</v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-col v-else-if="!isLoginRequired" md="6">
        <v-card>
          <v-card-title class="justify-center">
            Please provide token to see this survey
          </v-card-title>
          <v-row justify="center">
            <v-col md="6">
              <v-text-field v-model="anonField" dense></v-text-field>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer />
            <v-btn color="accent" @click="verifyAnonToken">Verify</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col v-else-if="!loading" class="red">
        <v-row class="justify-center">error loading form</v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from "vue";
export default {
  name: "FillSurvey",
  data() {
    return {
      anonField: "",
      validForm: true,
      rules: {
        general: v => !!v || "This field is required",
        radio: v => v !== null || "This field is required",
        checkbox: v => v.length > 0
      }
    };
  },
  async created() {
    const formId = this.$route.params.formId;
    await this.$store.dispatch("CHECK_SURVEY_TYPE", formId);
    if (this.isLoginRequired) {
      let response = null;
      const token = sessionStorage.getItem("loginToken");
      if (token) {
        response = await Vue.prototype.backendApi.post(
          "/token-validation",
          {},
          {
            headers: {
              "x-auth-token": token
            }
          }
        );
      }
      if (!response) await this.$router.push({ name: "Login" });
      const payload = {
        formId: this.$route.params.formId,
        respondent: token
      };
      this.setForm(payload);
    } else {
      this.setForm({});
    }
  },
  methods: {
    verifyAnonToken() {
      const payload = {
        formId: this.$route.params.formId,
        anonToken: this.anonField
      };
      this.setForm(payload);
    },
    async setForm(payload) {
      await this.$store.dispatch("SET_FORM", payload);
      if (!("form_id" in this.form))
        await this.$router.push({ name: "Dashboard" });
      await this.$store.dispatch("GET_MY_ANSWERS", payload);
    },
    async submit() {
      await this.$refs.form.validate();
      if (!this.validForm) return;
      const payload = {
        formId: this.form.form_id,
        respondent: this.isLoginRequired
          ? sessionStorage.getItem("loginToken")
          : this.anonField,
        answers: this.form.fields.map(field => {
          return {
            type: field.singlechoice_field_id
              ? "choice"
              : field.text_field_id
              ? "text"
              : "slider",
            field_id: field.singlechoice_field_id
              ? field.singlechoice_field_id
              : field.text_field_id
              ? field.text_field_id
              : field.slider_field_id,
            answer: field.answer
          };
        })
      };
      await this.$store.dispatch("CREATE_SURVEY", payload).then(async () => {
        const jwt = this.isLoginRequired
          ? sessionStorage.getItem("loginToken")
          : this.anonField;
        await this.setForm({
          formId: this.form.form_id,
          respondent: jwt,
          anonToken: jwt
        });
      });
    }
  },
  computed: {
    form() {
      return this.$store.state.formsStore.form;
    },
    isFormLoading() {
      return this.$store.state.formsStore.isFormLoading;
    },
    areMyAnswersLoading() {
      return this.$store.state.formsStore.areMyAnswersLoading;
    },
    loading() {
      return this.isFormLoading || this.areMyAnswersLoading;
    },
    isLoginRequired() {
      return this.$store.state.formsStore.loginRequired;
    },
    isAlreadyFilled() {
      return this.$store.state.formsStore.isAlreadyFilled;
    },
    lengthRule(min, max) {
      return [
        v => v.length >= min || `Min ${min} characters`,
        v => v.length <= max || `Max ${max} characters`
      ];
    }
  }
};
</script>
