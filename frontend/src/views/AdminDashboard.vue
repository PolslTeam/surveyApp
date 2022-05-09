<template>
  <v-container>
    <h1 align="center" class="green">Admin panel</h1>
    <v-row>
      <v-col align="center" md="6" cols="12">
        <h1>
          Forms:
        </h1>
        <v-container class="dashboard-main">
          <v-row v-for="form of allForms" :key="form.form_id">
            <v-col>
              <form-tile :survey="form" />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col align="center" md="6" cols="12">
        <h1>
          Users:
        </h1>
        <v-container class="dashboard-main">
          <v-row v-for="user of users" :key="user.id">
            <v-col>
                <user-tile :user="user" />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FormTile from "../components/FormTile";
import UserTile from "../components/UserTile";
export default {
  name: "AdminDashboard",
  components: { FormTile, UserTile },
  methods: {
    async getAllForms() {
      await this.$store.dispatch("GET_USER_FORMS");
    },
    async getUsers() {
      await this.$store.dispatch("GET_USERS");
    }
  },
  mounted() {
    this.getAllForms();
    this.getUsers();
  },
  computed: {
    allForms() {
      return this.$store.getters.userSurveys;
    },
    users() {
      return this.$store.getters.users;
    }
  }
};
</script>
<style>
.dashboard-main {
  height: calc(100vh - 130px);
  overflow-y: auto;
}
</style>
