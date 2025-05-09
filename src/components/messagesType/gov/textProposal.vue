<template>
  <v-container>
    <v-row class="mt-4">
      <v-spacer></v-spacer>
      <!-- {{ selectPolicy }} -->
      <v-col v-if="viewJson" cols="12" sm="12" md="12">
        <vue-json-pretty
          :data="jsonData"
          show-line
          show-line-number
          show-length
          show-icon
        />
      </v-col>

      <v-col v-if="!viewJson" cols="12" sm="12" md="12">
        <v-text-field
          v-model="title"
          label="Title"
          required
          variant="outlined"
        ></v-text-field>
        <v-textarea
          v-model="description"
          label="Description"
          name="input-7-1"
          variant="outlined"
          auto-grow
        ></v-textarea>
        <v-btn elevation="2" @click="checkMsg">Check message</v-btn>
        <span v-if="showValidateData">
          {{ finalMsgProp }}
          <v-icon v-if="validateData" color="teal"> mdi-check </v-icon>

          <v-icon v-else color="red"> mdi-alert-circle </v-icon>
        </span>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import {
  defaultRegistryTypes,
  assertIsDeliverTxSuccess,
  SigningStargateClient,
  GasPrice,
  calculateFee,
} from "@cosmjs/stargate";
import { coin, coins } from "@cosmjs/proto-signing";
import bech32 from "bech32";
import { selectSigner, calculFee } from "@/libs/signer";
import { useAppStore } from "@/stores/data";
import cosmosConfig from "@/cosmos.config";

import * as gov from "cosmjs-types/cosmos/gov/v1beta1/gov";

export default {
  props: ["from"],

  data(props) {
    return {
      dialog: false,
      selectPolicy: props.from,
      toAddress: "",
      amount: "",
      viewJson: false,
      jsonData: "",
      validateData: false,
      showValidateData: false,
      policyAmount: "",
      title: "",
      description: "",
    };
  },
  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  async mounted() {
    console.log("mounted");
    console.log("mounted", this.from);
    let policyAmount = await this.store.getBankModule(this.selectPolicy);
    this.policyAmount = policyAmount;
  },
  computed: {},
  watch: {},
  methods: {
    async checkMsg() {
      console.log(gov.TextProposal);
      this.showValidateData = true;
      if (
        this.selectPolicy !== "" &&
        this.title !== "" &&
        this.description !== ""
      ) {
        this.validateData = true;

        const finalMsg = {
          typeUrl: gov.TextProposal.typeUrl,
          value: gov.TextProposal.encode(
            gov.TextProposal.fromPartial({
              title: this.title,
              description: this.description,
            }),
          ).finish(),
        };
        console.log("sendTx", finalMsg);

        this.store.addGroupMessageTextProp(finalMsg);
        // await this.$store.dispatch('data/formatFinalMsgProp', msgSend)
      } else this.validateData = false;
    },
    getMax() {
      this.amount = this.policyAmount;
      this.delegateAmount = this.policyAmount;
    },
  },
};
</script>
