<template>
  <v-container>
    <v-row v-for="(option, idx) of field.choices" :key="idx">
      <v-text-field
        v-model="field.choices[idx]"
        outlined
        type="text"
        :label="`answer ${idx + 1}`"
        dense
      >
        <template #append-outer>
          <v-btn
            icon
            @click="removeOption(idx)"
            :disabled="field.choices.length <= 2"
            style="margin-top: -5px;"
          >
            <v-icon color="error">
              mdi-close-circle-outline
            </v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </v-row>
    <v-btn color="accent" text @click="addOption">add more</v-btn>
  </v-container>
</template>

<script>
export default {
  name: "FieldChoiceEdit",
  props: {
    field: Object
  },
  methods: {
    addOption() {
      this.field.choices.push("");
    },
    removeOption(idx) {
      this.$delete(this.field.choices, idx);
    }
  },
  mounted() {
    if (!this.field.choices) this.$set(this.field, "choices", ["", ""]);
  }
};
</script>

<style scoped></style>
