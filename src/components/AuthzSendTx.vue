<template>
 
    <v-row class="mt-4">
      <v-spacer></v-spacer>
      <!-- {{ selectPolicy }} -->
 

      <v-col cols="12" sm="12" md="12">
        <v-text-field
          v-model="selectPolicy"
          label="From address"
          required
          variant="outlined"
          disabled
        ></v-text-field>
        <v-text-field
          v-model="toAddress"
          label="To address"
          required
          variant="outlined"
        ></v-text-field>
        <v-text-field
          v-model="amount"
          label="Amount"
          required
          variant="outlined"
          suffix="Max"
          append-inner-icon="mdi-plus-box-outline"
          @click:append-inner="getMax()"
        ></v-text-field>
        <v-text-field
          v-model="denom"
          label="Denom"
          required
          variant="outlined"
        ></v-text-field>
        <v-btn elevation="2" @click="checkMsg">Check message</v-btn>
        <span v-if="showValidateData">
          {{ finalMsgProp }}
          <v-icon v-if="validateData" color="teal"> mdi-check </v-icon>

          <v-icon v-else color="red"> mdi-alert-circle </v-icon>
        </span>
      </v-col>
    </v-row>
 
</template>