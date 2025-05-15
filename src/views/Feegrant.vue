<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="12" md="6">
        <v-sheet border min-height="400" class="ma-2" rounded="lg">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>👀 Fee Grants</v-toolbar-title>
            <v-btn
              icon="mdi-account-multiple-plus-outline"
              @click="dialogFeeGrant = true"
            ></v-btn>
          </v-toolbar>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Grant type</th>
                <th class="text-left">Granter</th>
                <th class="text-left">grantee</th>
                <th class="text-left"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.myFeeGrants.length === 0">
                <td>No data</td>
              </tr>
              <tr v-for="item in store.myFeeGrants" :key="item.name">
                <td>
                  <v-chip
                    v-if="
                      item.allowance.typeUrl ===
                      '/cosmos.feegrant.v1beta1.BasicAllowance'
                    "
                    :color="cosmosConfig[store.setChainSelected].color"
                    label
                    variant="outlined"
                  >
                    Basic Allowance
                  </v-chip>
                  <v-chip
                    v-if="
                      item.allowance.typeUrl ===
                      '/cosmos.feegrant.v1beta1.PeriodicAllowance'
                    "
                    :color="cosmosConfig[store.setChainSelected].color"
                    label
                    variant="outlined"
                  >
                    Periodic Allowance
                  </v-chip>
                </td>
                <td>Me</td>
                <td>
                  {{ this.truncateString(item.grantee, 30) }}
                </td>
                <td>
                  <actionsModals type="removeFeeGrant" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-sheet>
      </v-col>

      <v-col cols="12" md="6">
        <v-sheet border min-height="400" class="ma-2" rounded="lg">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>🎉 Fee Allowances</v-toolbar-title>
          </v-toolbar>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Allowances type</th>
                <th class="text-left">Grantee</th>
                <th class="text-left">Granter</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.myFeeAllowances.length === 0">
                <td>No data</td>
              </tr>
              <tr v-for="item in store.myFeeAllowances" :key="item.name">
                <td>
                  <v-chip
                    v-if="
                      item.allowance.typeUrl ===
                      '/cosmos.feegrant.v1beta1.BasicAllowance'
                    "
                    :color="cosmosConfig[0].color"
                    label
                    variant="outlined"
                  >
                    Basic Allowance
                  </v-chip>
                  <v-chip
                    v-if="
                      item.allowance.typeUrl ===
                      '/cosmos.feegrant.v1beta1.PeriodicAllowance'
                    "
                    :color="cosmosConfig[store.setChainSelected].color"
                    label
                    variant="outlined"
                  >
                    Periodic Allowance
                  </v-chip>
                </td>
                <td>Me</td>
                <td>
                  {{ this.truncateString(item.grantee, 30) }}
                </td>
                <td>
                  {{ item.allowance }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-sheet>
        <!-- <v-data-table
            rounded="lg" style="border-radius: 7px;"
            :headers="headers"
            :items="store.myFeeAllowances"
            :search="search"
            class="ma-4 pa-4"
            no-data-text
          >
            <template v-slot:item="{ item }"> 
              <tr>

                <td>
                  <v-chip
                    v-if="item.columns['allowance.typeUrl'] === '/cosmos.feegrant.v1beta1.BasicAllowance'"
                    class="ma-2"
                    label
                  >
                    Basic Allowance
                  </v-chip>
                  
                  <v-chip
                    v-if="item.columns['allowance.typeUrl'] === '/cosmos.feegrant.v1beta1.PeriodicAllowance'"
                    class="ma-2"
                    label
                  >
                    {{ item.columns['allowance.typeUrl'] }}
                  </v-chip>
                  <v-chip
                    v-if="item.columns['allowance.typeUrl'] === '/cosmos.feegrant.v1beta1.AllowedMsgAllowance'"
                    class="ma-2"
                    label
                  >
                    {{ item.columns['allowance.typeUrl'] }}
                  </v-chip>
                  
                </td>              
                <td>
                  Top
                  <v-tooltip
                    activator="parent"
                    location="top"
                  > {{ item.columns['granter'] }} </v-tooltip>
                </td> 
                <td>
                  Top
                  <v-tooltip
                    activator="parent"
                    location="top"
                  > {{ item.columns['grantee'] }} </v-tooltip>
                </td>         
              </tr>
            </template> 
          </v-data-table> -->
      </v-col>
      <!--           <v-col 
        cols="12" 
        md="6" 
        class="d-flex justify-center align-center"
      >
          <v-data-table
            rounded="lg" style="border-radius: 7px;"
            :headers="headers"
            :items="store.myFeeGrants"
            :search="search"
            class="ma-4 pa-4"
            no-data-text
          >
            <template v-slot:item="{ item }"> 
              <tr>
                <v-chip
                    v-if="item.columns['allowance.typeUrl'] === '/cosmos.feegrant.v1beta1.BasicAllowance'"
                    class="ma-2"
                    label
                  >
                    Basic Allowance
                  </v-chip>
                  
                  <v-chip
                    v-if="item.columns['allowance.typeUrl'] === '/cosmos.feegrant.v1beta1.PeriodicAllowance'"
                    class="ma-2"
                    label
                  >
                    {{ item.columns['allowance.typeUrl'] }}
                  </v-chip>
                  <v-chip
                    v-if="item.columns['allowance.typeUrl'] === '/cosmos.feegrant.v1beta1.AllowedMsgAllowance'"
                    class="ma-2"
                    label
                  >
                    {{ item.columns['allowance.typeUrl'] }}
                  </v-chip>
                <td> Me </td> 
                <td> View</td>       
              </tr>
            </template> 
          </v-data-table>
          
      </v-col> -->
    </v-row>
    <div class="text-center d-flex pb-4">
      <v-spacer></v-spacer>
      <!-- <actionsModals type="feeGrant" />  -->
    </div>
  </v-container>

  <v-dialog
    v-model="dialogFeeGrant"
    width="500"
    transition="dialog-top-transition"
    absolute
  >
    <v-card>
      <v-toolbar>
        <template v-slot:prepend>
          <v-avatar>
            <v-img
              max-width="32"
              max-height="32"
              :src="cosmosConfig[0].coinLookup.icon"
              alt="John"
            ></v-img>
          </v-avatar>
        </template>

        <v-toolbar-title class="text-h6"> Grant Fee Allowance </v-toolbar-title>

        <v-btn icon="mdi-close" @click="dialogFeeGrant = false"></v-btn>
      </v-toolbar>

      <v-card>
        <v-tabs v-model="tab" fixed-tabs>
          <v-tab value="one">Basic Allowance</v-tab>
          <v-tab value="two">Periodic Allowance</v-tab>
        </v-tabs>

        <v-card-text>
          {{ resultError }}
          <v-alert
            v-if="showHelp"
            closable
            title="Alert title"
            text="..."
          ></v-alert>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="one" class="mt-4">
              <div v-if="step1">
                <v-text-field
                  v-model="grantee"
                  :rules="[rules.required, rules.bech32]"
                  label="Gantee address"
                  placeholder="Enter address"
                  variant="outlined"
                  append-icon="mdi-help-box-outline"
                  @click:append="showHelp = !showHelp"
                >
                  <v-tooltip activator="parent" location="top"
                    >Grantee is the address of the user being granted an
                    allowance of another user's funds.</v-tooltip
                  >
                </v-text-field>
                <v-text-field
                  v-model="amountFeeGrant"
                  :rules="[rules.required]"
                  class="mb-2 mt-4"
                  label="Amount to grant by tx"
                  placeholder="Enter amount"
                  variant="outlined"
                >
                  <v-tooltip
                    activator="parent"
                    location="top"
                    max-height="auto"
                    max-width="auto"
                    >spend_limit is the limit of coins that are allowed to be
                    used from the granter account.<br />
                    If it is empty, it assumes there's no spend limit, grantee
                    can use any number of available coins from granter account
                    address before the expiration.</v-tooltip
                  >
                </v-text-field>
                <v-select
                  v-model="periodFeeGrant"
                  label="Select"
                  variant="outlined"
                  :items="[
                    'Always',
                    '1 minute',
                    '1 hour',
                    '1 day',
                    '1 week',
                    '1 month',
                  ]"
                >
                  <v-tooltip activator="parent" location="top"
                    >specifies an optional time when this allowance expires. If
                    the value is left empty, there is no expiry for the grant.
                  </v-tooltip>
                </v-select>
              </div>

              <div v-if="step2" class="ma-8 text-center">
                <v-progress-circular
                  :size="100"
                  :width="5"
                  :color="cosmosConfig[0].color"
                  indeterminate
                  justify="center"
                ></v-progress-circular>
              </div>
              <div v-if="step3" class="ma-8 text-center">
                <v-icon size="150" color="green darken-2">
                  mdi-check-circle-outline
                </v-icon>
                <br /><br />
                {{ txResult.transactionHash }}
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item value="two" class="mt-4">
              <div v-if="step1">
                <v-text-field
                  v-model="grantee"
                  :rules="[rules.required, rules.bech32]"
                  label="Gantee address"
                  placeholder="Enter address"
                  variant="outlined"
                ></v-text-field>
                <v-text-field
                  v-model="amountFeeGrant"
                  :rules="[rules.required]"
                  class="mt-4"
                  label="Amount to grant by tx"
                  placeholder="Enter amount"
                  variant="outlined"
                ></v-text-field>
                <v-select
                  label="Select period"
                  variant="outlined"
                  :items="['1 hour', '1 day', '1 week', '1 month']"
                  v-model="periodFeeGrantPeriod"
                ></v-select>
              </div>

              <div v-if="step2" class="ma-8 text-center">
                <v-progress-circular
                  :size="100"
                  :width="5"
                  :color="cosmosConfig[0].color"
                  indeterminate
                  justify="center"
                ></v-progress-circular>
              </div>
              <div v-if="step3" class="ma-8 text-center">
                <v-icon size="150" color="green darken-2">
                  mdi-check-circle-outline
                </v-icon>
                <br /><br />
                {{ txResult.transactionHash }}
              </div>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
      <v-btn
        v-if="step1"
        class="text-none ma-6"
        :color="cosmosConfig[0].color"
        prepend-icon="mdi-export-variant"
        @click="tab == 'one' ? sendFeeGrant() : sendFeeGrantPeriodicAllowance()"
        size="large"
        :text="tab == 'one' ? 'Send Fee Grant' : 'Send Periodic Allowance'"
      >
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  BasicAllowance,
  PeriodicAllowance,
} from "cosmjs-types/cosmos/feegrant/v1beta1/feegrant";
import { MsgGrantAllowance } from "cosmjs-types/cosmos/feegrant/v1beta1/tx";
import { useAppStore } from "@/stores/data";

import cosmosConfig from "@/cosmos.config";
import { selectSigner } from "@/libs/signer";
// import actionsModals from '@/components/actionsModals.vue'

export default {
  name: "App",
  data: () => ({
    tab: "one",
    modelDate: false,
    periodFeeGrant: "Always",
    periodFeeGrantPeriod: "1 hour",

    help: false,
    showHelp: false,

    cosmosConfig: cosmosConfig,
    dialogFeeGrant: false,
    dateFeegrant: new Date().toISOString().substr(0, 10),
    dateFeegrantHour: new Date().toISOString().substr(11, 5),
    resultError: "",
    headers: [
      {
        align: "start",
        key: "allowance.typeUrl",
        sortable: false,
        title: "Tx type",
      },
      { key: "grantee", title: "grantee" },
      { key: "granter", title: "granter" },
    ],
    amountFeeGrant: 1000000,
    grantee: "",
    rules: {
      required: (v) => !!v || "Required.",
      bech32: (v) => {
        if (v === "") return true;
        return v.startsWith("dev") || "Invalid address";
      },
    },
    step1: true,
    step2: false,
    step3: false,
    step4: false,
  }),
  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  beforeMount() {
    if (this.store.isLogged) {
      this.store.getFeeGrantModule();
    } else {
      this.$router.push({
        name: "home",
      });
    }
  },
  methods: {
    async sendFeeGrantPeriodicAllowance() {
      this.step1 = false;
      this.step2 = true;
      console.log(this.grantee);
      console.log(this.amountFeeGrant);

      this.dateSelectConvert();
      let signer = await selectSigner(this.store.setChainSelected);
      // Create feegrant allowance
      const allowance = {
        typeUrl: "/cosmos.feegrant.v1beta1.PeriodicAllowance",
        value: Uint8Array.from(
          PeriodicAllowance.encode({
            basic: {
              spendLimit: [
                {
                  denom: cosmosConfig[0].coinLookup.chainDenom,
                  amount: (this.amountFeeGrant * 1000000).toString(),
                },
              ],
              expiration: {
                seconds: Math.floor(Date.now() / 1000) + this.periodFeeGrant, // In 10 minutes
                nanos: 0,
              },
            },
            period: {
              seconds: 3600,
              nanos: 0,
            },
            periodSpendLimit: [
              {
                denom: cosmosConfig[0].coinLookup.chainDenom,
                amount: (this.amountFeeGrant * 1000000).toString(),
              },
            ],
            periodCanSpend: [
              {
                denom: cosmosConfig[0].coinLookup.chainDenom,
                amount: (this.amountFeeGrant * 1000000).toString(),
              },
            ],
            periodReset: {
              seconds: 3600,
              nanos: 0,
            },
          }).finish(),
        ),
      };
      const grantMsg = {
        typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
        value: MsgGrantAllowance.fromPartial({
          granter: signer.accounts[0].address, // Signer is the granter
          grantee: this.grantee, // The address of the grantee
          allowance: allowance,
        }),
      };
      console.log(signer.accounts[0].address);
      //const fee = 1.5; // See
      //

      // const grantResult = await signer.client.signAndBroadcast(signer.accounts[0].address, [grantMsg], 'auto', "Create allowance");
      try {
        const result = await signer.client.signAndBroadcast(
          signer.accounts[0].address,
          [grantMsg],
          "auto",
          "",
        );
        assertIsDeliverTxSuccess(result);
        console.log(result);
        this.txResult = result;
        this.step2 = false;
        this.step3 = true;
      } catch (error) {
        console.error(error);
        this.step2 = false;
        this.step1 = true;
        this.resultError = error;
      }
    },
    async sendFeeGrant() {
      this.step1 = false;
      this.step2 = true;
      console.log(this.grantee);
      console.log(this.amountFeeGrant);

      this.dateSelectConvert();

      let signer = await selectSigner(this.store.setChainSelected);
      // Create feegrant allowance
      const allowance = {
        typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
        value: Uint8Array.from(
          BasicAllowance.encode({
            spendLimit: [
              {
                denom: cosmosConfig[0].coinLookup.chainDenom,
                amount: (this.amountFeeGrant * 1000000).toString(),
              },
            ],
            expiration: {
              seconds: Math.floor(Date.now() / 1000) + this.periodFeeGrant, // In 10 minutes
              nanos: 0,
            },
          }).finish(),
        ),
      };

      const grantMsg = {
        typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
        value: MsgGrantAllowance.fromPartial({
          granter: signer.accounts[0].address, // Signer is the granter
          grantee: this.grantee, // this.grantee, // The address of the grantee
          allowance: allowance,
        }),
      };
      console.log(signer.accounts[0].address);
      //const fee = 1.5; // See https://github.com/cosmos/cosmos-sdk/issues/16020
      // const grantResult = await signer.client.signAndBroadcast(signer.accounts[0].address, [grantMsg], 'auto', "Create allowance");
      try {
        const result = await signer.client.signAndBroadcast(
          signer.accounts[0].address,
          [grantMsg],
          "auto",
          "",
        );
        assertIsDeliverTxSuccess(result);
        console.log(result);
        this.txResult = result;
        this.step2 = false;
        this.step3 = true;
      } catch (error) {
        console.error(error);
        this.step2 = false;
        this.step1 = true;
        this.resultError = error;
      }
    },
    dateSelectConvert() {
      if (this.periodFeeGrant === "1 hour") {
        this.periodFeeGrant = 3600;
      } else if (this.periodFeeGrant === "1 minute") {
        this.periodFeeGrant = 60;
      } else if (this.periodFeeGrant === "Always") {
        this.periodFeeGrant = 0;
      } else if (this.periodFeeGrant === "1 day") {
        this.periodFeeGrant = 86400;
      } else if (this.periodFeeGrant === "1 week") {
        this.periodFeeGrant = 604800;
      } else if (this.periodFeeGrant === "1 month") {
        this.periodFeeGrant = 2592000;
      }
    },
    truncateString(str, num) {
      if (str.length <= num) {
        return str;
      }
      return str.slice(0, num) + "...";
    },
  },
};
</script>
