<template>
  <v-col cols="12" md="2"></v-col>
  <v-col cols="12" md="8">
    <v-sheet rounded="lg">
      <v-stepper v-model="stepper" :items="items">
        <template v-slot:item.1>
          <v-card title="Step One" flat>
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
              label="Detailed description"
              variant="outlined"
            ></v-textarea>
            <v-text-field
              v-model="proposalForumUrl"
              label="Proposal forum URL"
              variant="outlined"
            ></v-text-field>

            <v-text-field
              v-model="voteOptionContext"
              label="Vote Option Context"
              variant="outlined"
              required
            ></v-text-field>
            <v-btn class="ma-2" block @click="">Generate json metadata</v-btn>
          </v-card>
        </template>

        <template v-slot:item.2>
          <v-card title="Step Two" flat>
            <v-text-field
              v-model="proposalMetadata"
              label="Proposal metadata URL"
              variant="outlined"
              required
            ></v-text-field>
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

            <v-text-field
              v-model="proposalMinDeposit"
              label="Proposal deposit"
              variant="outlined"
              required
            ></v-text-field>
          </v-card>
        </template>

        <template v-slot:item.3>
          <v-card class="justify-center" title="Step Three" flat>
            <div class="text-center">
              <v-progress-circular
                v-if="!isSubmited"
                indeterminate
                :size="128"
              ></v-progress-circular>
              <v-icon
                v-if="isSubmited"
                icon="mdi-check-circle-outline"
                size="128"
                color="green"
              ></v-icon>
              <h2 v-if="isSubmited">Proposal submitted successfully</h2>
              <h2 v-if="!isSubmited">Submitting proposal...</h2>
              <h5 v-if="isSubmited">Transaction hash: {{ returnTxInfo }}</h5>
            </div>
          </v-card>
        </template>
      </v-stepper>

      <!--       <v-row>
        <v-col cols="12" md="6">
          <v-sheet border class="ma-2" rounded="lg">
            <v-toolbar class="rounded-t-lg">
              <v-toolbar-title>Proposal Text config</v-toolbar-title>
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
      </v-row> -->
    </v-sheet>
  </v-col>
  <v-col cols="12" md="2"></v-col>
</template>

<script>
import { coins } from "@cosmjs/proto-signing";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import cosmosConfig from "@/cosmos.config";
import { selectSigner } from "@/libs/signer";

export default {
  components: {
    MarkdownRenderer,
  },
  data() {
    return {
      cosmosConfig: cosmosConfig,
      proposal: {
        title: "",
        description: "",
      },
      proposalDescription:
        "### My proposal  \n\n --- \n Your proposal desciprion",
      proposalTitle: "My proposal title",
      proposalSummary: "My proposal summary",
      proposalMetadata:
        "https://gist.githubusercontent.com/atmoner/5ba0f830e97b61bf5f2a786dd75e2bed/raw/f518ce3bf8987a3066998d6226ccd0f1036ad5c1/metadata.json",
      voteOptionContext: "",
      proposalForumUrl: "",
      proposalMinDeposit: "",

      govConfig: "",
      //
      stepper: 1,
      items: ["Step 1", "Step 2", "Step 3"],
      step3Started: false,
      isSubmitting: false,
      isSubmited: false,
      returnTxInfo: null,
    };
  },
  watch: {
    stepper(newValue) {
      console.log("Stepper changed:", newValue);
      if (newValue === 3) {
        this.step3Started = true;
        this.submitProposal();
      }
    },
  },
  mounted() {
    fetch(this.cosmosConfig[0].apiURL + `/cosmos/gov/v1/params/deposit`) // /cosmos/auth/v1beta1/params
      .then((response) => response.json())
      .then((data) => {
        console.log("Module parameters:", data);
        this.govConfig = data;
        this.proposalMinDeposit =
          data.deposit_params.min_deposit[0].amount / 1000000;
        // Process the parameters as needed
      })
      .catch((error) => {
        console.error("Error fetching module parameters:", error);
      });
  },
  methods: {
    async submitProposal() {
      console.log("Submitting proposal...");
      this.isSubmited = false;
      try {
        this.isSubmitting = true;

        let signer = await selectSigner(0);
        console.log("Signer:", signer);

        let userAddress = await signer.accounts[0].address;

        const msg = {
          typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
          value: {
            messages: [],
            initialDeposit: coins(
              Math.floor(this.proposalMinDeposit * 1000000),
              "stake",
            ),
            proposer: userAddress,
            metadata: this.proposalMetadata,
            title: this.proposalTitle,
            summary: this.proposalSummary,
          },
        };

        const fee = {
          amount: coins(5000, "stake"),
          gas: "300000",
        };

        const result = await signer.client.signAndBroadcast(
          userAddress,
          [msg],
          fee,
        );
        this.isSubmited = true;
        this.returnTxInfo = result.transactionHash;

        console.log("Proposal submitted successfully:", result);
      } catch (error) {
        console.error("Error submitting proposal:", error);
        this.step3Started = false;
        this.stepper = 1;
      }
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
