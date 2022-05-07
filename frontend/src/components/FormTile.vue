<template>
  <v-card>
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="12" lg="8">
          <v-card-title>
            <h2 style="text-align: start">
              {{ survey.title }}
            </h2>
            <p style="text-align: start; width: 100%;">
              Description: {{ survey.description }}
            </p>
          </v-card-title>
          <v-card-text>
            <v-container style="text-align: start">
              <v-row>
                <v-col>
                  <p>
                    Start date:
                    {{ survey.start_date ? survey.start_date : "Not set" }}
                  </p>
                  <p>
                    End date:
                    {{ survey.end_date ? survey.end_date : "Not set" }}
                  </p>
                  <p>
                    Answers limit:
                    {{ survey.answer_limit ? survey.answer_limit : "no limit" }}
                  </p>
                  <p>
                    {{ checkSurveyStatus() }}
                  </p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-col>
        <v-col cols="12" sm="12" md="12" lg="4" align="right">
          <v-row>
            <v-col>
              <v-btn
                :disabled="!availableTokens"
                color="accent"
                @click="getTokensList(survey.form_id)"
                >Tokens</v-btn
              >
            </v-col>
            <v-col>
              <v-btn
                color="warning"
                :disabled="!allowBlockResume"
                @click="blockResume(survey.form_id)"
              >
                {{ survey.is_active ? "Block" : "Resume" }} form
              </v-btn>
            </v-col>
            <v-col cols="6" sm="3" md="6" lg="12">
              <v-dialog persistent max-width="600">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="error" v-bind="attrs" v-on="on">
                    Remove form
                  </v-btn>
                </template>
                <template v-slot:default="dialog">
                  <v-card>
                    <v-card-title style="background-color: #ff5252;">
                      <h3>Confirm</h3>
                    </v-card-title>
                    <v-card-text align="center">
                      <p style="padding-top: 40px;">
                        After removing survey <b>you will loose access</b> to
                        it.
                      </p>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                      <v-btn text @click="dialog.value = false">Close</v-btn>
                      <v-btn
                        text
                        color="error"
                        @click="archiveForm(survey.form_id)"
                      >
                        Remove
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
            </v-col>
            <v-col cols="6" sm="3" md="6" lg="12">
              <v-btn @click="goToSurvey" text>View form</v-btn>
            </v-col>
            <v-col>
              <v-btn @click="copyLink" text>
                <v-icon>mdi mdi-content-copy</v-icon> copy link
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="openDialog" scrollable max-width="400px">
      <v-card>
        <v-card-title>Tokens</v-card-title>
        <v-divider />
        <v-card-text style="height: 400px">
          <div style="text-align: center">
            <v-virtual-scroll :items="getTokens" height="380" item-height="25">
              <template v-slot:default="{ item }">
                <v-list-item :key="item">
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ item }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-virtual-scroll>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn color="blue darken-1" @click="openDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "FormTile",
  props: {
    survey: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      allowBlockResume: true,
      allowEdit: false,
      allowResults: false,
      availableTokens: false,
      openDialog: false
    };
  },
  methods: {
    goToSurvey() {
      this.$router.push({
        name: "FillSurvey",
        params: {
          formId: this.survey.form_id
        }
      });
    },
    copyLink() {
      navigator.clipboard.writeText(
        "localhost:8080/survey/" + this.survey.form_id
      );
    },
    async getTokensList(formId) {
      await this.$store.dispatch("GET_TOKENS", { formId: formId });
      this.openDialog = true;
    },
    checkSurveyStatus() {
      const currentDate = new Date();
      if (this.survey.login_required === false) {
        this.availableTokens = true;
      }
      if (
        this.survey.start_date &&
        currentDate < new Date(this.survey.start_date)
      ) {
        this.allowEdit = true;
        this.allowBlockResume = false;
        return "Survey has not started yet";
      } else if (
        this.survey.end_date &&
        currentDate > new Date(this.survey.end_date)
      ) {
        this.allowResults = true;
        this.allowBlockResume = false;
        return "Survey has ended";
      } else if (this.survey.is_active) {
        return "Survey is active";
      }
      return "Survey is currently blocked";
    },
    async blockResume(formId) {
      await this.$store.dispatch("BLOCK_RESUME_FORM", formId);
    },
    async archiveForm(formId) {
      await this.$store.dispatch("ARCHIVE_FORM", formId);
    }
  },
  computed: {
    ...mapGetters(["getTokens"])
  }
};
</script>
