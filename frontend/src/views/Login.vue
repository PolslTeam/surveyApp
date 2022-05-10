<template>
  <v-container fill-height fluid>
    <v-row align="center" justify="center">
      <v-col align="center">
        <v-card max-width="400">
          <v-card-title>
            Login
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="isFormValid">
              <v-text-field
                v-model="email"
                outlined
                type="text"
                label="Email"
                placeholder=" "
                persistent-placeholder
                :rules="[customRules.required, customRules.email]"
              />
              <v-text-field
                v-model="password"
                outlined
                type="password"
                label="Password"
                placeholder=" "
                persistent-placeholder
                :rules="[customRules.required]"
                @keypress.enter="login(email, password)"
              />
              <v-checkbox
                v-model="remember"
                label="Remember me for 30 days"
              ></v-checkbox>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn text :to="{ name: 'Register' }" color="info">
              register
            </v-btn>
            <v-spacer />
            <v-btn @click="login(email, password)" color="info">
              login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      remember: false,
      isFormValid: false,
      customRules: {
        required: value => !!value || "Field is required",
        email: value =>
          !value ||
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
          "E-mail is not valid"
      }
    };
  },
  methods: {
    async login(email, password) {
      if (this.isFormValid) {
        await this.$store
          .dispatch("LOGIN_USER", { email, password, remember: this.remember })
          .then(async userType => {
            switch (userType) {
              case -1:
                break;
              case 1:
                await this.$router.push({ name: "AdminDashboard" });
                break;
              default:
                await this.$router.push({ name: "Dashboard" });
            }
          });
      } else {
        this.$refs.form.validate();
      }
    }
  }
};
</script>
