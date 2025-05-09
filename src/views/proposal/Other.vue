<template>
  <v-col cols="12" md="2"></v-col>
  <v-col cols="12" md="8">
    <v-sheet rounded="lg">
      <v-row>
        <v-col cols="12" md="6">
          <v-sheet border class="ma-2" rounded="lg">
            <v-toolbar class="rounded-t-lg">
              <v-toolbar-title>Other Proposal </v-toolbar-title>
            </v-toolbar>
            <div class="mt-4 pa-2">
              <v-text-field
                v-model="proposalTitle"
                label="Proposal title"
                variant="outlined"
                required
              ></v-text-field>
              <v-text-field
                v-model="proposalSummary"
                label="Proposal summary"
                variant="outlined"
                required
              ></v-text-field>
              <v-textarea
                v-model="proposalDescription"
                label="Label"
                variant="outlined"
              ></v-textarea>
              <v-text-field
                v-model="proposalMinDeposit"
                label="Minimum deposit"
                variant="outlined"
                required
              ></v-text-field>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" md="6">
          <v-sheet border class="ma-2" rounded="lg">
            <v-toolbar class="rounded-t-lg">
              <v-toolbar-title>Proposal preview</v-toolbar-title>
            </v-toolbar>
            <MarkdownRenderer
              :source="proposalDescription"
              :title="'## ' + proposalTitle + ' \n---'"
              :summary="proposalSummary"
            />
          </v-sheet>
        </v-col>
      </v-row>
    </v-sheet>
  </v-col>
  <v-col cols="12" md="2"></v-col>
</template>

<script>
export default {
  data() {
    return {
      proposal: {
        title: "",
        description: "",
      },
    };
  },
  methods: {
    submitProposal() {
      console.log("Proposal submitted:", this.proposal);
      // Add logic to handle proposal submission
    },
  },
};
</script>

<style scoped>
.create-text-proposal {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.btn-submit {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn-submit:hover {
  background-color: #0056b3;
}
</style>
