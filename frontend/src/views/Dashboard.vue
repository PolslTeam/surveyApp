<template>
  <v-container>
    <v-btn @click="logoutUser">
      Logout
      <v-icon>mdi mdi-exit-to-app</v-icon>
    </v-btn>
    <v-row>
      <v-col align="center" md="6" cols="12">
        <h1>
          Your forms:
        </h1>
        <v-container class="dashboard-main">
          <v-row>
            <v-col>
              <new-form-tile />
            </v-col>
          </v-row>
          <v-row v-for="survey of userSurveys" :key="survey.form_id">
            <v-col>
              <form-tile :survey="survey" />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col align="center" md="6" cols="12">
        <h1>
          Forms filled by you:
        </h1>
        <v-container class="dashboard-main">
          <v-row v-for="survey of filledSurveys" :key="survey.form_id">
            <v-col>
              <filled-form-tile :survey="survey" />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FormTile from "../components/FormTile";
import NewFormTile from "@/components/NewFormTile";
import FilledFormTile from "../components/FilledFormTile";
export default {
  name: "Dashboard",
  components: { FormTile, NewFormTile, FilledFormTile },
  methods: {
    async getUserForms() {
      await this.$store.dispatch("GET_USER_FORMS");
    },
    async getFilledForms() {
      await this.$store.dispatch("GET_FILLED_FORMS");
    },
    logoutUser() {
      this.$store.dispatch("LOG_OUT_USER");
      this.$router.go();
    }
  },
  mounted() {
    if (!this.userSurveys.length) {
      this.getUserForms();
    }
    this.getFilledForms();
  },
  computed: {
    userSurveys() {
      return this.$store.getters.userSurveys;
    },
    filledSurveys() {
      return this.$store.getters.filledSurveys;
    }
  }
};
</script>
<style>
.dashboard-main {
  height: calc(100vh - 100px);
  overflow-y: auto;
}
</style>
