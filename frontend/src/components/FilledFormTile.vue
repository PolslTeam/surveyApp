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
  }
};
</script>
