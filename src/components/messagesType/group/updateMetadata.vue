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
          v-model="metadata"
          label="Group metadata"
          required
          variant="outlined"
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
      selectPolicy: props.from,
      viewJson: false,
      votingPower: "",
      userMetadata: "",
      userAddress: "",
      jsonData: "",
      validateData: false,
      showValidateData: false,
      metadata: "",
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
    console.log(this.store.getInfoGroup.info.urlmetadata);
    this.metadata = this.store.getInfoGroup.info.urlmetadata;
  },
  computed: {},
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      if (
        this.selectPolicy !== "" &&
        this.metadata !== "" &&
        this.isValidURL(this.metadata)
      ) {
        this.validateData = true;

        //let signer = await selectSigner(this.store.chainSelected);

        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === "/cosmos.group.v1.MsgUpdateGroupMetadata",
        );

        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                admin: this.selectPolicy,
                groupId: this.store.getInfoGroup.info.id,
                metadata: this.metadata,
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
    isValidURL(u) {
      var elm;
      //A precaution/solution for the problem written in the ***note***
      if (u !== "") {
        if (!elm) {
          elm = document.createElement("input");
          elm.setAttribute("type", "url");
        }
        elm.value = u;
        return elm.validity.valid;
      } else {
        return false;
      }
    },
  },
};
</script>
