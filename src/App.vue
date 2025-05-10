<template>
  <v-app :theme="theme" id="inspire">
    <v-app-bar height="72" flat>
      <v-avatar
        class="mx-2"
        color="surface-variant"
        size="32"
        variant="flat"
      ></v-avatar>

      <v-btn class="me-2" height="40" variant="outlined" to="/">Home</v-btn>

      <v-btn
        id="menu-activator"
        :disabled="appStore.isLogged === false"
        class="me-2"
        height="40"
        variant="outlined"
      >
        Governance
      </v-btn>

      <v-menu activator="#menu-activator">
        <v-list>
          <v-list-item
            v-for="(item, index) in govMenu"
            :key="index"
            :value="index"
            :to="item.to"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn disabled class="me-2" height="40" variant="outlined"
        >Delegations</v-btn
      >

      <v-btn disabled class="me-2" height="40" variant="outlined">Authz</v-btn>

      <v-btn disabled class="me-2" height="40" variant="outlined"
        >Feegrant</v-btn
      >

      <v-spacer></v-spacer>
      <v-btn
        v-if="appStore.isLogged === false"
        class="me-2"
        height="40"
        variant="outlined"
        @click="loginWallet"
        >Not connected</v-btn
      >
      <v-btn v-else class="me-2" height="40" variant="outlined">{{
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

    <!--     <v-footer color="grey" height="44" app>
      <div class="flex-1-0-100 text-center mt-2">
        {{ new Date().getFullYear() }} — <strong>CosmDev</strong>
      </div>
    </v-footer> -->

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
      <RouterView />
    </v-main>

    <v-dialog
      v-model="dialogFaucet"
      width="600"
      scrim="true"
      opacity="0.9"
      persistent
    >
      <v-card >
        <v-empty-state icon="$success">
          <template v-slot:media>
            <v-icon v-if="faucetDone" color="green"></v-icon>
          </template>

          <template v-slot:headline>
              <v-progress-circular
                v-if="!faucetDone"
                indeterminate
                :size="128"
                class="mt-6"
              ></v-progress-circular>
            <div v-if="!faucetDone" class="text-h4 mt-4">
              Wait from faucet
            </div>
          </template>

          <template v-slot:title>
            <div v-if="faucetDone" class="text-h6">
              Everything's good!
            </div>
          </template>

          <template v-slot:text>
            <div v-if="faucetDone" class="text-medium-emphasis text-caption">
             
You've received some tokens to start using your wallet.
            </div>
          </template>
        </v-empty-state>

        <template v-slot:actions>
          <v-btn
            block
            variant="text"
            @click="dialogFaucet = false"
          >
            Close
          </v-btn>
        </template>
      </v-card>
    </v-dialog>


  </v-app>
</template>
<script>
import { ref, defineComponent } from "vue";
import { useAppStore } from "@/stores/data";
import cosmosConfig from "./cosmos.config";
import { selectSigner } from "@/libs/signer.js";
import axios from "axios";

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
      dialogFaucet: false,
      faucetDone: false,
      theme: ref("light"),
      publicPath: process.env.BASE_URL,
      dialogSend: false,
      dialogDelegate: false,
      amountSend: 0,
      addressTo: "",
      denom: "",
      valid: false,
      govMenu: [
        {
          title: "All prpoposals",
          icon: "mdi-file-document-edit-outline",
          to: "/all-proposals",
        },
        {
          title: "Create proposal",
          icon: "mdi-file-document-edit-outline",
          to: "/create-proposal",
        },
      ],
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
    window.addEventListener("keplr_keystorechange", async () => {
      await appStore.keplrConnect();
      await appStore.getAccountInfo();
      await appStore.getBankModule();
      await appStore.getTransactions();
      await appStore.getAllValidators();
    });
    window.addEventListener("keplr_bitcoinAccountsChanged", async () => {
      await appStore.keplrConnect();
    });

    return {
      appStore,
    };
  },
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

        const signer = await selectSigner(0);
        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === "/cosmos.staking.v1beta1.MsgDelegate",
        );
        if (!foundMsgType) {
          console.error("MsgDelegate not found in registry types");
          return;
        }
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
    async loginWallet() {
      const appStore = useAppStore();
      await appStore.keplrConnect();
      await appStore.initRpc();
      await appStore.getAccountInfo();
      await appStore.getBankModule();
      await appStore.getTransactions();
      await appStore.getAllValidators();
      await appStore.getAllPrice();

      

      if (appStore.allWalletBalances.length === 0) {
        this.dialogFaucet = true;
        this.faucetDone = false;
        console.log("No wallet balances found.");
        await axios
          .get(
            `https://cosmos-api.cosmdev.com/faucet/chaindev/${appStore.addrWallet}`,
          )
          .then((response) => {
            console.log("Faucet response:", response.data);
            this.faucetDone = true;
            appStore.getBankModule();
            appStore.getTransactions();
          })
          .catch((error) => {
            console.error("Error fetching faucet data:", error);
          });
        return;
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
