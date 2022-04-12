<template>
  <v-container>
    <v-text-field
      v-model.number="field.min"
      outlined
      type="number"
      label="minimum value"
      :min="0"
      :max="field.max"
      dense
    />
    <v-text-field
      v-model.number="field.max"
      outlined
      type="number"
      label="maximum value"
      :min="Math.max(field.min + 1, 1)"
      dense
    />
  </v-container>
</template>

<script>
export default {
  name: "FieldSliderEdit",
  props: {
    field: Object
  }
};
</script>
