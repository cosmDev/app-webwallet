<template>
  <v-container fluid>
    <v-sheet border class="ma-2 pa-2" rounded="lg">
      <v-row no-gutters>
        <v-col cols="12" sm="6">
          <v-sheet class="text-h6 pa-2">All proposals</v-sheet>
        </v-col>
      </v-row>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">Proposal id</th>
            <th class="text-left">Proposal title</th>
            <th class="text-left">Proposal status</th>
            <th class="text-left">Voting end time</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in this.appStore?.allProposals"
            :key="item.proposal_id"
          >
            <td>{{ item.proposal_id }}</td>
            <td>{{ item.title }}</td>
            <td>
              
              <v-sheet class="pa-2"> 
                <v-chip
                v-if="item.status === 'PROPOSAL_STATUS_VOTING_PERIOD'" 
                  color="orange"
                  text-color="white"
                  label
                >
                  <v-icon class="mr-1">
                    mdi-checkbox-marked-circle
                  </v-icon>
                  PROPOSAL VOTING PERIOD
                </v-chip> 
                <v-chip
                v-if="item.status === 'PROPOSAL_STATUS_PASSED'" 
                  color="green"
                  text-color="white"
                  label
                >
                  <v-icon class="mr-1">
                    mdi-checkbox-marked-circle
                  </v-icon>
                  PROPOSAL PASSED
                </v-chip>     
                <v-chip
                v-if="item.status === 'PROPOSAL_STATUS_REJECTED'" 
                  color="red"
                  text-color="white"
                  label
                >
                  <v-icon class="mr-1">
                    mdi-close-circle-outline
                  </v-icon>
                  PROPOSAL REJECTED
                </v-chip>             
              </v-sheet>              
              
              </td>
            <td>
              {{ moment(item.voting_end_time).format('llll') }}
              <v-chip
                class="ma-2"
                label
              >
                {{ moment(item.voting_end_time).fromNow() }}
              </v-chip>
              </td>

            <td v-if="item.failed_reason == ''">
              <v-btn
                v-if="item.status === 'PROPOSAL_STATUS_VOTING_PERIOD'"
                @click="openDialVote(item.proposal_id)"
              >
                Vote
              </v-btn>
            </td>
            <td v-else>{{ item.failed_reason }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-sheet>
  </v-container>

  <v-dialog v-model="dialog" max-width="600">
    <v-card
      prepend-icon="mdi-update"
      :title="'Vote on proposal ' + proposalDetails"
    >
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-card
              text="Vote Yes on the proposal"
              title="Yes"
              @click="voteNow(1)"
            ></v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card
              text="Vote No on the proposal"
              title="No"
              @click="voteNow(2)"
            ></v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card
              text="Vote No with veto on the proposal"
              title="No with veto"
              @click="voteNow(3)"
            ></v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card
              text="Vote Abstain on the proposal"
              title="Abstain"
              @click="voteNow(4)"
            ></v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from "moment";
import { coins } from "@cosmjs/proto-signing";
import { useAppStore } from "@/stores/data";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { selectSigner } from "@/libs/signer";

export default {
  name: "AllProposalsView",
  data() {
    return {
      moment: moment,
      dialog: false,
      proposalType: "",
      proposalTypes: [
        "text",
        "community-pool-spend",
        "software-upgrade",
        "cancel-software-upgrade",
        "update-parameters",
        "other",
      ],
      proposalTypeSelected: "",
      appStore: null,
      proposalDetails: 0,
    };
  },
  async mounted() {
    this.appStore = useAppStore();
    await this.appStore.getSdkVersion();
    await this.appStore.getAllProps();

    console.log("AllProposalsView mounted", this.appStore.allProposals);
  },
  methods: {
    openDialVote(id) {
      this.dialog = true;
      this.proposalDetails = id;
    },
    async voteNow(voteValue) {
      this.dialog = false;
      console.log("Vote now");

      let signer = await selectSigner(0);
      console.log("Signer:", signer);

      const voteMessage = {
        typeUrl: "/cosmos.gov.v1beta1.MsgVote",
        value: MsgVote.fromPartial({
          proposalId: this.proposalDetails,
          voter: this.appStore.addrWallet,
          option: voteValue, // Ensure this is set to the desired vote option
        }),
      };
      console.log("Vote message:", voteMessage);

      const fee = {
        amount: coins(5000, "stake"),
        gas: "300000",
      };

      try {
        const result = await signer.client.signAndBroadcast(
          this.appStore.addrWallet,
          [voteMessage],
          fee,
        );
        console.log("Vote transaction result:", result);
      } catch (error) {
        console.error("Error while voting:", error);
      }
    },
  },
};
</script>
