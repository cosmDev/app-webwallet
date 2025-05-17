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
                <td>{{ item.granter }}</td>
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
                    @click="startExecAuthz(item.granter, item.finalData.finalType)"
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
          <v-toolbar-title>Execute authz </v-toolbar-title>
 
          <template v-slot:append>
            <v-btn icon="mdi-close" @click="dialogExecAuthz = false"></v-btn>
          </template>
        </v-toolbar>
        <v-card-text>

          <v-chip
            class="mb-4"
            text-color="white"
            label
          >
            {{ dialogExecAuthzType }}
          </v-chip>
 

        <div v-if="dialogExecAuthzType === '/cosmos.bank.v1beta1.MsgSend'">
        <h4 class="ma-1">From address
          <v-chip 
            text-color="white"
            label
            size="small"
          >
            Authz
          </v-chip>

        </h4>


        <v-text-field
          v-model="dialogExecAuthzGranter"
 
          required
          variant="outlined"
          disabled
        ></v-text-field>
        <v-text-field
          v-model="sendToAddress"
          label="To address"
          required
          variant="outlined"
        ></v-text-field>
          <v-row>
            <v-col cols="12" md="8">
              <div class="text-body-1">Amount to send</div>
              <v-text-field
                v-model="amountMax" 
                :disabled="denomSend !== '' ? false : true"
                required
                variant="outlined"
                suffix="Max"
                append-inner-icon="mdi-plus-box-outline"
                @click:append-inner="getMax()"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <div class="text-body-1">Select token</div>
              <v-select
                v-model="denomSend"
                :items="allDenomsTokensAuthz"
                variant="outlined"
              ></v-select>
            </v-col>
          </v-row>        
 
        <v-btn elevation="2" block @click="execAuthz">Send authz token</v-btn>
 
        </div>


        <div v-if="dialogExecAuthzType === '/cosmos.staking.v1beta1.MsgDelegate'">
          <div class="text-body-1 ml-1">From address</div>
          <v-text-field
            v-model="dialogExecAuthzGranter" 
            required
            variant="outlined"
            disabled
          ></v-text-field>
          <div class="text-body-1 ml-1">To validator address</div>
          <v-text-field
            v-model="toAddress"
            required
            variant="outlined"
          ></v-text-field>
          <div class="text-body-1 ml-1">Amount</div>
          <v-text-field
            v-model="amountMax" 
            required
            variant="outlined"
            suffix="Max"
            append-inner-icon="mdi-plus-box-outline"
            @click:append-inner="getMax()"
          ></v-text-field> 
          <v-btn elevation="2" block @click="execAuthz">Send authz delegation</v-btn> 
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

import sendTxComponent from "@/components/messagesType/sendTx.vue";

export default {
  name: "AuthzView",
  components: {
    sendTxComponent,
  },
  data() {
    return {
      cosmosConfig,
      moment,
      dialogAddAuthz: false,
      dialogExecAuthz: false,
      selectedAuhz: "",
      dialogExecAuthzType: "",
      dialogExecAuthzGranter: "",
      authzSendGrantee: "",
      allDenomsTokensAuthz: [],
      denomSend: "",
      amountMax: "",
      sendToAddress: "",
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
  methods: {
    async execAuthz() {
      console.log("this.store.setChainSelected", this.store.setChainSelected);
      let signer = await selectSigner(this.store.setChainSelected);
      const foundMsgType = defaultRegistryTypes.find(
        (element) => element[0] === this.dialogExecAuthzType,
      );
      if (!foundMsgType) {
        console.error("Msg type not found in registry");
        return;
      }

      console.log("foundMsgType:", foundMsgType[0]);

      let finalMessage = "";

      if (this.dialogExecAuthzType === "/cosmos.bank.v1beta1.MsgSend") {
        finalMessage = {
          typeUrl: this.dialogExecAuthzType,
            value: await (await import("cosmjs-types/cosmos/bank/v1beta1/tx")).MsgSend.encode(
            (await import("cosmjs-types/cosmos/bank/v1beta1/tx")).MsgSend.fromPartial({
              fromAddress: this.dialogExecAuthzGranter,
              toAddress: this.sendToAddress,
              amount: [
              {
                denom: this.denomSend,
                amount: this.amountMax,
              },
              ],
            })
            ).finish(),
        };
        console.log("msgSend:", finalMessage);
      } else if (this.dialogExecAuthzType === "/cosmos.staking.v1beta1.MsgDelegate") {
        finalMessage = {
          typeUrl: this.dialogExecAuthzType,
          value: {
            delegatorAddress: this.dialogExecAuthzGranter,
            validatorAddress: this.toAddress,
            amount: {
              denom: this.denom,
              amount: this.amount,
            },
          },
        };
        console.log("msgDelegate:", finalMessage);
      }
      else if (this.dialogExecAuthzType === "/cosmos.staking.v1beta1.MsgUndelegate") {
        finalMessage = {
          typeUrl: this.dialogExecAuthzType,
          value: {
            delegatorAddress: this.dialogExecAuthzGranter,
            validatorAddress: this.toAddress,
            amount: {
              denom: this.denom,
              amount: this.amount,
            },
          },
        };
        console.log("msgUndelegate:", finalMessage);
      } else if (this.dialogExecAuthzType === "/cosmos.staking.v1beta1.MsgBeginRedelegate") {
        finalMessage = {
          typeUrl: this.dialogExecAuthzType,
          value: {
            delegatorAddress: this.dialogExecAuthzGranter,
            validatorSrcAddress: this.toAddress,
            validatorDstAddress: this.toAddress,
            amount: {
              denom: this.denom,
              amount: this.amount,
            },
          },
        };
        console.log("msgRedelegate:", finalMessage);
      } else if (this.dialogExecAuthzType === "/cosmos.gov.v1beta1.MsgVote") {
        finalMessage = {
          typeUrl: this.dialogExecAuthzType,
          value: {
            proposalId: 0, // Replace with actual proposal ID
            voter: this.dialogExecAuthzGranter,
            option: 0, // Replace with actual vote option
          },
        };
        console.log("msgVote:", finalMessage);
      }

      const msgExec = {
        typeUrl: "/cosmos.authz.v1beta1.MsgExec",
        value: {
          grantee: signer.accounts[0].address,
          msgs: [finalMessage],
        },
      };
      console.log(msgExec);

      console.log("signer:", signer);

      try {
        const result = await signer.client.signAndBroadcast(
          signer.accounts[0].address,
          [msgExec],
          "auto",
          ""
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
    async startExecAuthz(granter, msgType) {
      this.dialogExecAuthz = true;
      this.dialogExecAuthzType = msgType;
      this.dialogExecAuthzGranter = granter;
      this.allDenomsTokensAuthz = [];
      this.denomSend = "";
      this.amountMax = "";
      this.sendToAddress = "";

          const axios = (await import("axios")).default;
          const url = this.cosmosConfig[0].apiURL + `/cosmos/bank/v1beta1/balances/${granter}`;
          const { data } = await axios.get(url);
          for (let i = 0; i < data.balances.length; i++) {
            const denom = data.balances[i].denom;
            this.allDenomsTokensAuthz.push(denom);
          }


/*       let signer = await selectSigner(this.store.setChainSelected);

      const foundMsgType = defaultRegistryTypes.find(
        (element) => element[0] === msgType,
      );
      if (!foundMsgType) {
        console.error("Msg type not found in registry");
        return;
      }   
      const msgExec = {
        typeUrl: "/cosmos.authz.v1beta1.MsgExec",
        value: {
          grantee: signer.accounts[0].address,
          msgs: [
            {
              typeUrl: msgType,
              value: {
                granter: granter,
                grantee: signer.accounts[0].address,
              },
            },
          ],
        },
      };
      console.log(msgExec); */
    },
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
    getMax() {
      // Use axios to fetch the balance for dialogExecAuthzGranter
      // Assumes you have axios installed and imported
      // Example endpoint, adjust as needed for your backend/API
      this.amountMax = ""; // reset before fetching
      //if (!this.dialogExecAuthzGranter || !this.denom) return;
      const address = this.dialogExecAuthzGranter;
      const denom = this.denomSend;
      this.$nextTick(async () => {
        try {
          const axios = (await import("axios")).default;
          // Replace with your actual REST endpoint
          const url = this.cosmosConfig[0].apiURL + `/cosmos/bank/v1beta1/balances/${address}`;
          const { data } = await axios.get(url);
          const balanceObj = data.balances.find((b) => b.denom === denom);
          this.amountMax = balanceObj ? balanceObj.amount : "0";
        } catch (e) {
          console.error("Error fetching balance:", e);
          this.amountMax = "0";
        }
      });
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
