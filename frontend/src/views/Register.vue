<template>
  <v-container fill-height fluid>
    <v-row align="center" justify="center">
      <v-col align="center">
        <v-card max-width="400">
          <v-card-title>
            Register
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
                  :rules="[
                  customRules.required,
                  customRules.min,
                  customRules.oneDigit,
                  customRules.oneCapital,
                  customRules.oneSpecial
                ]"
              />
              <v-text-field
                  v-model="passwordConfirm"
                  outlined
                  type="password"
                  label="Confirm password"
                  placeholder=" "
                  persistent-placeholder
                  :rules="[customRules.required, customRules.samePasswords]"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn text :to="{ name: 'Login' }" color="info">
              login
            </v-btn>
            <v-spacer />
            <v-btn @click="register(email, password)" color="info">
              register
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: "Register",
  data() {
    return {
      email: "",
      password: "",
      passwordConfirm: "",
      isFormValid: false,
      customRules: {
        required: value => !!value || "Field is required",
        email: value =>
            !value ||
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
            "E-mail is not valid",
        min: value =>
            (value && value.length >= 8) ||
            "Use 8 or more characters for your password",
        oneDigit: value =>
            (value && /\d/.test(value)) ||
            "Password must contain at least one digit",
        oneCapital: value =>
            (value && /[A-Z]{1}/.test(value)) ||
            "Password must contain at least one capital latter",
        oneSpecial: value =>
            (value && /[^A-Za-z0-9]/.test(value)) ||
            "Password must contain at least one special character",
        samePasswords: value => {
          return this.password === value || "Passwords must match";
        }
      }
    };
  },
  methods: {
    async register(email, password) {
      if (this.isFormValid) {
        await this.$store
            .dispatch("REGISTER_USER", {
              email,
              password
            })
            .then(async () => await this.$router.push({ name: "Login" }));
      } else {
        this.$refs.form.validate();
      }
    }
  }
};
</script>