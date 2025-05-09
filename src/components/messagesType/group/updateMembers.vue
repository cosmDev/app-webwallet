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
          label="Select"
          v-model="userSelected"
          :items="userList"
          required
          variant="outlined"
        ></v-select>
        <v-text-field
          v-model="userAddress"
          label="To address"
          required
          variant="outlined"
        ></v-text-field>
        <v-text-field
          v-model="userMetadata"
          label="Metadata"
          required
          variant="outlined"
        ></v-text-field>
        <v-text-field
          v-model="votingPower"
          label="Voting power"
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
      userSelected: "",
      userList: [],
    };
  },

  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  watch: {
    userSelected: function (val) {
      console.log("userSelected", val);
      let userData = this.store.getInfoGroup.info.members.find(
        (element) => element.name === val,
      );

      this.userAddress = userData.member.address;
      this.userMetadata = userData.member.metadata;
      this.votingPower = userData.member.weight;
      console.log("userAddress", this.userAddress);
    },
  },
  /* watch: {
    userSelected: function (val) {
      console.log("userSelected", val);

    },
    
  }, */
  async mounted() {
    console.log("mounted");
    console.log("mounted", this.from);
    let policyAmount = await this.store.getBankModule(this.selectPolicy);
    this.policyAmount = policyAmount;

    console.log(
      "this.store.getInfoGroup.members",
      this.store.getInfoGroup.info.members,
    );
    for (let i = 0; i < this.store.getInfoGroup.info.members.length; i++) {
      this.userList.push(this.store.getInfoGroup.info.members[i].name);
    }
  },
  computed: {},
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      if (
        this.userSelected !== "" &&
        this.userAddress !== "" &&
        this.userMetadata !== "" &&
        this.votingPower !== ""
      ) {
        this.validateData = true;

        //let signer = await selectSigner(this.store.chainSelected);

        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === "/cosmos.group.v1.MsgUpdateGroupMembers",
        );

        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                admin: this.selectPolicy,
                groupId: this.store.getInfoGroup.info.id,
                memberUpdates: [
                  {
                    address: this.userAddress,
                    weight: this.votingPower,
                    metadata: this.userMetadata,
                  },
                ],
              }),
            )
            .finish(),
        };
        console.log("sendTx", finalMsg);

        this.store.addGroupMessage(finalMsg);
        // await this.$store.dispatch('data/formatFinalMsgProp', msgSend)
      } else this.validateData = false;
    },
    getMax() {
      this.amount = this.policyAmount;
      this.delegateAmount = this.policyAmount;
    },
  },
};
</script>
