<template>
  <v-app :theme="theme" id="inspire">
    <v-app-bar height="72" flat>
      <v-avatar class="mx-2" size="32" variant="flat"
        ><v-icon>mdi-atom</v-icon></v-avatar
      >

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

      <v-btn
        class="me-2"
        height="40"
        variant="outlined"
        to="/my-delegations"
        :disabled="appStore.isLogged === false"
      >
        My Delegations</v-btn
      >

      <v-btn
        class="me-2"
        height="40"
        variant="outlined"
        to="/my-authz"
        :disabled="appStore.isLogged === false"
      >
        My Authz</v-btn
      >

      <v-btn
        class="me-2"
        height="40"
        variant="outlined"
        :disabled="appStore.isLogged === false"
        to="/fee-grants"
      >
        My Feegrant
      </v-btn>

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
      <span class="me-6">V{{ nodejsConfig.version }}</span>
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
      <v-card>
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
            <div v-if="!faucetDone" class="text-h4 mt-4">Wait from faucet</div>
          </template>

          <template v-slot:title>
            <div v-if="faucetDone" class="text-h6">Everything's good!</div>
          </template>

          <template v-slot:text>
            <div v-if="faucetDone" class="text-medium-emphasis text-caption">
              You've received some tokens to start using your wallet.
            </div>
          </template>
        </v-empty-state>

        <template v-slot:actions>
          <v-btn block variant="text" @click="dialogFaucet = false">
            Close
          </v-btn>
        </template>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<script>
import { ref, defineComponent } from "vue";
import nodejsConfig from "../package.json";
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
      nodejsConfig,
      dialogFaucet: false,
      faucetDone: false,
      theme: ref("dark"),
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
    return {
      appStore,
    };
  },
  async beforeMount() {
    await this.startConnect();
    window.addEventListener("keplr_keystorechange", async () => {
      await this.startConnect();
    });
    window.addEventListener("keplr_bitcoinAccountsChanged", async () => {
      await appStore.keplrConnect();
    });    
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
    async loginWallet() {
      await this.startConnect();
    },
    async startConnect() {
      const appStore = useAppStore();
      await appStore.keplrConnect();
      await appStore.initRpc();
      await appStore.getAccountInfo();
      await appStore.getBankModule();
      await appStore.getStakingModule();
      await appStore.getTransactions();
      await appStore.getAllValidators();
      await appStore.getAllPrice();
      await appStore.getFeeGrantModule();
      await appStore.getAuthzModule();

      await this.startFaucet();
      console.log("Wallet connected");
    },
    async startFaucet() {
      if (this.appStore.allWalletBalances.length === 0) {
        this.dialogFaucet = true;
        this.faucetDone = false;
        console.log("No wallet balances found.");
        console.log("Start faucet...");
        const appStore = useAppStore();
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
