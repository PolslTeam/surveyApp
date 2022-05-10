<template>
  <v-container fluid>
    <v-row>
      <v-col align="center" md="5" cols="12" sm="12">
        <v-card max-width="400" style="position:sticky; top: 20px;">
          <v-card-title> Form Settings </v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="settings.title"
                outlined
                type="text"
                label="title"
              />
              <v-textarea
                name="description"
                v-model="settings.description"
                outlined
                type="text"
                label="description"
              />
              <div style="padding-bottom: 12px; margin-bottom: 8px">
                authentication type
                <v-btn-toggle mandatory v-model="settings.authenticationType">
                  <v-btn value="logged" @click="setAnswerLimit(false)"
                    >logged</v-btn
                  >
                  <v-btn value="token" @click="setAnswerLimit(true)"
                    >token</v-btn
                  >
                </v-btn-toggle>
              </div>
              <v-text-field
                v-if="settings.authenticationType === 'token'"
                v-model.number="numberOfTokens"
                @change="settings.answer_limit = numberOfTokens"
                outlined
                type="number"
                :min="1"
                placeholder="Token numbers"
              >
              </v-text-field>
              <div v-for="{ field, label } of settingsDates" :key="field">
                <v-checkbox
                  :value="settings[field]"
                  @click="
                    settings[field] = settings[field] ? null : dateForPicker
                  "
                  :label="label"
                />
                <v-date-picker
                  v-if="settings[field]"
                  v-model="settings[field]"
                />
              </div>
              <div>
                <v-checkbox
                  :value="fillLimit"
                  @click="setAnswerLimit(!fillLimit)"
                  label="fill limit"
                />
                <v-text-field
                  v-if="fillLimit"
                  :disabled="settings.authenticationType === 'token'"
                  v-model.number="settings.answer_limit"
                  outlined
                  type="number"
                  :min="0"
                />
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn v-if="this.$route.params.editing" @click="edit" color="info">
              edit
            </v-btn>
            <v-btn v-else @click="create" color="info"> create </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col align="center" md="7" cols="12" sm="12">
        <v-card min-width="700" min-height="700">
          <v-card-text>
            <div>
              Add field:
              <v-btn-toggle dense>
                <v-btn
                  v-for="type of types"
                  :key="type"
                  @click="addField(type)"
                >
                  {{ type }}
                </v-btn>
              </v-btn-toggle>
            </div>
            <FieldsDisplayEdit :fields="fields" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FieldsDisplayEdit from "../components/FieldsDisplayEdit.vue";
export default {
  components: { FieldsDisplayEdit },
  name: "CreateEditForm",
  data() {
    return {
      fillLimit: false,
      settings: {
        title: "",
        description: "",
        authenticationType: "",
        start_date: null,
        end_date: null,
        answer_limit: null
      },
      numberOfTokens: null,
      fields: [],
      types: ["slider", "text", "list", "single choice"],
      settingsDates: [
        { field: "start_date", label: "set opening date" },
        { field: "end_date", label: "set closing date" }
      ],
      error: {}
    };
  },
  computed: {
    dateForPicker() {
      return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10);
    },
    editSurvey() {
      return this.$store.getters.editSurvey;
    }
  },
  mounted() {
    if (this.$route.params.editing) {
      if (!this.editSurvey.length) {
        this.getForm(this.$route.params.formId);
      }
    }
  },
  methods: {
    setAnswerLimit(n) {
      if (this.settings.authenticationType === "logged") {
        this.settings.answer_limit = this.settings.answer_limit ? null : 10;
      } else {
        this.settings.answer_limit =
          this.numberOfTokens === null ? 10 : this.numberOfTokens;
      }
      if (n) {
        this.fillLimit = true;
      } else {
        this.fillLimit = false;
        this.settings.answer_limit = null;
      }
    },
    edit() {
      this.$store
        .dispatch("EDIT_FORM", {
          settings: this.settings,
          fields: this.fields,
          formId: this.$route.params.formId
        })
        .then(() => {
          if (this.settings.authenticationType === "token") {
            this.$store.dispatch("GENERATE_TOKENS", {
              formId: this.$route.params.formId,
              numberOfTokens: this.numberOfTokens
            });
          }
          this.$router.push({ name: "Dashboard" });
        });
    },
    create() {
      this.$store
        .dispatch("CREATE_FORM", {
          settings: this.settings,
          fields: this.fields,
          numberOfTokens:
            this.settings.authenticationType === "token"
              ? this.numberOfTokens
              : null
        })
        .then(err => {
          if (err) this.error = err?.response?.data || {};
          else this.$router.push({ name: "Dashboard" });
        });
    },
    addField(type) {
      this.fields.push({
        type,
        question: "",
        required: false
      });
    },
    async getForm(formId) {
      await this.$store.dispatch("GET_FORM", formId);
      this.awaitChanges();
    },
    awaitChanges() {
      this.settings.title = this.editSurvey.title || "Provide valid title";
      this.settings.description = this.editSurvey.description || "";
      this.settings.authenticationType = this.editSurvey.login_required
        ? "logged"
        : "token";
      this.settings.answer_limit = this.editSurvey.answer_limit
        ? this.editSurvey.answer_limit
        : null;
      this.settings.start_date = this.editSurvey.start_date
        ? this.editSurvey.start_date.substr(0, 10)
        : null;
      this.settings.end_date = this.editSurvey.end_date
        ? this.editSurvey.end_date.substr(0, 10)
        : null;
      this.fields = this.editSurvey.fields || [];
      if (this.editSurvey.answer_limit) {
        this.fillLimit = true;
        if (!this.editSurvey.login_required) {
          this.numberOfTokens = this.editSurvey.answer_limit;
        }
      }
    }
  }
};
</script>
