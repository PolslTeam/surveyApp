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
                :max="255"
              />
              <v-text-field
                v-model="settings.description"
                outlined
                type="text"
                label="description"
                :max="255"
              />
              <div style="padding-bottom: 12px; margin-bottom: 8px">
                authentication type
                <v-btn-toggle mandatory v-model="settings.authenticationType">
                  <v-btn value="logged">logged</v-btn>
                  <v-btn value="token">token</v-btn>
                </v-btn-toggle>
              </div>
              <v-text-field
                v-if="settings.authenticationType === 'token'"
                v-model.number="numberOfTokens"
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
                  :value="settings.answer_limit !== null"
                  @click="
                    settings.answer_limit = settings.answer_limit ? null : 10
                  "
                  label="fill limit"
                />
                <v-text-field
                  v-if="settings.answer_limit !== null"
                  v-model.number="settings.answer_limit"
                  outlined
                  type="number"
                  :min="0"
                />
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="create" color="info">
              create
            </v-btn>
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
            <FieldsDisplayEdit :fields="fields" :error="error" />
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
  name: "CreateForm",
  data() {
    return {
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
    }
  },
  methods: {
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
    }
  }
};
</script>
