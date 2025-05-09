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
        <v-select
          label="Select"
          v-model="listAdminSelected"
          :items="listAdmin"
          required
          variant="outlined"
        ></v-select>
        <v-text-field
          v-model="newAdminAddress"
          label="New admin address"
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
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { useAppStore } from "@/stores/data";

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
      listAdmin: [],
      listAdminSelected: "",
    };
  },
  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  watch: {
    listAdminSelected: function (val) {
      let finalAdmin = this.store.getInfoGroup.info.policy.find(
        (element) => element.address === val,
      );
      console.log("finalAdmin", finalAdmin);
      this.newAdminAddress = finalAdmin.admin;
    },
  },
  async mounted() {
    let infoGroup = this.store.getInfoGroup;

    for (const type of infoGroup.info.policy) {
      if (type.admin === this.selectPolicy) {
        this.listAdmin.push(type.address);
        console.log(type);
      }
    }
  },
  computed: {},
  methods: {
    async checkMsg() {
      this.showValidateData = true;
      if (this.selectPolicy !== "" && this.newAdminAddress !== "") {
        this.validateData = true;

        const foundMsgType = defaultRegistryTypes.find(
          (element) =>
            element[0] === "/cosmos.group.v1.MsgUpdateGroupPolicyAdmin",
        );
        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1]
            .encode(
              foundMsgType[1].fromPartial({
                admin: this.selectPolicy,
                groupPolicyAddress: this.listAdminSelected,
                newAdmin: this.newAdminAddress,
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
