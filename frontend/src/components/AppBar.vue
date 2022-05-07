<template>
  <v-container
    v-if="showAppBar"
    style="padding: 0 !important; z-index: 999"
    fluid
  >
    <v-toolbar height="50" style>
      <v-toolbar-title>
        <router-link class="dashboard-link" :to="{ name: 'Dashboard' }">
          <v-icon style="font-size: 30px;"
            >mdi mdi-cellphone-information</v-icon
          >
          Forms App
        </router-link>
      </v-toolbar-title>
      <v-spacer />
      <v-btn v-if="loggedIn" @click="logoutUser">
        Logout
        <v-icon>mdi mdi-exit-to-app</v-icon>
      </v-btn>
      <v-btn v-else @click="goToLogin">
        Login
        <v-icon>mdi mdi-account</v-icon>
      </v-btn>
    </v-toolbar>
  </v-container>
</template>
<script>
export default {
  name: "AppBar",
  methods: {
    logoutUser() {
      this.$store.dispatch("LOG_OUT_USER");
      this.$router.go();
    },
    goToLogin() {
      this.$router.push({ name: "Login" });
    }
  },
  computed: {
    showAppBar() {
      return this.$route.name !== "Login" && this.$route.name !== "Register";
    },
    loggedIn() {
      return "loggedIn" in this.$route.params
        ? this.$route.params.loggedIn
        : true;
    }
  }
};
</script>
<style scoped>
.dashboard-link {
  font-size: 30px;
  text-decoration: none;
  color: black;
  font-weight: 4;
}
</style>
