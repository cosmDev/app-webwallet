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
          v-model="selectPolicy"
          label="From address"
          required
          variant="outlined"
          disabled
        ></v-text-field>
        <v-text-field
          v-model="toAddress"
          label="To address"
          required
          variant="outlined"
        ></v-text-field>
        <v-select
          v-model="valueAuthz"
          :items="itemsAuthz"
          label="Select authz type"
          variant="outlined"
        ></v-select>
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
import { selectSigner, calculFee } from "../../libs/signer";
import { useAppStore } from "@/stores/data";
import cosmosConfig from "../../cosmos.config";

import {
  GenericAuthorization,
  GrantAuthorization,
} from "cosmjs-types/cosmos/authz/v1beta1/authz";

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
      itemsAuthz: ["Send", "Delegate", "Redelegate", "Get Rewards", "Vote"],
      valueAuthz: "Vote",
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
      this.showValidateData = true;
      if (
        this.selectPolicy !== "" &&
        this.toAddress !== "" &&
        this.valueAuthz !== ""
      ) {
        this.validateData = true;

        let signer = await selectSigner(this.store.chainSelected);

        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === "/cosmos.authz.v1beta1.MsgGrant",
        );
        console.log("test", defaultRegistryTypes);

        let finalType = "";
        switch (this.valueAuthz) {
          case "Send":
            finalType = "/cosmos.bank.v1beta1.MsgSend";
            break;
          case "Delegate":
            finalType = "/cosmos.staking.v1beta1.MsgDelegate";
            break;
          case "Unbond":
            finalType = "/cosmos.staking.v1beta1.MsgUndelegate";
            break;
          case "Redelegate":
            finalType = "/cosmos.staking.v1beta1.MsgBeginRedelegate";
            break;
          case "Get Rewards":
            finalType =
              "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
            break;
          case "Vote":
            finalType = "/cosmos.gov.v1beta1.MsgVote";
            break;
        }

        const authzMsg = {
          typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
          value: GenericAuthorization.encode(
            GenericAuthorization.fromPartial({
              msg: finalType,
            }),
          ).finish(),
        };

        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                granter: this.selectPolicy,
                grantee: this.toAddress,
                grant: {
                  authorization: authzMsg,
                },
              }),
            )
            .finish(),
        };
        console.log(finalMsg);

        this.store.addGroupMessage(finalMsg);
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
