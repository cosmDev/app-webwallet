<template>
  <v-container>
    <v-row class="mt-4">
      <v-spacer></v-spacer>
      {{ selectPolicy }}
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
          outlined
          disabled
        ></v-text-field>
        <v-text-field
          v-model="title"
          label="Prposal title"
          required
          outlined
        ></v-text-field>
        <v-text-field
          v-model="amount"
          label="Amount"
          required
          outlined
        ></v-text-field>
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
import axios from "axios";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { MsgExecLegacyContent } from "cosmjs-types/cosmos/gov/v1/tx";
import { useAppStore } from "@/stores/data";
import cosmosConfig from "../../cosmos.config";

export default {
  props: ["from"],

  data(props) {
    return {
      dialog: false,
      selectPolicy: props.from,
      title: "",
      amount: "",
      viewJson: false,
      jsonData: "",
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
  mounted() {
    console.log("mounted");
    console.log("mounted", this.from);
  },
  computed: {},
  watch: {},
  methods: {
    async checkMsg() {
      this.showValidateData = true;

      this.validateData = true;

      const getAuthority = await axios(
        cosmosConfig[this.store.setChainSelected].apiURL +
          `/cosmos/auth/v1beta1/module_accounts`,
      );
      let find = getAuthority.data.accounts.find(
        (element) => element.name === "gov",
      );
      let finalMsgs = "";

      const TextProposalFinal = {
        typeUrl: "/cosmos.gov.v1beta1.TextProposal",
        value: TextProposal.encode(
          TextProposal.fromPartial({
            title: this.title,
            description:
              "Test proposal gov.v1 LegacyContentTest proposal gov.v1 LegacyContentTest proposal gov.v1 LegacyContentTest proposal gov.v1 LegacyContentTest proposal gov.v1 LegacyContentTest proposal gov.v1 LegacyContentTest proposal gov.v1 LegacyContent",
          }),
        ).finish(),
      };
      finalMsgs = {
        typeUrl: "/cosmos.gov.v1.MsgExecLegacyContent",
        value: MsgExecLegacyContent.encode(
          MsgExecLegacyContent.fromPartial({
            content: TextProposalFinal,
            authority: this.selectPolicy,
          }),
        ).finish(),
      };
      console.log("finalMsgs", finalMsgs);

      this.store.addGroupMessage(finalMsgs);
    },
  },
};
</script>
