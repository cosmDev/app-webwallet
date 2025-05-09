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
          label="Granter"
          required
          variant="outlined"
          disabled
        ></v-text-field>

        <v-select
          v-model="grantee"
          item-title="state"
          item-value="abbr"
          :items="itemsAuthzGrants"
          label="Grantee"
          variant="outlined"
          return-object
        ></v-select>
        <!-- <v-select
          v-if="grantee !== ''"
          v-model="valueAuthz"
          :items="itemsAuthz"
          label="Select authz type"
          variant="outlined" 
        ></v-select> -->

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
      grantee: "",
      amount: "",
      viewJson: false,
      jsonData: "",
      validateData: false,
      showValidateData: false,
      policyAmount: "",
      itemsAuthz: ["Send", "Delegate", "Redelegate", "Get Rewards", "Vote"],
      itemsAuthzGrants: [],
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

    console.log("getInfoGroup", this.store.getInfoGroup);
    this.store.getInfoGroup.info.policy.find((element) => {
      if (element.address === this.selectPolicy) {
        console.log(element.authz.grants);
        for (const [key, value] of Object.entries(element.authz.grants)) {
          console.log(value);
          this.itemsAuthzGrants.push({
            state: key + " " + value.grantee,
            abbr: value.authorization.value.msg,
          });
        }
        //this.itemsAuthzGrants = element.authz.grants.authorization.value.msg;
      }
    });
  },
  computed: {},
  watch: {},
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      if (this.selectPolicy !== "" && this.grantee !== "") {
        this.validateData = true;

        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === "/cosmos.authz.v1beta1.MsgRevoke",
        );

        const finalGrantee = this.grantee.state.split(" ");

        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                granter: this.selectPolicy,
                grantee: finalGrantee[1],
                msgTypeUrl: this.grantee.abbr,
              }),
            )
            .finish(),
        };
        console.log(finalMsg);
        this.store.addGroupMessage(finalMsg);
      } else this.validateData = false;
    },
    getMax() {
      this.amount = this.policyAmount;
      this.delegateAmount = this.policyAmount;
    },
  },
};
</script>
