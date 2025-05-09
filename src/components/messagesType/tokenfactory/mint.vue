<template>
  test
  <v-btn elevation="2" @click="checkMsg">Check message</v-btn>
  <span v-if="showValidateData">
    {{ finalMsgProp }}
    <v-icon v-if="validateData" color="teal"> mdi-check </v-icon>

    <v-icon v-else color="red"> mdi-alert-circle </v-icon>
  </span>
</template>
<script>
import { useAppStore } from "@/stores/data";
import cosmosConfig from "@/cosmos.config";
import {
  defaultRegistryTypes,
  calculateFee,
  GasPrice,
  MsgTransferEncodeObject,
} from "@cosmjs/stargate";
import { osmosis } from "osmojs";
import { selectSigner, calculFee } from "@/libs/signer";
import { coin, coins } from "@cosmjs/proto-signing";

import { bech32 } from "bech32";
import Long from "long";
import axios from "axios";

export default {
  name: "mint",
  data() {
    return {
      validateData: false,
      showValidateData: false,
    };
  },
  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      this.validateData = true;
      this.txError = "";
      this.loading = true;

      const foundMsgType = osmosis.tokenfactory.v1beta1.registry.find(
        (element) => element[0] === "/osmosis.tokenfactory.v1beta1.MsgMint",
      );

      const amount = coin(
        1000000 * 1000000,
        "factory/chihuahua13jawsn574rf3f0u5rhu7e8n6sayx5gkw3eddhp/uwoof",
      );
      const finalMsg = {
        typeUrl: foundMsgType[0],
        value: foundMsgType[1]
          .encode(
            foundMsgType[1].fromPartial({
              sender:
                "chihuahua1dlszg2sst9r69my4f84l3mj66zxcf3umcgujys30t84srg95dgvscegucm",
              amount: amount,
              mintToAddress: "chihuahua1h2sz97wffluqtt07zmkky3cvuywv6dzqgzlvvn",
            }),
          )
          .finish(),
      };
      console.log("tokenFactory mint", finalMsg);

      this.store.addGroupMessage(finalMsg);
    },
  },
};
</script>
