<template>
  <v-col cols="12" md="2"></v-col>
  <v-col cols="12" md="8">
    <v-sheet rounded="lg">
      <v-row>
        <v-col cols="12" md="6">
          <v-sheet border class="ma-2" rounded="lg">
            <v-toolbar class="rounded-t-lg">
              <v-toolbar-title>Update Parameters</v-toolbar-title>
            </v-toolbar>
            <div class="mt-4 pa-2">
              <v-text-field
                v-model="proposalTitle"
                label="Proposal title"
                variant="outlined"
                required
              ></v-text-field>
              <v-text-field
                v-model="proposalSummary"
                label="Proposal summary"
                variant="outlined"
                required
              ></v-text-field>
              <v-textarea
                v-model="proposalDescription"
                label="Label"
                variant="outlined"
              ></v-textarea>
              <v-text-field
                v-model="proposalMinDeposit"
                label="Minimum deposit"
                variant="outlined"
                required
              ></v-text-field>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" md="6">
          <v-sheet border class="ma-2" rounded="lg">
            <v-toolbar class="rounded-t-lg">
              <v-toolbar-title>Config update parameters</v-toolbar-title>
            </v-toolbar>
            <div class="mt-4 pa-2"></div>
            <v-col cols="12" sm="12">
              <v-select
                v-model="selectedModule"
                label="Select module type"
                variant="outlined"
                density="compact"
                :items="allModules"
                item-title="name"
              ></v-select>
            </v-col>
            <v-row no-gutters v-for="(value, key) in selectedModuleParameters">
              <v-col cols="12" sm="6" class="ma-2">
                <v-text-field
                  v-model="selectedModule.key"
                  readonly
                  variant="outlined"
                  class="mr-2"
                  required
                  density="compact"
                  :value="key"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="5" class="ma-2">
                <v-text-field
                  v-model="selectedModule.value"
                  variant="outlined"
                  required
                  density="compact"
                  :value="value"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-sheet>
          <!--           <v-sheet border class="ma-2" rounded="lg">
            <v-toolbar class="rounded-t-lg">
              <v-toolbar-title>Config update parameters</v-toolbar-title>
            </v-toolbar>
            <div class="mt-4 pa-2">
 
              <div
                v-for="(input, index) in moduleType"
                :key="`moduleType-${index}`"
                class="input wrapper flex items-center"
              >    
                <v-row no-gutters>
                  <v-col 
                    cols="12"
                    sm="10"
                  >
                    <v-select
                      v-model="selectedModule"
                      label="Select module type"
                      variant="outlined"
                      density="compact"
                      :items="allModules"
                    ></v-select>
                  </v-col>
                  <v-col 
                    cols="12"
                    sm="5"
                    v-for="(value, key) in selectedModuleParameters"
                  >
                    <v-text-field
                      v-model="input.key"
 
                      variant="outlined"
                      class="mr-2"
                      required
                      density="compact"
                      :value="key"
                    ></v-text-field>
                    <v-text-field
                      v-model="input.value" 
                      variant="outlined"
                      required
                      density="compact"
                      :value="value"
                    ></v-text-field>
                  </v-col>
                  <v-col 
                    cols="12"
                    sm="5"
                  >

                  </v-col>

                  {{ selectedModuleParameters }}
                  <v-col 
                    cols="12"
                    sm="2"
                  >
          
                <svg
                  @click="addField(input, moduleType)"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  class="ml-2 cursor-pointer"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    fill="green"
                    d="M11 11V7h2v4h4v2h-4v4h-2v-4H7v-2h4zm1 11C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
                  />
                </svg>

    
                <svg
                  v-show="moduleType.length > 1"
                  @click="removeField(index, moduleType)"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  class="ml-2 cursor-pointer"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    fill="#EC4899"
                    d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z"
                  />
                </svg>
                  </v-col>
 


                </v-row>
 


              </div>
            </div>  
          </v-sheet> -->
          <v-sheet border class="ma-2" rounded="lg">
            <v-toolbar class="rounded-t-lg">
              <v-toolbar-title>Proposal preview</v-toolbar-title>
            </v-toolbar>
            <MarkdownRenderer
              :source="proposalDescription"
              :title="'## ' + proposalTitle + ' \n---'"
              :summary="proposalSummary"
            />
          </v-sheet>
        </v-col>
      </v-row>
    </v-sheet>
  </v-col>
  <v-col cols="12" md="2"></v-col>
</template>

<script>
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import * as cosmjsTypes from "@cosmjs/proto-signing";
import { Comet38Client } from "@cosmjs/tendermint-rpc";

import {
  defaultRegistryTypes,
  calculateFee,
  GasPrice,
  coins,
  assertIsDeliverTxSuccess,
  setupTxExtension,
} from "@cosmjs/stargate";

import cosmosConfig from "@/cosmos.config";

export default {
  components: {
    MarkdownRenderer,
  },
  data() {
    return {
      cosmosConfig: cosmosConfig,
      proposal: {
        title: "",
        description: "",
      },
      proposalDescription:
        "### My proposal  \n\n --- \n Your proposal desciprion",
      proposalTitle: "My proposal title",
      proposalSummary: "My proposal summary",
      proposalMetadata: "",

      moduleType: [{ key: "", value: "" }],

      selectedModule: "",
      selectedModuleParameters: "",
      allModules: [
        { name: "auth", version: "v1beta1" },
        { name: "bank", version: "v1beta1" },
        { name: "staking", version: "v1beta1" },
        { name: "slashing", version: "v1beta1" },
        { name: "mint", version: "v1beta1" },
        { name: "distribution", version: "v1beta1" },
        { name: "gov", version: "v1" },
      ],
    };
  },
  watch: {
    selectedModule(newValue) {
      console.log("Selected module:", newValue);
      if (newValue) {
        console.log(
          "Fetching module parameters..." + this.cosmosConfig[0].apiURL,
        );

        const findModuleVersion = this.allModules.find(
          (element) => element.name === newValue,
        );
        console.log("Module found:", findModuleVersion);

        fetch(
          this.cosmosConfig[0].apiURL +
            `/cosmos/${newValue}/${findModuleVersion.version}/params`,
        ) // /cosmos/auth/v1beta1/params
          .then((response) => response.json())
          .then((data) => {
            console.log("Module parameters:", data);
            this.selectedModuleParameters = data.params;
            // Process the parameters as needed
          })
          .catch((error) => {
            console.error("Error fetching module parameters:", error);
          });
      }
    },
  },
  mounted() {
    console.log("mounted");
    console.log(new cosmjsTypes.Registry());

    console.log(setupTxExtension());
  },
  methods: {
    addField(value, fieldType) {
      fieldType.push({ value: "" });
    },
    removeField(index, fieldType) {
      fieldType.splice(index, 1);
    },
    submitProposal() {
      console.log("Proposal submitted:", this.proposal);
      // Add logic to handle proposal submission
    },
  },
};
</script>
