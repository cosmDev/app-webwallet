 
<template>
  <v-container fluid>
 
        <v-sheet border min-height="400" class="ma-2" rounded="lg">
          <v-toolbar class="rounded-t-lg">
            <v-toolbar-title>My delegations</v-toolbar-title>
 
          </v-toolbar>

  <v-table>
    <thead>
      <tr>
        <th class="text-left">
          Validator name
        </th>
        <th class="text-left">
          Validator address
        </th>
        <th class="text-left">
          Total tokens
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in this.store.myDelegations"
        :key="item.name"
      >
        <td>{{ item.description.moniker }}</td>
        <td>{{ item.operatorAddress }}</td>
        <td>{{ item.tokens }}</td>
        
      </tr>

    </tbody>
    
  </v-table>
        <v-empty-state
        v-if="this.store.myDelegations.length === 0"
 
        text="
          You can delegate tokens to validators to earn rewards.
          You can also undelegate tokens from validators."
        title="You dont have any delegations yet."
        @click:action="onClickAction"
      ></v-empty-state>
  </v-sheet>
  </v-container>
</template>


<script>
import { useAppStore } from "@/stores/data";

export default {
  name: "DelegationsView",
  data() {
    return {
 
    };
  },
  setup() {
    const store = useAppStore();
    return {
      store,
    };
  },
  async mounted () {
    // Fetch data or perform any setup when the component is mounted
    await this.store.getStakingModule()
  },
};

</script>
 
