<template>
  <v-container>
    <v-row v-for="setting of settings" :key="setting.field" dense>
      <v-col>
        <v-row>
          <v-checkbox
            :label="setting.label"
            :value="field[setting.field]"
            :value-comparator="val => val !== undefined"
            @click="
              $set(
                field,
                setting.field,
                field[setting.field] ? undefined : setting.defValue
              )
            "
          />
        </v-row>
        <v-row v-if="field[setting.field] !== undefined">
          <v-text-field
            v-model.number="field[setting.field]"
            outlined
            type="number"
            :min="0"
            dense
          />
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "FieldTextEdit",
  props: {
    field: Object
  },
  data() {
    return {
      settings: [
        { field: "min_length", label: "minimum length", defValue: 3 },
      ]
    };
  }
};
</script>
