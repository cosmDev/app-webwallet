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
          v-model="selectAddress"
          label="From address"
          required
          variant="outlined"
          disabled
          class="mt-4"
        ></v-text-field>
        <v-select
          v-model="valSelected"
          :items="allDelegations"
          item-title="text"
          item-value="value"
          label="From validator"
          return-object
          required
          variant="outlined"
        ></v-select>
        <v-text-field
          v-if="valSelected !== ''"
          v-model="redelegatedAmount"
          label="Redelegate Amount"
          required
          variant="outlined"
        ></v-text-field>
        <v-select
          v-model="valSelectedTo"
          :items="allValidators"
          item-title="text"
          item-value="value"
          label="To validator"
          return-object
          required
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
import { selectSigner, calculFee } from "@/libs/signer";
import { useAppStore } from "@/stores/data";
import cosmosConfig from "@/cosmos.config";

export default {
  props: ["from"],

  data(props) {
    return {
      dialog: false,
      selectAddress: props.from,
      toAddress: "",
      amount: "",
      viewJson: false,
      jsonData: "",
      validateData: false,
      showValidateData: false,
      toggle_exclusive: 0,
      allDelegations: [],
      valSelected: "",
      valSelectedTo: "",
      redelegatedAmount: "",
      allValidators: [],
    };
  },
  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  watch: {
    valSelected: function (val) {
      console.log("valSelected", val);
      this.redelegatedAmount = val.value;
    },
  },
  async mounted() {
    console.log("mounted");
    console.log("mounted", this.from);
    let allDelegations = await this.store.getWalletDelegations(
      this.selectAddress,
    );
    let getWalletRewards = await this.store.getWalletRewards(
      this.selectAddress,
    );

    console.log("walletDelegations", this.store.walletDelegations);
    for (let i = 0; i < this.store.walletDelegations.length; i++) {
      console.log("walletDelegations", this.store.walletDelegations[i]);
      this.allDelegations.push({
        text:
          this.store.walletDelegations[i].delegation.validatorAddress +
          " - " +
          this.store.walletDelegations[i].balance.amount / 1000000,
        value: this.store.walletDelegations[i].balance.amount / 1000000,
        validatorAddress:
          this.store.walletDelegations[i].delegation.validatorAddress,
      });
    }

    for (let i = 0; i < this.store.allValidators.length; i++) {
      this.allValidators.push({
        text: this.store.allValidators[i].description.moniker,
        value: this.store.allValidators[i].operatorAddress,
      });
    }
  },
  computed: {},

  methods: {
    async checkMsg() {
      this.showValidateData = true;
      if (
        this.selectAddress !== "" &&
        this.valSelected !== "" &&
        this.valSelectedTo !== ""
      ) {
        this.validateData = true;

        const foundMsgType = defaultRegistryTypes.find(
          (element) =>
            element[0] === "/cosmos.staking.v1beta1.MsgBeginRedelegate",
        );
        console.log(this.selectAddress);
        const finalAmount = {
          denom: cosmosConfig[this.store.chainSelected].coinLookup.chainDenom,
          amount: (this.redelegatedAmount * 1000000).toString(),
        };
        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                delegatorAddress: this.selectAddress,
                validatorSrcAddress: this.valSelected.validatorAddress,
                validatorDstAddress: this.valSelectedTo.value,
                amount: finalAmount,
              }),
            )
            .finish(),
        };
        console.log("sendTx", finalMsg);

        this.store.addGroupMessage(finalMsg);
        // await this.$store.dispatch('data/formatFinalMsgProp', msgSend)
      } else this.validateData = false;
    },
  },
};
</script>
