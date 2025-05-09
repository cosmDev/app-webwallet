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
        <v-btn-toggle v-model="toggle_exclusive">
          <v-btn> Select reward validator </v-btn>

          <v-btn> Get all Rewards </v-btn>
        </v-btn-toggle>
        <div v-if="toggle_exclusive === 0">
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
            :items="allValSelect"
            item-title="text"
            item-value="value"
            label="From validator"
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
        </div>
        <div v-else>Soon</div>
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
      allValSelect: [],
      valSelected: "",
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
    let allDelegations = await this.store.getWalletDelegations(
      this.selectAddress,
    );
    let getWalletRewards = await this.store.getWalletRewards(
      this.selectAddress,
    );

    console.log("allDelegations", this.store.walletDelegationsRewards);
    for (let i = 0; i < this.store.walletDelegationsRewards.length; i++) {
      if (this.store.walletDelegationsRewards[i].reward.length > 0) {
        this.allValSelect.push({
          text:
            this.store.walletDelegationsRewards[i].validatorAddress +
            " - " +
            this.store.walletDelegationsRewards[i].rewardDisplay,
          value: this.store.walletDelegationsRewards[i].rewardDisplay,
          validatorAddress:
            this.store.walletDelegationsRewards[i].validatorAddress,
        });
      }
    }
  },
  computed: {},
  watch: {},
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      if (this.selectAddress !== "" && this.valSelected !== "") {
        this.validateData = true;

        const foundMsgType = defaultRegistryTypes.find(
          (element) =>
            element[0] ===
            "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        );
        console.log(this.selectAddress);

        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                delegatorAddress: this.selectAddress,
                validatorAddress: this.valSelected.validatorAddress,
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
