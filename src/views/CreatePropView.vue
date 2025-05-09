<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="2"> </v-col>

      <v-col cols="12" md="8">
        <v-sheet rounded="lg">
          <v-row>
            <v-col cols="12" md="4">
              <v-card
                border
                prepend-icon="mdi-tooltip-text-outline"
                text="Create a text proposal onchain"
                title="Text proposal"
                class="ma-2"
                @click="proposalTypeSelected = 'text'"
              ></v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card
                border
                prepend-icon="mdi-cash-multiple"
                text="Create a community pool spend proposal"
                title="Community pool spend"
                class="ma-2"
                @click="proposalTypeSelected = 'community-pool-spend'"
              ></v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card
                border
                prepend-icon="mdi-code-json"
                text="Create update module parameters proposal"
                title="Update module parameters"
                class="ma-2"
                @click="proposalTypeSelected = 'update-parameters'"
              ></v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card
                border
                prepend-icon="mdi-update"
                text="Create a software upgrade proposal"
                title="Software upgrade"
                class="ma-2"
                @click="proposalTypeSelected = 'software-upgrade'"
              ></v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card
                border
                prepend-icon="mdi-close-circle-outline"
                text="Create a cancel software upgrade proposal"
                title="Cancel software upgrade"
                class="ma-2"
                @click="proposalTypeSelected = 'cancel-software-upgrade'"
              ></v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card
                border
                prepend-icon="mdi-application-braces-outline"
                text="Create an other proposal type"
                title="Other proposal type"
                class="ma-2"
                @click="proposalTypeSelected = 'other'"
              ></v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>

      <v-col cols="12" md="2"> </v-col>
    </v-row>
  </v-container>

  <v-container>
    <v-row v-if="proposalTypeSelected === 'text'">
      <ProposalText />
    </v-row>
    <v-row v-if="proposalTypeSelected === 'community-pool-spend'">
      <ProposalCommunityPoolSpend />
    </v-row>
    <v-row v-if="proposalTypeSelected === 'update-parameters'">
      <ProposalUpdateParameters />
    </v-row>
    <v-row v-if="proposalTypeSelected === 'software-upgrade'">
      <ProposalSoftwareUpgrade />
    </v-row>
    <v-row v-if="proposalTypeSelected === 'cancel-software-upgrade'">
      <ProposalCancelSoftwareUpgrade />
    </v-row>
    <v-row v-if="proposalTypeSelected === 'other'">
      <ProposalOther />
    </v-row>
  </v-container>
</template>
<script>
import { useRoute } from "vue-router";
import { useAppStore } from "@/stores/data";
import cosmosConfig from "@/cosmos.config";
import {
  defaultRegistryTypes,
  assertIsDeliverTxSuccess,
  SigningStargateClient,
  GasPrice,
  calculateFee,
} from "@cosmjs/stargate";
import { selectSigner, calculFee } from "@/libs/signer";
import axios from "axios";

import ProposalText from "@/views/proposal/Text.vue";

import ProposalSoftwareUpgrade from "@/views/proposal/SoftwareUpgrade.vue";
import ProposalCancelSoftwareUpgrade from "@/views/proposal/CancelSoftwareUpgrade.vue";
import ProposalCommunityPoolSpend from "@/views/proposal/PoolSpend.vue";
import ProposalOther from "@/views/proposal/Other.vue";
import ProposalUpdateParameters from "@/views/proposal/UpdateParameters.vue";

export default {
  components: {
    MarkdownRenderer: () => import("@/components/MarkdownRenderer.vue"),
    ProposalText,
    ProposalSoftwareUpgrade,
    ProposalCancelSoftwareUpgrade,
    ProposalCommunityPoolSpend,
    ProposalOther,
    ProposalUpdateParameters,
  },
  data: () => ({
    proposalType: "",
    proposalTypes: [
      "text",
      "software-upgrade",
      "cancel-software-upgrade",
      "community-pool-spend",
      "other",
    ],
    proposalTypeSelected: "",
  }),
  async mounted() {
    console.log("Mounted CreatePropView");
    await axios
      .get(`http://cosmdev.com:1317/cosmos/auth/v1beta1/module_accounts`)
      .then((response) => {
        console.log("Module Accounts:", response.data);

        this.allAccountModules = response.data.accounts;
      })
      .catch((error) => {
        console.error("Error fetching module accounts:", error);
      });
  },
  methods: {
    async createProposal() {
      const appStore = useAppStore();
      const route = useRoute();
      const client = await SigningStargateClient.connectWithSigner(
        cosmosConfig.rpc,
        selectSigner(appStore),
        {
          registry: defaultRegistryTypes,
          aminoTypes: defaultRegistryTypes,
          gasPrice: GasPrice.fromString(cosmosConfig.fees.default),
        },
      );

      const fee = calculateFee(200000, cosmosConfig.fees.default);
      const result = await client.signAndBroadcast(
        appStore.address,
        [
          /* your transaction here */
        ],
        fee,
        "Create proposal",
      );
      assertIsDeliverTxSuccess(result);
    },
  },
  mounted() {
    const appStore = useAppStore();
    if (!appStore.address) {
      //this.$router.push({ name: "home" });
    }
  },
};
</script>
