<template>
  <!-- {{ this.$route.params.txhash }} -->
  <v-container>
    <v-row v-if="isloaded && txStatus !== 0" no-gutters>
      <v-col>
        <v-alert
          variant="outlined"
          type="error"
          title="Transaction failed"
          prominent
          border="top"
          class="ma-2 pa-2"
        >
          {{ txMsgStatus }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <v-sheet border rounded="lg">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>
              <v-icon
                :color="foundChain.color"
                icon="mdi-state-machine"
                class="mr-2"
              ></v-icon>
              Tx status
            </v-toolbar-title>
          </v-toolbar>
          <span v-if="isloaded && txStatus !== 0">
            <p class="mt-2 pa-2 text-right">
              <v-icon
                color="red-darken-2"
                icon="mdi-close-thick"
                class="mr-2"
              ></v-icon>
              Failed
            </p>
          </span>
          <span v-else>
            <p class="mt-2 pa-2 text-right">
              <v-icon
                color="green-darken-2"
                icon="mdi-check-bold"
                class="mr-2"
              ></v-icon>
              Success
            </p>
          </span>
        </v-sheet>
      </v-col>
      <!-- <v-col>
      <v-sheet border class="ma-2 pa-2" rounded="lg">
        <h3 class="ma-2">
          <v-icon color="white" icon="mdi-counter" class="mr-2"></v-icon>
          Total messages
        </h3>
        <v-divider />
        <p class="mt-6 text-right">
          {{ totalMessages }}
          <strong :style="'color: white'"> messages </strong>
        </p>
      </v-sheet>
    </v-col> -->
      <v-col>
        <v-sheet border rounded="lg">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>
              <v-icon
                :color="foundChain.color"
                icon="mdi-calendar-range"
                class="mr-2"
              ></v-icon>
              Tx Date
            </v-toolbar-title>
          </v-toolbar>
          <p class="mt-2 pa-2 text-right">
            {{
              moment(txData.tx_response?.timestamp).format(
                "MMMM Do YYYY, h:mm:ss a",
              )
            }}
          </p>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6">
        <v-sheet border height="100%" rounded="lg">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>
              <v-icon
                :color="foundChain.color"
                icon="mdi-information-box-outline"
                class="mr-2"
              ></v-icon>
              Tx Info
            </v-toolbar-title>
          </v-toolbar>
          <v-table>
            <tbody>
              <tr>
                <td>Tx hash</td>
                <td class="text-caption">{{ txHash }}</td>
              </tr>
              <tr v-for="(value, key) in allMessages[0]" :key="key">
                <td v-if="key !== 'finalData'">
                  <span v-if="key === 'delegator_address'"
                    >Delegator address</span
                  >
                  <span v-else-if="key === 'validator_address'"
                    >Validator address</span
                  >
                  <span v-else-if="key === 'proposal_id'">Proposal id</span>
                  <span v-else-if="key === 'to_address'">To address</span>
                  <span v-else-if="key === 'from_address'">From address</span>

                  <span v-else>{{ key }}</span>
                </td>
                <td v-if="key === 'proposal_id'">
                  {{ value[0] }}
                </td>
                <td v-if="key === 'voter'">
                  {{ value }}
                </td>
                <td v-if="key === 'amount'">
                  <b v-if="value[0]">{{
                    formatNumber(value[0].amount / 1000000)
                  }}</b>
                  <b v-else>{{ formatNumber(value.amount / 1000000) }}</b>
                  <strong :style="'color:' + foundChain.color" class="ml-2">
                    {{ foundChain.coinLookup.viewDenom }}
                  </strong>
                </td>
                <td v-else-if="key === '@type'">
                  <v-chip label :color="allMessages[0].finalData?.color">
                    {{ allMessages[0].finalData?.typeReadable }}
                  </v-chip>
                </td>
                <td v-else-if="key === 'proposers'">
                  <strong :style="'color:' + foundChain.color">
                    {{ value[0] }}
                  </strong>
                </td>
                <td v-else-if="key === 'metadata'">
                  {{ value }}
                </td>
                <td v-else-if="key === 'allowance'">
                  <v-table>
                    <tbody>
                      <tr>
                        <td>Fee allowance type</td>
                        <td>{{ value["@type"] }}</td>
                      </tr>
                      <tr>
                        <td>Spend limit</td>
                        <td>
                          {{ value.spend_limit[0].amount / 1000000 }}
                          <strong :style="'color:' + foundChain.color">
                            {{ foundChain.coinLookup.viewDenom }}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </td>
                <td v-else-if="key === 'token'">
                  {{ value.amount / 1000000 }}
                  <strong :style="'color:' + foundChain.color">
                    {{ foundChain.coinLookup.viewDenom }}
                  </strong>
                </td>
                <td v-else-if="key === 'timeout_height'">
                  revision number: {{ value.revision_number }} / revision
                  height:
                  {{ value.revision_height }}
                </td>
                <td v-else-if="key === 'option'">
                  <v-chip
                    v-if="value === 'VOTE_OPTION_YES'"
                    label
                    :color="allMessages[0].finalData?.color"
                  >
                    YES
                  </v-chip>
                  <v-chip v-if="value === 'VOTE_OPTION_NO'" label color="red">
                    NO
                  </v-chip>
                  <v-chip
                    v-if="value === 'VOTE_OPTION_ABSTAIN'"
                    label
                    color="orange"
                  >
                    ABSTAIN
                  </v-chip>
                  <v-chip
                    v-if="value === 'VOTE_OPTION_NO_WITH_VETO'"
                    label
                    color="orange"
                  >
                    NO WITH VETO
                  </v-chip>
                </td>
                <td v-else-if="key === 'delegator_address'">
                  <v-chip label :to="'../address/' + value">
                    {{ value }}
                  </v-chip>
                </td>
                <td v-else-if="key === 'validator_address'">
                  <v-chip label :to="'../validator/' + value">
                    {{ value }}
                  </v-chip>
                </td>
                <td v-else-if="key === 'from_address'">
                  <v-chip label :to="'../address/' + value">
                    {{ value }}
                  </v-chip>
                </td>
                <td v-else-if="key === 'to_address'">
                  <v-chip label :to="'../address/' + value">
                    {{ value }}
                  </v-chip>
                </td>
                <!-- <td v-else-if="key !== 'finalData'">{{ value }}</td> -->
              </tr>
            </tbody>
          </v-table>
        </v-sheet>
      </v-col>
      <v-col cols="12" sm="6">
        <v-sheet border height="100%" rounded="lg">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>
              <v-icon
                :color="foundChain.color"
                icon="mdi-currency-usd"
                class="mr-2"
              ></v-icon>
              Tx Fee
            </v-toolbar-title>
          </v-toolbar>
          <v-table>
            <tbody>
              <tr v-for="(value, key) in txData.tx?.auth_info.fee" :key="key">
                <td v-if="key === 'amount'">Amount Fee</td>
                <td v-else-if="key === 'gas_limit'">Gas wanted / Gas used</td>
                <td v-else-if="key === 'payer'">Payer</td>
                <td v-else-if="key === 'granter'">Granter</td>
                <td v-else>{{ key }}</td>

                <td v-if="key === 'amount'">
                  {{ value[0].amount / 1000000 }}
                  <strong :style="'color:' + foundChain.color">
                    {{ foundChain.coinLookup.viewDenom }}
                  </strong>
                </td>
                <td v-else-if="key === 'gas_limit'">
                  {{ formatNumber(txData.tx_response.gas_wanted) }} /
                  {{ formatNumber(txData.tx_response.gas_used) }}
                </td>
                <td v-else>{{ value }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-sheet>
      </v-col>
    </v-row>
    <!-- <v-row no-gutters>
      <v-col>
        <v-sheet border class="ma-2 pa-2" min-height="300" rounded="lg">
          <h3 class="ma-2 pa-2">Tx Fee</h3>
          <v-divider />
  
          <div class="text-center d-flex pb-4">
            <v-btn class="ma-2" @click="all">
              All
            </v-btn>
            <v-btn class="ma-2" @click="none">
              None
            </v-btn>
          </div>
  
          <div class="pb-4">v-model {{ panel }}</div>
  
          <v-expansion-panels
            v-model="panel"
            multiple
          >
            <v-expansion-panel
              v-for="(item, i) in txData.tx?.body.messages"
              :title="item['@type']"
              :text="item.delegator_address"
              :value="i"
            > </v-expansion-panel>
          </v-expansion-panels>
      
        </v-sheet>
      </v-col> 
    </v-row> -->

    <!--   <v-sheet border class="ma-2 pa-2" min-height="100" rounded="lg">        
      <h3 class="ma-2 pa-2">Json transaction</h3>
      <v-divider />      
   
  
      <json-viewer :value="txData" theme="jv-dark"></json-viewer>
    </v-sheet> -->

    <v-sheet border class="my-6 pa-2" rounded="lg">
      <v-table>
        <thead>
          <tr>
            <th class="text-left">Message type</th>
            <th class="text-left">Date</th>
            <th class="text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in allMessages" :key="item.name">
            <td>
              <v-chip class="ma-2" label :color="item.finalData?.color">
                {{ item.finalData?.typeReadable }}
              </v-chip>
            </td>
            <td>
              {{
                moment(txData.tx_response?.timestamp).format(
                  "MMMM Do YYYY, h:mm:ss a",
                )
              }}
            </td>
            <td v-if="item.finalData?.msgData.amount">
              {{ item.finalData.msgData.amount }}
              <strong :style="'color:' + foundChain.color">
                {{ foundChain.coinLookup.viewDenom }}
              </strong>
            </td>
            <td v-else>-</td>
          </tr>
        </tbody>
      </v-table>
    </v-sheet>
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";

import cosmosConfig from "@/cosmos.config";
import { useAppStore } from "@/stores/data";
import { setMsg } from "@/libs/msgTypeTxDetail";

export default {
  name: "DetailTx",
  data: () => ({
    cosmosConfig: cosmosConfig,
    moment,
    txHash: "",
    chain: "",
    foundChain: "",
    txData: "",
    totalMessages: 0,
    txStatus: "",
    txMsgStatus: "",
    panel: [],
    formatedData: [],
    isloaded: false,
    allMessages: [],
  }),
  setup() {
    const store = useAppStore();
    return { store };
  },
  async mounted() {
    await this.store.initRpc();
    await this.store.getAllValidators();

    console.log("mounted");
    console.log("mounted tx", this.$route.params.txHash);

    this.txHash = this.$route.params.txHash;
    this.foundChain = cosmosConfig[0];

    //this.store.searchTx(this.$route.params.txhash);

    const allProposals = await axios(
      cosmosConfig[0].apiURL + "/cosmos/tx/v1beta1/txs/" + this.txHash,
    );
    this.txData = allProposals.data;
    this.totalMessages = allProposals.data.tx.body.messages.length;
    this.allMessages = allProposals.data.tx.body.messages;
    this.txStatus = allProposals.data.tx_response.code;
    this.txMsgStatus = allProposals.data.tx_response.raw_log;

    for (let message of this.allMessages) {
      let formatMsg = setMsg(
        message["@type"],
        message,
        "",
        Date.now(),
        this.store.allValidators,
        allProposals.data.tx_response.txhash,
      );
      message.finalData = formatMsg;
    }
    this.isloaded = true;
  },

  methods: {
    formatNumber(value) {
      return new Intl.NumberFormat().format(value);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("default", { dateStyle: "long" }).format(
        date,
      );
    },
  },
};
</script>
