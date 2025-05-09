<template>
  <v-container>
    <v-row class="mt-4">
      <v-spacer></v-spacer>

      <v-col cols="12" sm="12" md="12">
        <v-text-field
          v-model="selectAddress"
          label="From address"
          required
          variant="outlined"
          disabled
        ></v-text-field>

        <v-select
          v-model="valSelected"
          :items="allValSelect"
          item-title="text"
          item-value="value"
          label="To validator"
          return-object
          required
          variant="outlined"
        ></v-select>
        <!--<v-text-field
          label="To validator"
          required
          variant="outlined"
        ></v-text-field>-->
        <v-text-field
          v-model="amount"
          label="Amount"
          suffix=""
          required
          variant="outlined"
        ></v-text-field>
        <v-btn block elevation="2" @click="checkMsg"
          >Check message
          <span v-if="showValidateData">
            <v-icon v-if="validateData" color="teal"> mdi-check </v-icon>
            <v-icon v-else color="red"> mdi-alert-circle </v-icon>
          </span>
        </v-btn>
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
import { selectSigner, calculFee } from "../../libs/signer";
import cosmosConfig from "../../cosmos.config";
import { useAppStore } from "@/stores/data";

export default {
  props: ["from"],

  data(props) {
    return {
      selectAddress: props.from,
      allValSelect: [],
      valSelected: "",
      amount: "",
      showValidateData: false,
      validateData: false,
    };
  },
  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  async mounted() {
    let allValSelect = this.allValSelect;
    this.store.allValidators.forEach(async (item) => {
      console.log("item", item);
      allValSelect.push({
        text: item.description.moniker,
        value: item.operatorAddress,
      });
    });
  },
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      console.log(
        "checkMsg",
        this.selectAddress,
        this.valSelected,
        this.amount,
      );
      if (
        this.selectAddress !== "" &&
        this.valSelected !== "" &&
        this.amount !== ""
      ) {
        this.validateData = true;

        //let signer = await selectSigner(this.store.setChainSelected);
        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === "/cosmos.staking.v1beta1.MsgDelegate",
        );

        const finalAmount = {
          denom: cosmosConfig[this.store.chainSelected].coinLookup.chainDenom,
          amount: (this.amount * 1000000).toString(),
        };
        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                delegatorAddress: this.selectAddress,
                validatorAddress: this.valSelected.value,
                amount: finalAmount,
              }),
            )
            .finish(),
        };
        console.log("delegateTx", finalMsg);
        this.store.addGroupMessage(finalMsg);
      } else this.validateData = false;
    },
  },
};
</script>
