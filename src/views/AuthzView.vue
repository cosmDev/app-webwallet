<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="12" md="6">
        <v-sheet border min-height="400" class="ma-2" rounded="lg">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>Authz granter</v-toolbar-title>
            <v-btn
              icon="mdi-account-multiple-plus-outline"
              @click="dialogAddAuthz = true"
            ></v-btn>
          </v-toolbar>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Type</th>
                <th class="text-left">Granter</th>
                <th class="text-left">Grantee</th>
                <th class="text-left">Expiration</th>
                <th class="text-left">Remove</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in this.store.allAuthz.granter" :key="item.name">
 
                <td>
                  <v-chip label variant="outlined">
                    {{ item.finalData.titleMsg }}
                  </v-chip>
                </td>
                <td>Me</td>
                <td>{{ item.grantee }}</td>
                <td>
                  <v-chip
                    v-if="item.expiration.seconds > 0"
                    color="green"
                    text-color="white"
                    label
                  >
                    {{
                      moment.unix(item.expiration.seconds.toString()).fromNow()
                    }}
                  </v-chip>
                  <v-chip v-else color="red" text-color="white" label>
                    No expiration
                  </v-chip>
                </td>
                <td>
                  <v-btn
                    @click="sendRemoveAuthz(item.grantee, item.finalData.finalType)" 
                    text
                  >
                    <v-icon color="red">mdi-delete-forever-outline</v-icon> Remove
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="6">
        <v-sheet border min-height="400" class="ma-2" rounded="lg">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>Authz grantee</v-toolbar-title>
 
          </v-toolbar>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Type</th>
                <th class="text-left">Granter</th>
                <th class="text-left">Grantee</th>
                <th class="text-left">Expiration</th>
                <th class="text-left">Exec</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in this.store.allAuthz.grantee" :key="item.name" >
                <td>

                  <v-chip label variant="outlined">
                    {{ item.finalData.titleMsg }}
                  </v-chip>
                </td>
                <td>{{ item.grantee }}</td>
                <td>Me


                </td>                
                <td>
                  <v-chip
                    v-if="item.expiration.seconds > 0"
                    color="green"
                    text-color="white"
                    label
                  >
                    {{
                      moment.unix(item.expiration.seconds.toString()).fromNow()
                    }}
                  </v-chip>
                  <v-chip v-else color="red" text-color="white" label>
                    No expiration
                  </v-chip>
                </td>
                <td>
                  <v-btn 
                    @click="dialogExecAuthz = true"
                  >Execute</v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-sheet>
      </v-col>
    </v-row>

    <v-dialog
      v-model="dialogAddAuthz"
      width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Add authz</v-toolbar-title>
          <v-btn
            icon="mdi-account-multiple-plus-outline"
            @click="dialogAddAuthz = true"
          ></v-btn>

          <template v-slot:append>
            <v-btn icon="mdi-close" @click="dialogAddAuthz = false"></v-btn>
          </template>
        </v-toolbar>
        <v-card-text>
          <div v-if="step1">
            <v-select
              v-model="selectedAuhz"
              label="Select authz"
              :items="[
                'Send',
                'Delegate',
                'Unbond',
                'Redelegate',
                'Vote',
                'MultiSend',
              ]"
              variant="outlined"
            ></v-select>
            <v-text-field
              v-model="authzSendGrantee"
              :rules="[rules.required, rules.bech32]"
              label="Gantee address"
              placeholder="Enter address"
              variant="outlined"
            />
            <v-select
              label="Select period"
              variant="outlined"
              :items="['1 hour', '1 day', '1 week', '1 month']"
              v-model="periodAuthzGrantPeriod"
            ></v-select>
          </div>
          <v-btn
            v-if="step1"
            class="text-none ma-4"
            :color="cosmosConfig[store.setChainSelected].color"
            prepend-icon="mdi-export-variant"
            @click="sendAddAuthz()"
            size="large"
          />

          <div v-if="step2" class="ma-8 text-center">
            <v-progress-circular
              :size="100"
              :width="5"
              :color="cosmosConfig[store.setChainSelected].color"
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
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialogExecAuthz"
      width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Execute authz</v-toolbar-title>
 
          <template v-slot:append>
            <v-btn icon="mdi-close" @click="dialogExecAuthz = false"></v-btn>
          </template>
        </v-toolbar>
        <v-card-text>
          <div v-if="step1">
            <v-select
              v-model="selectedAuhz"
              label="Select authz"
              :items="[
                'Send',
                'Delegate',
                'Unbond',
                'Redelegate',
                'Vote',
                'MultiSend',
              ]"
              variant="outlined"
            ></v-select>
            <v-text-field
              v-model="authzSendGrantee"
              :rules="[rules.required, rules.bech32]"
              label="Gantee address"
              placeholder="Enter address"
              variant="outlined"
            />
            <v-select
              label="Select period"
              variant="outlined"
              :items="['1 hour', '1 day', '1 week', '1 month']"
              v-model="periodAuthzGrantPeriod"
            ></v-select>
          </div>
          <v-btn
            v-if="step1"
            class="text-none ma-4"
            :color="cosmosConfig[store.setChainSelected].color"
            prepend-icon="mdi-export-variant"
            @click="sendAddAuthz()"
            size="large"
          />

          <div v-if="step2" class="ma-8 text-center">
            <v-progress-circular
              :size="100"
              :width="5"
              :color="cosmosConfig[store.setChainSelected].color"
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
        </v-card-text>
      </v-card>
    </v-dialog>


  </v-container>
</template>

<script>
import { useAppStore } from "@/stores/data";
import {
  defaultRegistryTypes,
  assertIsDeliverTxSuccess,
} from "@cosmjs/stargate";
import { selectSigner } from "../libs/signer";
import {
  GenericAuthorization,
  GrantAuthorization,
} from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import cosmosConfig from "@/cosmos.config";
import moment from "moment";

export default {
  name: "AuthzView",
  data() {
    return {
      cosmosConfig,
      moment,
      dialogAddAuthz: false,
      dialogExecAuthz: false,
      selectedAuhz: "",
      authzSendGrantee: "",
      step1: true,
      step2: false,
      step3: false,
      txResult: null,
      rules: {
        required: (v) => !!v || "Required.",
        bech32: (v) => v.match(/^(dev1)[0-9a-z]{38}$/) || "Invalid address",
      },
      periodAuthzGrantPeriod: "1 hour",
    };
  },
  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  async mounted() {
    // Fetch data or perform any setup when the component is mounted
    await this.store.getAuthzModule();

    console.log("Authz module data:", this.store.allAuthz);
  },
  methods: {
    async sendAddAuthz() {
      this.step1 = false;
      this.step2 = true;
      this.dateSelectConvert();

      let signer = await selectSigner(this.store.setChainSelected);

      const foundMsgType = defaultRegistryTypes.find(
        (element) => element[0] === "/cosmos.authz.v1beta1.MsgGrant",
      );

      console.log(defaultRegistryTypes);
      let finalType = "";
      switch (this.selectedAuhz) {
        case "Send":
          finalType = "/cosmos.bank.v1beta1.MsgSend";
          break;
        case "Delegate":
          finalType = "/cosmos.staking.v1beta1.MsgDelegate";
          break;
        case "Unbond":
          finalType = "/cosmos.staking.v1beta1.MsgUndelegate";
          break;
        case "Redelegate":
          finalType = "/cosmos.staking.v1beta1.MsgBeginRedelegate";
          break;
        case "Vote":
          finalType = "/cosmos.gov.v1beta1.MsgVote";
          break;
        case "MultiSend":
          finalType = "/cosmos.bank.v1beta1.MsgMultiSend";
          break;
        default:
          break;
      }

      const authzMsg = {
        typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
        value: GenericAuthorization.encode(
          GenericAuthorization.fromPartial({
            msg: finalType,
          }),
        ).finish(),
      };

      const finalMsg = {
        typeUrl: foundMsgType[0],
        value: foundMsgType[1].fromPartial({
          granter: signer.accounts[0].address,
          grantee: this.authzSendGrantee,
          grant: {
            authorization: authzMsg,
            expiration: {
              seconds:
                Math.floor(Date.now() / 1000) + this.periodAuthzGrantPeriod,
              nanos: 0,
            },
          },
        }),
      };
      console.log(finalMsg);

      try {
        const result = await signer.client.signAndBroadcast(
          signer.accounts[0].address,
          [finalMsg],
          "auto",
          "",
        ); 
        console.log(result);
        await this.store.getAuthzModule();
        this.txResult = result;
        this.step2 = false;
        this.step3 = true;
      } catch (error) {
        console.error(error);
        this.step2 = false;
        this.step1 = true;
      }
    },
    async sendRemoveAuthz(grantee, msgType) {
      let signer = await selectSigner(this.store.setChainSelected);
      const msgRevoke = {
        typeUrl: "/cosmos.authz.v1beta1.MsgRevoke",
        value: MsgRevoke.fromPartial({
          granter: signer.accounts[0].address,
          grantee: grantee,
          msgTypeUrl: msgType,
        }),
      };
      console.log(msgRevoke);

      try {
        const result = await signer.client.signAndBroadcast(
          signer.accounts[0].address,
          [msgRevoke],
          "auto",
          "",
        ); 
        console.log(result);
        await this.store.getAuthzModule();
        this.txResult = result; 
      } catch (error) {
        console.error(error);
        this.step2 = false;
        this.step1 = true;
      }

    },
    dateSelectConvert() {
      if (this.periodAuthzGrantPeriod === "1 hour") {
        this.periodAuthzGrantPeriod = 3600;
      } else if (this.periodAuthzGrantPeriod === "1 minute") {
        this.periodAuthzGrantPeriod = 60;
      } else if (this.periodAuthzGrantPeriod === "Always") {
        this.periodAuthzGrantPeriod = 0;
      } else if (this.periodAuthzGrantPeriod === "1 day") {
        this.periodAuthzGrantPeriod = 86400;
      } else if (this.periodAuthzGrantPeriod === "1 week") {
        this.periodAuthzGrantPeriod = 604800;
      } else if (this.periodAuthzGrantPeriod === "1 month") {
        this.periodAuthzGrantPeriod = 2592000;
      }
    },
  },
};
</script>
