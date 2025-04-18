<template>
  <v-app :theme="theme" id="inspire">
    <v-app-bar 
      height="72"
      flat
    >
 
      <v-avatar
        class="mx-2"
        color="surface-variant"
        size="32"
        variant="flat"
      ></v-avatar>

      <v-btn
        class="me-2"
        color="grey"
        height="40"
        variant="flat" 
      >Home</v-btn>

      <v-btn
        class="me-2"
        color="grey"
        height="40"
        variant="flat" 
      >Delegations</v-btn>

      <v-btn
        class="me-2"
        color="grey"
        height="40"
        variant="flat" 
      >Authz</v-btn>

      <v-btn
        class="me-2"
        color="grey"
        height="40"
        variant="flat" 
      >Feegrant</v-btn>

      <v-spacer></v-spacer>

      <v-btn
        :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        text="Toggle Theme"
        slim
        @click="onClick"
      ></v-btn>
    </v-app-bar>

    <v-footer
      color="grey"
      height="44"
      app
    ></v-footer>

    <v-navigation-drawer>
      <div class="d-flex px-2 my-2">
        <v-btn
          v-if="appStore.isLogged === false"
          class="flex-grow-1"
          color="grey"
          height="40"
          variant="flat"
          @click="loginWallet"
        >Not connected</v-btn>
        <v-btn
          v-else
          class="flex-grow-1"
          color="grey"
          height="40"
          variant="flat" 
        >{{ appStore.nameWallet.name }}</v-btn>

        <v-avatar
          class="ms-2"
          color="surface-variant"
          variant="flat" 
        >        
          <!-- <v-img 
            src="https://pbs.twimg.com/profile_images/1655533623842570240/nryha-km_400x400.png"
          ></v-img> -->
        </v-avatar>
      </div>

      <div class="d-flex px-2 my-2 align-center text-caption text-truncate" style="max-width: 200px;">
        {{ appStore.addrWallet }} 
 
 

 
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
    </v-navigation-drawer>

    <v-main>
        <v-container fluid>
          <v-row>
            <v-col
              v-for="n in 3"
              :key="n"
              cols="4"
            >
              <v-sheet
                color="grey-lighten-1"
                height="200"
                rounded
              ></v-sheet>
            </v-col>
          </v-row>
        </v-container> 
        {{ appStore }}
    </v-main>
  </v-app>
</template>
<script>
import { ref, defineComponent } from 'vue'
import { useAppStore } from '@/stores/app'
import cosmosConfig from './cosmos.config'

export default defineComponent({
  name: 'App',
  data () {
    return {
      theme: ref('light'),
      publicPath: process.env.BASE_URL
    }
  },
  setup () {
    const appStore = useAppStore() 
    return {
      appStore 
    }
  },
  methods: {
    onClick () {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },
    async loginWallet () {
      const appStore = useAppStore()
      await appStore.keplrConnect()
      console.log(appStore.addrWallet)
    },
  }
})
</script>
 