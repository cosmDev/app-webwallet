<template>
  <v-app :theme="theme" id="inspire">
    <v-app-bar height="72" flat>
      <v-avatar
        class="mx-2"
        color="surface-variant"
        size="32"
        variant="flat"
      ></v-avatar>

      <v-btn class="me-2" color="grey" height="40" variant="flat">Home</v-btn>

      <v-btn disabled class="me-2" color="grey" height="40" variant="flat"
        >Delegations</v-btn
      >

      <v-btn disabled class="me-2" color="grey" height="40" variant="flat">Authz</v-btn>

      <v-btn disabled class="me-2" color="grey" height="40" variant="flat"
        >Feegrant</v-btn
      >

      <v-spacer></v-spacer>
      <v-btn
        v-if="appStore.isLogged === false"
        color="grey"
        class="me-2"
        height="40"
        variant="flat"
        @click="loginWallet"
        >Not connected</v-btn
      >
      <v-btn v-else class="me-2" color="grey" height="40" variant="flat">{{
        appStore.nameWallet.name
      }}</v-btn>
      <v-btn
        :prepend-icon="
          theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'
        "
        height="40"
        class="me-2"
        color="grey"
        @click="onClick"
      ></v-btn>
    </v-app-bar>

    <v-footer color="grey" height="44" app>
      <div class="flex-1-0-100 text-center mt-2">
      {{ new Date().getFullYear() }} — <strong>CosmDev</strong>
    </div>

    </v-footer>

<!--     <v-navigation-drawer>
      <div class="d-flex px-2 my-2">
        <v-avatar class="ms-2" color="surface-variant" variant="flat">
 
        </v-avatar>
      </div>

      <div class="px-2 my-2">
        <v-sheet
          class="mb-2"
          color="surface-variant"
          height="24"
          rounded="pill"
          width="50%"
        ></v-sheet>

        <v-sheet
          class="mb-1"
          color="grey-lighten-1"
          height="12"
          rounded="pill"
          width="40%"
        ></v-sheet>

        <v-sheet
          class="mb-1"
          color="grey-lighten-1"
          height="12"
          rounded="pill"
          width="20%"
        ></v-sheet>

        <v-sheet
          class="mb-1"
          color="grey-lighten-1"
          height="12"
          rounded="pill"
          width="90%"
        ></v-sheet>

        <v-sheet
          color="grey-lighten-1"
          height="12"
          rounded="pill"
          width="70%"
        ></v-sheet>

        <v-divider class="my-6"></v-divider>

        <v-sheet
          class="mb-2"
          color="surface-variant"
          height="24"
          rounded="pill"
          width="30%"
        ></v-sheet>

        <v-sheet
          class="mb-1"
          color="grey-lighten-1"
          height="12"
          rounded="pill"
          width="65%"
        ></v-sheet>

        <v-sheet
          class="mb-1"
          color="grey-lighten-1"
          height="12"
          rounded="pill"
          width="70%"
        ></v-sheet>

        <v-sheet
          class="mb-1"
          color="grey-lighten-1"
          height="12"
          rounded="pill"
          width="40%"
        ></v-sheet>

        <v-sheet
          color="grey-lighten-1"
          height="12"
          rounded="pill"
          width="100%"
        ></v-sheet>

        <v-divider class="my-6"></v-divider>
      </div>
    </v-navigation-drawer> -->

    <v-main>
      <v-container fluid>
        <v-row v-if="appStore.isLogged === true">
          <v-col cols="4">
            <v-card class="mx-auto my-4" elevation="16" height="330" rounded>
              <v-card-item>
                <v-card-title> Wallet info </v-card-title>
                <template v-slot:append> 

                  
                </template>
                
                <v-card-subtitle>
                  <v-avatar  size="x-small">
                      <v-img alt="keplrImage" :src="keplrImage"></v-img>
                    </v-avatar>
                  {{ appStore.nameWallet.name }}
                </v-card-subtitle>
              </v-card-item>


              <v-list lines="two">
                <v-list-item  
                  title="Cosmos address"
                >
                  <template v-slot:subtitle>
                    <span class="text-caption">{{ appStore.addrWallet }}</span>
                  </template>
                  <template v-slot:prepend>
                    <v-avatar >
                      <v-icon >mdi-atom</v-icon>
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
                  title="Bitcoin address"
                >
                  <template v-slot:subtitle>
                    <span class="text-caption">{{ appStore.btcAddress[0] }}</span>
                  </template>
                  <template v-slot:prepend>
                    <v-avatar >
                      <v-icon >mdi-bitcoin</v-icon>
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
                  title="Ethereum address"
                >
                  <template v-slot:subtitle>
                    <span class="text-caption">{{ appStore.nameWallet.ethereumHexAddress }}</span>
                  </template>
                  <template v-slot:prepend>
                    <v-avatar >
                      <v-icon >mdi-ethereum</v-icon>
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
<!--               <v-card-text>
                {{ appStore.addrWallet }}
                {{ appStore.nameWallet.ethereumHexAddress }}
                <br />
                {{ appStore.btcAddress[0] }}
              </v-card-text> -->
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card class="mx-auto my-4" elevation="16" height="330" rounded>
              <v-card-item>
                <v-card-title> Wallet tokens </v-card-title>
                <template v-slot:append>
                  {{ appStore.allWalletBalances.length }} TOKENS
                </template>
                <v-card-subtitle>
                  Card subtitle secondary text
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
                      <td>$0</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card class="mx-auto my-4" elevation="16" height="330" rounded>
              <v-card-item>
                <v-card-title> Wallet actions </v-card-title>
                <template v-slot:append>
                  <v-icon color="success" icon="mdi-check"></v-icon>
                </template>
                <v-card-subtitle>
                  Card subtitle secondary text
                </v-card-subtitle>
              </v-card-item>

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

                  <v-list-item subtitle="Delegate your token" title="Delegate" @click="dialogDelegate = true">
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
        </v-row>
      </v-container> 
      <v-container fluid>
  <v-sheet v-if="appStore.isLogged === true" border class="ma-2 pa-2" rounded="lg"> 
    <v-row no-gutters>
      <v-col cols="12" sm="6">
        <v-sheet class="text-h6 pa-2">Last 10 transactions</v-sheet>
      </v-col>
    </v-row>
    <v-table>
    <thead>
      <tr>
        <th class="text-left">
          Tx type
        </th>
        <th class="text-left">
          Date
        </th>
        <th class="text-left">
          Data
        </th>
        <th class="text-left">
          State
        </th>
        <th class="text-left">
           
        </th>        
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in appStore.lastTransactions"
        :key="item.name"
      >
        <td>
          <v-chip
            class="ma-2"
            :color="cosmosConfig[appStore.setChainSelected].color"
            label
            variant="outlined"
          >{{ item.titleMsg }}
          </v-chip> 
        </td>
        <td>{{ formatDate(item.timestamp) }}</td>
        <td v-if="item.finalData.amount?.data.amount">
          {{ item.finalData.amount?.data.amount / 1000000 }}
          <strong :style="'color:' + cosmosConfig[appStore.setChainSelected].color">
            <!-- {{ cosmosConfig[appStore.setChainSelected].coinLookup.viewDenom }} -->
            {{ item.finalData.viewDenom?.data }}
          </strong>
        </td>  
        <td v-else></td>      
        <td>
          <v-icon v-if="item.code === 0" color="success" icon="mdi-check-bold"></v-icon>
          <v-icon v-else color="error" icon="mdi-close-thick"></v-icon>
        </td>
        <td>
          <v-chip
            :color="cosmosConfig[appStore.setChainSelected].color"
            class="ma-2"
            label
            :to="'/transactions/' + cosmosConfig[appStore.setChainSelected].slot + '/' + item.txhash"
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
                        :subtitle="'Commission: ' + item.commission.commission_rates.rate * 100 + '%'"
                      >
                      <!-- {{ item.commission.commission_rates.rate }} -->
                    </v-list-item>
                    </v-list>
                    </v-sheet>

                  </div>
                  <div v-if="delegationStep2" class="ma-2 ">
              <!-- {{ selectedValDel }} -->


              <v-form
              v-model="formDelegate"
              ref="formDelegate"
            >
              <v-text-field
                v-model="delegateAmount" 
                class="mb-4 mt-2"
                label="Amount to delegate"
                placeholder="Enter amount"
                variant="outlined"
              >
              <template #append-inner>
                <v-chip
                  label
                  small
                  @click="getMax"
                >
                  Max
                </v-chip>
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
      <v-dialog v-model="appStore.chainOffline" width="650" persistent>
        <v-card 
        >
        <v-empty-state icon="mdi-alert-circle-outline" color="error">
 

          <template v-slot:headline>
            <div class="text-h4">
              Your blockchain is not online.
            </div>
          </template>

          <template v-slot:title>
            <div class="text-h6">
              To start your blockchain, run this command:
            </div>
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
    </v-main>
  </v-app>
</template>
<script>
import { ref, defineComponent } from "vue";
import { useAppStore } from "@/stores/app";
import cosmosConfig from "./cosmos.config";
import { selectSigner } from "@/libs/signer.js";

import {
  defaultRegistryTypes,
  calculateFee,
  GasPrice,
  coins,
  assertIsDeliverTxSuccess,

} from "@cosmjs/stargate";

import keplrImage from "./assets/keplr.png";

export default defineComponent({
  name: "App",
  data() {
    return {
      cosmosConfig,
      theme: ref("light"),
      publicPath: process.env.BASE_URL,
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
  setup() {
    const appStore = useAppStore(); 
    appStore.initRpc();

    window.addEventListener("keplr_keystorechange", async () => {
      console.log("Keplr key store has changed. Refetching account info...");
      // Refetch account or key information here 
      await appStore.keplrConnect();
      console.log(appStore.addrWallet);

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
  methods: {
    selectDelValidator(item) {
      console.log(item)
      this.delegationStep1 = false;
      this.delegationStep2 = true;
      this.delegationStep3 = false;
      this.selectedValDel = item
      this.delegateTo = this.selectedValDel.operator_address
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
      console.log("finalMsg", finalMsg);

      this.dialogSend = true;

      console.log("amountSend", this.amountSend);
      console.log("addressTo", this.addressTo);
      console.log("denom", this.denom);

      try {
        const result = await signer.client.signAndBroadcast(
          signer.accounts[0].address,
          [finalMsg],
          finalFee,
          "",
        );
        //assertIsDeliverTxSuccess(result)
        console.log(result);
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
        console.log(this.delegateAmount)
        console.log(this.delegateTo)

        const signer = await selectSigner(0);
        const foundMsgType = defaultRegistryTypes.find(
            (element) =>
              element[0] ===
              "/cosmos.staking.v1beta1.MsgDelegate"
          );
          console.log(foundMsgType)

          //const amount = coins(this.delegateAmount * 1000000, cosmosConfig[this.store.setChainSelected].coinLookup.chainDenom);

          const finalAmount =  {
              denom: cosmosConfig[this.appStore.setChainSelected].coinLookup.chainDenom,
              amount: (this.delegateAmount * 1000000).toString(),
          }
          const finalMsg = {
            typeUrl: foundMsgType[0],
            value: foundMsgType[1].fromPartial({
              delegatorAddress: signer.accounts[0].address,
              validatorAddress: this.delegateTo,
              amount: finalAmount,
            }),
          }
          console.log('delegateTx', finalMsg)

          // Fee/Gas
          const gasEstimation = await signer.client.simulate(
            signer.accounts[0].address,
            [finalMsg],
            'Delegate Tokens'
          );
          const usedFee = calculateFee(
            Math.round(gasEstimation * cosmosConfig[this.appStore.setChainSelected].feeMultiplier),
            GasPrice.fromString(
              cosmosConfig[this.appStore.setChainSelected].gasPrice +
                cosmosConfig[this.appStore.setChainSelected].coinLookup.chainDenom
            )
          );
          this.gasFee = { fee: (usedFee.amount[0].amount / 1000000), gas: usedFee.gas };

          const feeAmount = coins(usedFee.amount[0].amount, cosmosConfig[this.appStore.setChainSelected].coinLookup.chainDenom);
          let finalFee = {
            amount: feeAmount,
            gas: usedFee.gas,
            //granter: this.store.setFeePayer,
          }
          console.log(finalFee)
        try {
          const result = await signer.client.signAndBroadcast(signer.accounts[0].address, [finalMsg], finalFee, '')
          assertIsDeliverTxSuccess(result)
          console.log(result)
          this.txResult = result
          this.delegationStep3 = false;
          this.delegationStep4 = true;
        } catch (error) {
          console.error(error);
          this.delegationStep3 = false;
          this.delegationStep2 = true;
        }
      }

    },
    async loginWallet() {
      const appStore = useAppStore();
      await appStore.keplrConnect();
      console.log(appStore.addrWallet);

      await appStore.initRpc();
      await appStore.getAccountInfo();
      await appStore.getBankModule();
      await appStore.getTransactions();
      await appStore.getAllValidators();

      for (let i = 0; i < appStore.allWalletBalances.length; i++) {
        const denom = appStore.allWalletBalances[i].denom;
        this.allDenomsTokens.push(denom);
      }

      console.log(appStore.spendableBalances);
      console.log(appStore.allWalletBalances);
      console.log(appStore.nameWallet);
    },
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(date).toLocaleString('en-US', options);
    },
    formatNum(num) {
      return num.toLocaleString('en-US');
    }
  },
});
</script>
