<template>
  <v-card>
    <v-card-title>
      <h1 style="text-align: start">
        {{ survey.form.title }}
      </h1>
      <v-spacer />
      <p style="text-align: start; width: 100%;">
        Description: {{ survey.form.description }}
      </p>
      <v-btn @click="goToSurvey" text>View form</v-btn>
    </v-card-title>
  </v-card>
</template>
<script>
export default {
  name: "FormTile",
  props: {
    survey: {
      type: Object,
      required: true
    }
  },
  methods: {
    goToSurvey() {
      this.$router.push({
        name: "FillSurvey",
        params: {
          formId: this.survey.form_id
        }
      });
    }
  }
};
</script>
