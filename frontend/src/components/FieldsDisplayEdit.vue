<template>
  <v-container>
    <v-row v-for="(field, idx) of fields" :key="idx">
      <v-col>
        <v-card elevation="8">
          <v-card-title>
            <v-text-field
              v-model="field.question"
              type="text"
              label="question"
            />
            <v-spacer />
            <v-btn color="error" @click="removeField(idx)">
              <v-icon>
                mdi-cancel
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col md="2" cold="2"
                ><p>Type: {{ field.type }}</p>
                <v-checkbox v-model="field.required" label="required"
              /></v-col>
              <v-col>
                <FieldTextEdit
                  v-if="field.type.toLowerCase() === 'text'"
                  :field="field"
                />
                <FieldSliderEdit
                  v-else-if="field.type.toLowerCase() === 'slider'"
                  :field="field"
                />
                <FieldChoiceEdit
                  v-else-if="
                    ['single choice', 'SingleChoice', 'list'].includes(
                      field.type
                    )
                  "
                  :field="field"
                />
                <p v-else>{{ field.type }} type not handled</p>
                <p v-if="error && error.form_pos == idx" class="red--text">{{error.message}}</p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FieldTextEdit from "./FieldsTypesEdit/FieldTextEdit.vue";
import FieldSliderEdit from "./FieldsTypesEdit/FieldSliderEdit.vue";
import FieldChoiceEdit from "./FieldsTypesEdit/FieldChoiceEdit.vue";
export default {
  components: { FieldTextEdit, FieldSliderEdit, FieldChoiceEdit },
  name: "FieldsDisplayEdit",
  props: {
    fields: Array,
    error: Object
  },
  methods: {
    removeField(idx) {
      this.$delete(this.fields, idx);
    }
  }
};
</script>

<style scoped></style>
