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
          v-model="amountToSend"
          label="Amount to send"
          required
          variant="outlined"
          suffix="Max"
          append-inner-icon="mdi-plus-box-outline"
          @click:append-inner="getMax()"
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
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { coins } from "@cosmjs/proto-signing";
import { useAppStore } from "@/stores/data";
import cosmosConfig from "@/cosmos.config";

export default {
  props: ["from"],
  data(props) {
    return {
      dialog: false,
      selectPolicy: props.from,
      newAdminAddress: "",
      viewJson: false,
      jsonData: "",
      validateData: false,
      showValidateData: false,
      amountToSend: "",
      listAdmin: [],
      policyAmount: 0,
    };
  },
  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  watch: {},
  async mounted() {
    console.log("mounted");
    console.log("mounted", this.from);
    let policyAmount = await this.store.getBankModule(this.selectPolicy);
    this.policyAmount = policyAmount;
  },
  computed: {},
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      if (this.selectPolicy !== "" && this.amountToSend !== "") {
        this.validateData = true;

        const foundMsgType = defaultRegistryTypes.find(
          (element) =>
            element[0] === "/cosmos.distribution.v1beta1.MsgFundCommunityPool",
        );
        const amount = coins(
          this.amountToSend * 1000000,
          cosmosConfig[this.store.chainSelected].coinLookup.chainDenom,
        );
        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                amount: amount,
                depositor: this.selectPolicy,
              }),
            )
            .finish(),
        };
        this.store.addGroupMessage(finalMsg);
      } else this.validateData = false;
    },
    getMax() {
      this.amount = this.policyAmount;
      this.amountToSend = this.policyAmount;
    },
  },
};
</script>
