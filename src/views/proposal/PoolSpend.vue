<template>
  <v-col cols="12" md="2"></v-col>

  <v-col cols="12" md="8">
    <v-sheet rounded="lg">
      <v-row>
        <v-col cols="12" md="6">
          <v-sheet border class="ma-2" rounded="lg">
            <v-toolbar class="rounded-t-lg">
              <v-toolbar-title>Proposal community pool spend</v-toolbar-title>
            </v-toolbar>
            <div class="mt-4 pa-2">
              <v-text-field
                v-model="proposalTitle"
                label="Proposal title"
                variant="outlined"
                required
                density="comfortable"
              ></v-text-field>
              <v-text-field
                v-model="proposalSummary"
                label="Proposal summary"
                variant="outlined"
                required
                density="comfortable"
              ></v-text-field>
              <v-textarea
                v-model="proposalDescription"
                label="Label"
                variant="outlined"
                density="comfortable"
              ></v-textarea>
              <v-text-field
                v-model="proposalMinDeposit"
                label="Minimum deposit"
                variant="outlined"
                required
                density="comfortable"
              ></v-text-field>
            </div>
          </v-sheet>
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

        <v-col cols="12" md="6">
          <v-sheet border class="ma-2" rounded="lg">
            <v-toolbar class="rounded-t-lg">
              <v-toolbar-title>Pool spend config</v-toolbar-title>
              <v-btn
                icon="mdi-plus-circle-outline"
                @click="addField(input, allMessages)"
              ></v-btn>
            </v-toolbar>

            <div
              v-for="(input, index) in allMessages"
              :key="`allMessages-${index}`"
              class="input wrapper flex items-center"
            >
              <v-toolbar class="mt-2">
                <template v-slot:prepend>
                  <span class="text-h6 font-weight-bold pa-2"
                    >Community Spend pool {{ index + 1 }}</span
                  >
                </template>

                <v-btn icon="mdi-information-outline"></v-btn>

                <v-btn
                  icon="mdi-delete-outline"
                  @click="removeField(index, allMessages)"
                ></v-btn>
              </v-toolbar>

              <div class="mt-2 pa-2">
                <v-text-field
                  v-model="input.recipient"
                  label="Send to address"
                  variant="outlined"
                  required
                  density="comfortable"
                ></v-text-field>
                <v-text-field
                  v-model="input.amount"
                  label="Amount to send"
                  variant="outlined"
                  required
                  density="comfortable"
                ></v-text-field>
              </div>

              <!--          Remove Svg Icon-->
              <!--           <svg
            v-show="allMessages.length > 1"
            @click="removeField(index, allMessages)"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            class="ml-2 cursor-pointer"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              fill="#EC4899"
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z"
            />
          </svg> -->
            </div>

            <v-btn v-if="allMessages.length > 0" @click="submitProposal" block>
              Submit proposal
            </v-btn>
          </v-sheet>
        </v-col>
      </v-row>
    </v-sheet>
  </v-col>
  <v-col cols="12" md="2"></v-col>
</template>

<script>
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import { coins } from "@cosmjs/proto-signing";
import cosmosConfig from "@/cosmos.config";
import { selectSigner } from "@/libs/signer";

import * as distrib from "cosmjs-types/cosmos/distribution/v1beta1/tx";

export default {
  components: {
    MarkdownRenderer,
  },
  data() {
    return {
      proposal: {
        title: "",
        description: "",
      },
      proposalMetadata:
        "https://gist.githubusercontent.com/atmoner/5ba0f830e97b61bf5f2a786dd75e2bed/raw/f518ce3bf8987a3066998d6226ccd0f1036ad5c1/metadata.json",
      proposalDescription:
        "### My proposal  \n\n --- \n Your proposal desciprion",
      proposalTitle: "My proposal title",
      proposalSummary: "My proposal summary",
      proposalMinDeposit: 10,

      sendTo: "",
      amount: "",

      allMessages: [
        {
          recipient: "",
          amount: "",
        },
      ],

      isError: false,
    };
  },
  methods: {
    async submitProposal() {
      console.log("Submitting proposal...");
      console.log(distrib.MsgCommunityPoolSpend);
      this.isSubmited = false;
      try {
        this.isSubmitting = true;

        let signer = await selectSigner(0);
        console.log("Signer:", signer);

        let userAddress = await signer.accounts[0].address;

        let finalMessages = [];
        for (let i = 0; i < this.allMessages.length; i++) {
          finalMessages.push(
            this.createMsg(
              this.allMessages[i].recipient,
              this.allMessages[i].amount,
            ),
          );
        }

        const textProposal = {
          typeUrl: "/cosmos.distribution.v1beta1.MsgCommunityPoolSpend",
          value: distrib.MsgCommunityPoolSpend.encode(
            distrib.MsgCommunityPoolSpend.fromPartial({
              authority: "dev10d07y265gmmuvt4z0w9aw880jnsr700j8mqrx0",
              recipient: this.allMessages[0].recipient,
              amount: coins(
                Math.floor(this.allMessages[0].amount * 1000000),
                "stake",
              ),
            }),
          ).finish(),
        };

        const msg = {
          typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
          value: {
            // messages: this.allMessages,
            messages: finalMessages,
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

        console.log("msg:", msg);

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
    createMsg(recipient, amount) {
      console.log("Creating message...");
      const msg = {
        typeUrl: "/cosmos.distribution.v1beta1.MsgCommunityPoolSpend",
        value: distrib.MsgCommunityPoolSpend.encode(
          distrib.MsgCommunityPoolSpend.fromPartial({
            authority: "dev10d07y265gmmuvt4z0w9aw880jnsr700j8mqrx0",
            recipient: recipient,
            amount: coins(Math.floor(amount * 1000000), "stake"),
          }),
        ).finish(),
      };
      return msg;
    },
    addField(value, fieldType) {
      fieldType.push({
        recipient: "",
        amount: "",
      });
    },
    removeField(index, fieldType) {
      fieldType.splice(index, 1);
    },
  },
};
</script>
