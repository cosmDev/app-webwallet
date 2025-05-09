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
          v-model="newAdminGroup"
          label="New admin group"
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
      jsonData: "",
      validateData: false,
      showValidateData: false,
      newAdminGroup: "",
    };
  },

  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },

  async mounted() {
    console.log(this.store.getInfoGroup.info.admin);
    this.newAdminGroup = this.store.getInfoGroup.info.admin;
  },
  computed: {},
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      if (this.selectPolicy !== "" && this.newAdminGroup !== "") {
        this.validateData = true;

        //let signer = await selectSigner(this.store.chainSelected);

        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === "/cosmos.group.v1.MsgUpdateGroupAdmin",
        );

        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                admin: this.selectPolicy,
                groupId: this.store.getInfoGroup.info.id,
                newAdmin: this.newAdminGroup,
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
