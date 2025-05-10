<script setup></script>

<template>
  <v-container fluid>
    <v-row v-if="appStore.isLogged === true">
      <v-col cols="4">
        <v-card border class="mx-auto my-4 rounded-lg" elevation="16" height="330">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>Wallet info</v-toolbar-title>
          </v-toolbar>

          <v-list lines="two">
            <v-list-item title="Cosmos address" @click="tab = 1">
              <template v-slot:subtitle>
                <span class="text-caption">{{ appStore.addrWallet }}</span>
              </template>
              <template v-slot:prepend>
                <v-avatar>
                  <v-icon>mdi-atom</v-icon>
                </v-avatar>
              </template>

              <template v-slot:append>
                <v-btn color="grey-lighten-1" variant="text">
                  <v-avatar size="x-small">
                    <v-img alt="keplrImage" :src="keplrImage"></v-img>
                  </v-avatar>
                </v-btn>
              </template>
            </v-list-item>

            <v-list-item title="Bitcoin address" @click="tab = 2">
              <template v-slot:subtitle>
                <span class="text-caption">{{ appStore.btcAddress[0] }}</span>
              </template>
              <template v-slot:prepend>
                <v-avatar>
                  <v-icon>mdi-bitcoin</v-icon>
                </v-avatar>
              </template>

              <template v-slot:append>
                <v-btn color="grey-lighten-1" variant="text">
                  <v-avatar size="x-small">
                    <v-img alt="keplrImage" :src="keplrImage"></v-img>
                  </v-avatar>
                </v-btn>
              </template>
            </v-list-item>
            <v-list-item title="Ethereum address" @click="tab = 3">
              <template v-slot:subtitle>
                <span class="text-caption">{{
                  appStore.nameWallet.ethereumHexAddress
                }}</span>
              </template>
              <template v-slot:prepend>
                <v-avatar>
                  <v-icon>mdi-ethereum</v-icon>
                </v-avatar>
              </template>

              <template v-slot:append>
                <v-btn color="grey-lighten-1" variant="text">
                  <v-avatar size="x-small">
                    <v-img alt="keplrImage" :src="keplrImage"></v-img>
                  </v-avatar>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <!--               <v-card-text>
                {{ appStore.addrWallet }}
                {{ appStore.nameWallet.ethereumHexAddress }}
                <br />
                {{ appStore.btcAddress[0] }}
              </v-card-text> -->
        </v-card>
      </v-col>

      <v-col cols="4">
        <v-card
          border
          class="mx-auto my-4 rounded-lg"
          elevation="16"
          height="330"
          rounded
          :disabled="tab !== 1"
        >
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>Wallet actions</v-toolbar-title>
          </v-toolbar>
          <v-card-text v-if="appStore.isLogged === true">
            <v-list lines="two">
              <v-list-item
                subtitle="Send any tokens"
                title="Send token"
                @click="dialogSend = true"
              >
                <template v-slot:prepend>
                  <v-avatar color="blue">
                    <v-icon color="white">mdi-clipboard-text</v-icon>
                  </v-avatar>
                </template>

                <template v-slot:append>
                  <v-btn
                    color="grey-lighten-1"
                    icon="mdi-information"
                    variant="text"
                  ></v-btn>
                </template>
              </v-list-item>

              <v-list-item
                subtitle="Delegate your token"
                title="Delegate"
                @click="dialogDelegate = true"
              >
                <template v-slot:prepend>
                  <v-avatar color="amber">
                    <v-icon color="white">mdi-gesture-tap-button</v-icon>
                  </v-avatar>
                </template>

                <template v-slot:append>
                  <v-btn
                    color="grey-lighten-1"
                    icon="mdi-information"
                    variant="text"
                  ></v-btn>
                </template>
              </v-list-item>
              <v-list-item subtitle="Token rewards" title="Token rewards">
                <template v-slot:prepend>
                  <v-avatar color="green">
                    <v-icon color="white">mdi-information</v-icon>
                  </v-avatar>
                </template>

                <template v-slot:append>
                  <v-btn
                    color="grey-lighten-1"
                    icon="mdi-information"
                    variant="text"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card
          border
          class="mx-auto my-4 rounded-lg"
          elevation="16"
          height="auto"
          min-height="330"
          rounded
        >
          <v-toolbar class="rounded-t-lg">
            <v-tabs v-model="tab" align-tabs="center" fixed-tabs>
              <v-tab :value="1"><v-icon>mdi-atom</v-icon> Cosmos</v-tab>
              <v-tab :value="2"><v-icon>mdi-bitcoin</v-icon> Bitcoin</v-tab>
              <v-tab :value="3"><v-icon>mdi-ethereum</v-icon> Etherum</v-tab>
            </v-tabs>
          </v-toolbar>

          <v-tabs-window v-model="tab">
            <v-tabs-window-item v-for="n in 3" :key="n" :value="n">
              <v-container fluid>
                <div v-if="n === 1">
                  <v-card-item>
                    <v-card-title> Cosmos tokens </v-card-title>
                    <template v-slot:append>
                      {{ appStore.allWalletBalances.length }} TOKENS
                    </template>
                    <v-card-subtitle>
                      {{ appStore.addrWallet }}
                    </v-card-subtitle>
                  </v-card-item>

                  <v-card-text v-if="appStore.isLogged === true">
                    <v-table>
                      <thead>
                        <tr>
                          <th class="text-left">Name</th>
                          <th class="text-left">Amount</th>
                          <th class="text-left">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in appStore.allWalletBalances"
                          :key="item.name"
                        >
                          <td>{{ item.denom }}</td>
                          <td>{{ item.amount }}</td>
                          <td>
                            $0<!-- {{
                              (
                                item.amount *
                                appStore.allPrice["chihuahua-token"].usd
                              ).toFixed(0)
                            }} -->
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </div>
                <div v-if="n === 2">
                  <v-card-item>
                    <v-card-title> Bitcoin wallet </v-card-title>
                    <v-card-subtitle>
                      {{ appStore.btcAddress[0] }}
                    </v-card-subtitle>
                  </v-card-item>

                  <v-card-text v-if="appStore.isLogged === true">
                    <v-table>
                      <thead>
                        <tr>
                          <th class="text-left">Name</th>
                          <th class="text-left">Amount</th>
                          <th class="text-left">Value</th>
                          <th class="text-left"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>BTC</td>
                          <td>
                            {{ appStore.btcAmount.confirmed / 100000000 }}
                          </td>
                          <td>
                            ${{
                              (
                                (appStore.btcAmount.confirmed / 100000000) *
                                appStore.allPrice.bitcoin.usd
                              ).toFixed(8)
                            }}
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </div>
                <div v-if="n === 3">
                  <v-card-item>
                    <v-card-title> ETH wallet </v-card-title>

                    <v-card-subtitle>
                      {{ appStore.nameWallet.ethereumHexAddress }}
                    </v-card-subtitle>
                  </v-card-item>

                  <v-card-text v-if="appStore.isLogged === true"> </v-card-text>
                </div>
              </v-container>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-container fluid>
    <v-sheet v-if="appStore.isLogged === true" border rounded="lg" elevation="16">
      <v-toolbar class="rounded-t-lg">
        <v-toolbar-title>Last 10 transactions</v-toolbar-title>
      </v-toolbar>

      <v-table>
        <thead>
          <tr>
            <th class="text-left">Tx type</th>
            <th class="text-left">Date</th>
            <th class="text-left">Data</th>
            <th class="text-left">State</th>
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in appStore.lastTransactions" :key="item.name">
            <td>
              <v-chip
                class="ma-2"
                :color="cosmosConfig[appStore.setChainSelected].color"
                label
                variant="outlined"
                >{{ item.titleMsg }}
              </v-chip>
            </td>
            <td> 

              {{ moment(item.timestamp).format('llll') }}
              
              <v-chip
                class="ma-2"
                label
              >
                {{ moment(item.timestamp).fromNow() }}
              </v-chip>
              
            </td>
            <td v-if="item.finalData.amount?.data.amount">
              {{ item.finalData.amount?.data.amount / 1000000 }}
              <strong
                :style="
                  'color:' + cosmosConfig[appStore.setChainSelected].color
                "
              >
                <!-- {{ cosmosConfig[appStore.setChainSelected].coinLookup.viewDenom }} -->
                {{ item.finalData.viewDenom?.data }}
              </strong>
            </td>
            <td v-else></td>
            <td>
              <v-icon
                v-if="item.code === 0"
                color="success"
                icon="mdi-check-bold"
              ></v-icon>
              <v-icon v-else color="error" icon="mdi-close-thick"></v-icon>
            </td>
            <td>
              <v-chip
                :color="cosmosConfig[appStore.setChainSelected].color"
                class="ma-2"
                label
                :to="
                  '/tx-details/' +
  
                  item.txhash
                "
              >
                View detail
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-sheet>
  </v-container>
  <v-dialog v-model="dialogSend" width="650">
    <v-card
      prepend-icon="mdi-update"
      text="Send any token of your chain."
      title="Send token"
      class="rounded-lg"
    >
      <v-form v-model="valid">
        <v-container>
          <v-row>
            <v-col cols="12" md="8">
              <div class="text-body-1">Amount to send</div>
              <v-text-field
                v-model="amountSend"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <div class="text-body-1">Select token</div>
              <v-select
                v-model="denom"
                :items="allDenomsTokens"
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="12" md="12">
              <div class="text-body-1">Send to</div>
              <v-text-field
                v-model="addressTo"
                variant="outlined"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <template v-slot:actions>
        <v-btn class="ms-auto" text="Ok" @click="sendToken()"></v-btn>
      </template>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogDelegate" width="650">
    <v-card
      class="rounded-lg"
      prepend-icon="mdi-update"
      text="Delegate your token to a validator."
      title="Delegate token"
    >
      <v-form v-model="valid">
        <v-container>
          <v-row>
            <v-col cols="12" md="12">
              <div v-if="delegationStep1">
                <span class="mr-2">Select an validator</span>
                <v-sheet
                  v-for="item in appStore.allValidators"
                  border="md"
                  class="ma-2 pa-2"
                  @click="selectDelValidator(item)"
                >
                  <v-list lines="one">
                    <v-list-item
                      :key="item.title"
                      :title="item.description.moniker"
                      :subtitle="
                        'Commission: ' +
                        item.commission.commission_rates.rate * 100 +
                        '%'
                      "
                    >
                      <!-- {{ item.commission.commission_rates.rate }} -->
                    </v-list-item>
                  </v-list>
                </v-sheet>
              </div>
              <div v-if="delegationStep2" class="ma-2">
                <!-- {{ selectedValDel }} -->

                <v-form v-model="formDelegate" ref="formDelegate">
                  <v-text-field
                    v-model="delegateAmount"
                    class="mb-4 mt-2"
                    label="Amount to delegate"
                    placeholder="Enter amount"
                    variant="outlined"
                  >
                    <template #append-inner>
                      <v-chip label small @click="getMax"> Max </v-chip>
                    </template>
                  </v-text-field>

                  <v-text-field
                    v-model="delegateTo"
                    label="Address to delegate"
                    placeholder="Enter address"
                    variant="outlined"
                    class="mt-4"
                  >
                  </v-text-field>
                  <!-- <h4 v-if="store.myFeeAllowances.length > 0"> Fee </h4>
            <v-select
              v-model="feeAllowancesFrom"
              v-if="store.myFeeAllowances.length > 0"
              label="Select"
              :items="['', store.myFeeAllowances[0].granter]"
              variant="outlined"
            ></v-select> -->
                </v-form>
                <!-- <FeePayer v-if="store.myFeeAllowances.length > 0" /> -->
                <v-btn
                  :color="cosmosConfig[appStore.setChainSelected].color"
                  block
                  @click="delegate()"
                >
                  Delegate
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
  </v-dialog>
  <v-dialog v-model="appStore.chainOffline" width="650" persistent scrim>
    <v-card>
      <v-empty-state icon="mdi-alert-circle-outline" color="error">
        <template v-slot:headline>
          <div class="text-h4">Your blockchain is not online.</div>
        </template>

        <template v-slot:title>
          <div class="text-h6">To start your blockchain, run this command:</div>
        </template>

        <template v-slot:text>
          <div class="text-medium-emphasis text-caption">
            <code>ignite chain serve</code>
          </div>

          <p class="mt-4">And refresh this page.</p>
        </template>
      </v-empty-state>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref, defineComponent } from "vue";
import { useAppStore } from "@/stores/data";
import cosmosConfig from "@/cosmos.config";
import { selectSigner } from "@/libs/signer.js";
import moment from "moment";

import {
  defaultRegistryTypes,
  calculateFee,
  GasPrice,
  coins,
  assertIsDeliverTxSuccess,
} from "@cosmjs/stargate";

import keplrImage from "@/assets/keplr.png";

export default defineComponent({
  name: "App",
  data() {
    return {
      tab: null,
      cosmosConfig,
      theme: ref("light"),
      publicPath: process.env.BASE_URL,
      moment,
      dialogSend: false,
      dialogDelegate: false,
      allDenomsTokens: [],
      amountSend: 0,
      addressTo: "",
      denom: "",
      valid: false,
      files: [
        {
          color: "blue",
          icon: "mdi-clipboard-text",
          subtitle: "Send any tokens",
          title: "Send token",
        },
        {
          color: "amber",
          icon: "mdi-gesture-tap-button",
          subtitle: "Delegate your token",
          title: "Delegate",
        },
      ],
      keplrImage: keplrImage,
      delegationStep1: true,
      delegationStep2: false,
      selectedValDel: {},
      delegateTo: "",
    };
  },
  watch: {
    dialogSend(newVal) {
      this.allDenomsTokens = [];
      const appStore = useAppStore();
      for (let i = 0; i < appStore.allWalletBalances.length; i++) {
        const denom = appStore.allWalletBalances[i].denom;
        this.allDenomsTokens.push(denom);
      }
    },
  },
  setup() {
    const appStore = useAppStore();
    appStore.initRpc();

    window.addEventListener("keplr_keystorechange", async () => {
      await appStore.keplrConnect();
      await appStore.initRpc();
      await appStore.getAccountInfo();
      await appStore.getBankModule();
      await appStore.getTransactions();
      await appStore.getAllValidators();
    });

    return {
      appStore,
    };
  },
  mounted() {},
  methods: {
    selectDelValidator(item) {
      this.delegationStep1 = false;
      this.delegationStep2 = true;
      this.delegationStep3 = false;
      this.selectedValDel = item;
      this.delegateTo = this.selectedValDel.operator_address;
    },
    onClick() {
      this.theme = this.theme === "light" ? "dark" : "light";
    },
    async sendToken() {
      const appStore = useAppStore();

      const signer = await selectSigner(0);
      const finalMsg = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: appStore.addrWallet,
          toAddress: this.addressTo,
          amount: [
            {
              denom: this.denom,
              amount: this.amountSend.toString(),
            },
          ],
        },
      };
      const finalFee = {
        amount: [
          {
            denom: cosmosConfig.denom,
            amount: "5000",
          },
        ],
        gas: "200000",
      };
      this.dialogSend = true;
      try {
        const result = await signer.client.signAndBroadcast(
          signer.accounts[0].address,
          [finalMsg],
          finalFee,
          "",
        );
        await appStore.getTransactions();
        await appStore.getBankModule();
        this.txResult = result;
      } catch (error) {
        console.error(error);
      }
    },
    async delegate() {
      this.delegationStep1 = false;
      this.delegationStep2 = true;

      if (this.delegate) {
        this.delegationStep1 = false;
        this.delegationStep2 = true;

        const signer = await selectSigner(0);
        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === "/cosmos.staking.v1beta1.MsgDelegate",
        );
        const finalAmount = {
          denom:
            cosmosConfig[this.appStore.setChainSelected].coinLookup.chainDenom,
          amount: (this.delegateAmount * 1000000).toString(),
        };
        const finalMsg = {
          typeUrl: foundMsgType[0],
          value: foundMsgType[1].fromPartial({
            delegatorAddress: signer.accounts[0].address,
            validatorAddress: this.delegateTo,
            amount: finalAmount,
          }),
        };

        // Fee/Gas
        const gasEstimation = await signer.client.simulate(
          signer.accounts[0].address,
          [finalMsg],
          "Delegate Tokens",
        );
        const usedFee = calculateFee(
          Math.round(
            gasEstimation *
              cosmosConfig[this.appStore.setChainSelected].feeMultiplier,
          ),
          GasPrice.fromString(
            cosmosConfig[this.appStore.setChainSelected].gasPrice +
              cosmosConfig[this.appStore.setChainSelected].coinLookup
                .chainDenom,
          ),
        );
        this.gasFee = {
          fee: usedFee.amount[0].amount / 1000000,
          gas: usedFee.gas,
        };

        const feeAmount = coins(
          usedFee.amount[0].amount,
          cosmosConfig[this.appStore.setChainSelected].coinLookup.chainDenom,
        );
        let finalFee = {
          amount: feeAmount,
          gas: usedFee.gas,
          //granter: this.store.setFeePayer,
        };
        try {
          const result = await signer.client.signAndBroadcast(
            signer.accounts[0].address,
            [finalMsg],
            finalFee,
            "",
          );
          console.log(result);
          this.txResult = result;
          this.delegationStep3 = false;
          this.delegationStep4 = true;
        } catch (error) {
          console.error(error);
          this.delegationStep3 = false;
          this.delegationStep2 = true;
        }
      }
    }, 
    formatDate(date) {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(date).toLocaleString("en-US", options);
    },
    formatNum(num) {
      return num.toLocaleString("en-US");
    },
  },
});
</script>
