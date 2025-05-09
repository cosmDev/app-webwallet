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

        <v-select
          v-model="itemsAdminSelected"
          :items="itemsAdminToSelect"
          item-title="address"
          label="Admin policy"
          variant="outlined"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :subtitle="item.raw.name"></v-list-item>
          </template>
        </v-select>

        <v-text-field
          v-model="policyMetadata"
          label="Metadata"
          required
          variant="outlined"
        ></v-text-field>

        <b>Policy type</b>
        <v-select
          v-model="policyFinal"
          :items="policyType"
          variant="outlined"
        ></v-select>

        <b>Policy value</b>
        <v-select
          v-model="policyPourcentValueFinal"
          :items="policyValue"
          variant="outlined"
          item-title="text"
          item-value="value"
        ></v-select>

        <b>Voting period</b>
        <v-select
          v-model="votingPeriodFinal"
          :items="timeSelect"
          item-title="text"
          item-value="value"
          variant="outlined"
        ></v-select>

        <b>Min Execution Period</b>
        <v-select
          v-model="minExecutionPeriod"
          :items="timeSelect"
          item-title="text"
          item-value="value"
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
import Long from "long";
import {
  PercentageDecisionPolicy,
  ThresholdDecisionPolicy,
} from "cosmjs-types/cosmos/group/v1/types";
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
      selectPolicy: props.from,
      viewJson: false,
      policyMetadata: "",
      jsonData: "",
      validateData: false,
      showValidateData: false,

      policyFinal: "",
      policyValueFinal: "",
      policyValueThresholdFinal: "50",
      policyPourcentValueFinal: "0.5",
      votingPeriodFinal: "86400",
      minExecutionPeriod: "120",
      policyType: ["Threshold Decision", "Percentage Decision"],
      policyValue: [
        { text: "10%", value: "0.1" },
        { text: "50%", value: "0.5" },
        { text: "100%", value: "1" },
      ],
      timeSelect: [
        { text: "2 min", value: "120" },
        { text: "10 min", value: "600" },
        { text: "1 hour", value: "3600" },
        { text: "1 day", value: "86400" },
        { text: "1 week", value: "604800" },
      ],
      policySelected: null,
      itemsAdminToSelect: [],
      itemsAdminSelected: null,
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

    for (const type of this.store.getInfoGroup.info.members) {
      this.itemsAdminToSelect.push({
        name: type.metadata.name,
        address: type.member.address,
      });
    }
  },
  computed: {},
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      if (
        this.selectPolicy !== "" &&
        this.policyMetadata !== "" &&
        this.policyFinal !== "" &&
        this.policyPourcentValueFinal !== "" &&
        this.votingPeriodFinal !== "" &&
        this.minExecutionPeriod !== ""
      ) {
        this.validateData = true;
        console.log("itemsUsersSelected", this.itemsUsersSelected);
        //let signer = await selectSigner(this.store.chainSelected);

        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === "/cosmos.group.v1.MsgCreateGroupPolicy",
        );
        console.log(foundMsgType);

        let decisionPolicyUrl = "";
        let decisionPolicyValue = {};

        console.log(this.policyFinal);
        if (this.policyFinal === "Threshold Decision") {
          decisionPolicyUrl = "/cosmos.group.v1.ThresholdDecisionPolicy";
          decisionPolicyValue = ThresholdDecisionPolicy.encode({
            threshold: this.policyValueThresholdFinal,
            windows: {
              votingPeriod: {
                nanos: 0,
                seconds: Long.fromValue(this.votingPeriodFinal),
              },
              minExecutionPeriod: {
                nanos: 0,
                seconds: Long.fromValue(this.minExecutionPeriod),
              },
            },
          }).finish();
        } else {
          decisionPolicyUrl = "/cosmos.group.v1.PercentageDecisionPolicy";
          decisionPolicyValue = PercentageDecisionPolicy.encode({
            percentage: this.policyPourcentValueFinal,
            windows: {
              votingPeriod: {
                nanos: 0,
                seconds: Long.fromValue(this.votingPeriodFinal),
              },
              minExecutionPeriod: {
                nanos: 0,
                seconds: Long.fromValue(this.minExecutionPeriod),
              },
            },
          }).finish();
        }

        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                admin: this.selectPolicy,
                groupId: this.$route.params.id,
                metadata: this.policyMetadata,
                decisionPolicy: {
                  typeUrl: decisionPolicyUrl,
                  value: decisionPolicyValue,
                },
              }),
            )
            .finish(),
        };

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
