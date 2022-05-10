<template>
  <v-card style="height: 250px;" @click="createSurvey()">
    <v-card-title>
      <h1 style="text-align: start">
        Create new form
      </h1>
    </v-card-title>
    <v-card-text>
      <v-icon style="font-size: 8rem; margin-top: 1.5rem;">mdi mdi-plus</v-icon>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: "NewFormTile",
  methods: {
    createSurvey() {
      this.$router.push({
        name: "CreateEditForm"
      });
    }
  }
};
</script>
