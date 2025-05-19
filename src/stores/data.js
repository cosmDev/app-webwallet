// Utilities
import { defineStore } from "pinia";
import axios from "axios";

import {
  createProtobufRpcClient,
  QueryClient,
  defaultRegistryTypes,
} from "@cosmjs/stargate";
import { toUtf8, fromUtf8, toHex } from "@cosmjs/encoding";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import Long from "long";
import bech32 from "bech32";
import { buildQuery } from "@cosmjs/tendermint-rpc/build/tendermint37/requests.js";
import { decodeTxRaw } from "@cosmjs/proto-signing";
import cosmosConfig from "../cosmos.config";
import { setMsg } from "../libs/msgType";
import { setAuthzMsg } from "../libs/msgAuthzType";

import * as bank from "cosmjs-types/cosmos/bank/v1beta1/query";
import * as auth from "cosmjs-types/cosmos/auth/v1beta1/query";
import * as staking from "cosmjs-types/cosmos/staking/v1beta1/query";
import * as distrib from "cosmjs-types/cosmos/distribution/v1beta1/query";
import * as gov from "cosmjs-types/cosmos/gov/v1beta1/query";
import * as authz from "cosmjs-types/cosmos/authz/v1beta1/query";
import * as feegrant from "cosmjs-types/cosmos/feegrant/v1beta1/query";
import * as feegrantType from "cosmjs-types/cosmos/feegrant/v1beta1/feegrant";
import {
  GenericAuthorization,
  GrantAuthorization,
} from "cosmjs-types/cosmos/authz/v1beta1/authz";

export const useAppStore = defineStore("app", {
  state: () => ({
    chainOffline: false,
    isLogged: false,
    rpcClient: null,
    rpcBase: null,
    sdkVersion: "",
    ibcVersion: "",
    addrWallet: "",
    nameWallet: "",
    accountInfo: null,
    allHomeProposals: [],
    allWalletBalances: [],
    spendableBalances: 0,
    totalDelegations: 0,
    totalUnbound: 0,
    totalRewards: 0,
    totalMyValidators: 0,
    allValidators: [],
    countAllValidators: 0,
    totalDelegationsRewards: [],
    setChainSelected: 0,
    lastTransactions: [],
    allProposals: [],
    allAuthz: [],
    myFeeAllowances: [],
    formFeeGranter: "",
    myFeeGrants: [],
    setFeePayer: "",
    isValidator: false,
    myValidatorData: null,
    myValidatorReward: null,
    allPrice: [],
    chainSelectedPrice: "",
    fiatWalletValue: 0,
    totalTokens: 0,
    totalSupply: 0,
    totalSupplyPrice: 0,
    communityPool: 0,
    aprNow: 0,
    finalStats: {},
    myDelegatorWithdrawAddress: "",
    finalAllaWalletsData: [],
    chainInflation: "",
    poolStaking: "",
    marketTokenInfo: "",

    btcAddress: "",
    btcAmount: 0,

    finalGroupPropMsg: [],

    myDelegations: [],

    // authz
    authzByGrantee: [],
    authzByGranter: [],
  }),
  actions: {
    resetData() {
      //this.isLogged = false;
      //this.rpcClient = null;
      //this.rpcBase = null;
      //this.addrWallet = '';
      this.nameWallet = "";
      this.ibcVersion = "";
      this.sdkVersion = "";
      this.spendableBalances = 0;
      this.totalTokens = 0;
      this.totalDelegations = 0;
      this.totalUnbound = 0;
      this.totalRewards = 0;
      this.totalMyValidators = 0;
      this.allValidators = [];
      this.lastTransactions = [];
      this.allProposals = [];
      this.allHomeProposals = [];
      this.allAuthz = [];
      this.myFeeAllowances = [];
      this.isValidator = false;
      this.myValidatorData = null;
      this.myValidatorReward = null;
      this.fiatWalletValue = 0;
    },
    async initRpc() {
      if (this.rpcClient) {
        this.rpcBase.disconnect();
      }
      try {
        const client = await Tendermint37Client.connect(
          cosmosConfig[this.setChainSelected].rpcURL,
        );
        const queryClient = new QueryClient(client);
        const rpcClient = createProtobufRpcClient(queryClient);
        this.rpcClient = rpcClient;
        this.rpcBase = client;

        this.chainOffline = false;
      } catch (e) {
        console.log("error", e);
        this.chainOffline = true;
      }
    },
    async getSdkVersion() {
      const getSdk = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/base/tendermint/v1beta1/node_info",
      );
      for (let i of getSdk.data.application_version.build_deps) {
        let position = i.path.search("ibc-go");
        if (position !== -1) {
          this.ibcVersion = i.version;
        }
      }
      this.sdkVersion = getSdk.data.application_version.cosmos_sdk_version;
    },
    async getAllPrice() {
      let allChainPrice = ["chihuahua-token", "bitcoin", "ethereum"];

      const allPrice = await axios(
        "https://api.coingecko.com/api/v3/simple/price?ids=" +
          allChainPrice +
          "&vs_currencies=usd",
      );
      this.allPrice = allPrice.data;
    },
    async getApr() {
      const totalSupply = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/bank/v1beta1/supply?pagination.reverse=true",
      );
      const inflation = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/mint/v1beta1/inflation",
      );

      let foundSupply = totalSupply.data.supply.find(
        (element) =>
          element.denom ===
          cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
      );

      let finalApr = (
        ((foundSupply.amount * inflation.data.inflation) /
          this.finalStats.bondedTokens) *
        100
      ).toFixed(1);
      this.aprNow = finalApr;
      this.chainInflation = (inflation.data.inflation * 100).toFixed(2);
      // commit("setAprNow", finalApr);
    },
    async setChainPrice() {
      const foundPrice =
        this.allPrice[cosmosConfig[this.setChainSelected].coingeckoId];
      this.chainSelectedPrice = foundPrice.usd;

      const getTokenInfo = await axios(
        "https://api.coingecko.com/api/v3/coins/" +
          cosmosConfig[this.setChainSelected].coingeckoId,
      );
      this.marketTokenInfo = getTokenInfo.data;
    },
    async getAccountInfo() {
      try {
        const getAccountInfo = await axios(
          cosmosConfig[this.setChainSelected].apiURL +
            "/cosmos/auth/v1beta1/accounts/" +
            this.addrWallet,
        );

        this.accountInfo = getAccountInfo.data.account;
      } catch (e) {
        console.log("error", e);
        this.accountInfo = null;
      }
    },
    async getWalletAmount() {
      let totalToken =
        Number(this.spendableBalances) +
        Number(this.totalDelegations) +
        Number(this.totalUnbound) +
        Number(this.totalRewards);

      this.totalTokens = totalToken.toFixed(6);
      this.fiatWalletValue = totalToken * this.chainSelectedPrice;
    },
    async getBankModule() {
      const queryBank = new bank.QueryClientImpl(this.rpcClient);
      let spendableBalances = await queryBank.SpendableBalances({
        address: this.addrWallet,
      });
      let allBalances = await queryBank.AllBalances({
        address: this.addrWallet,
      });

      const found = spendableBalances.balances.find(
        (element) =>
          element.denom ===
          cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
      );
      // TODO: fix this
      let returnValue = "";
      if (found?.amount > 0) {
        returnValue = found?.amount / 1000000;
      } else {
        returnValue = 0;
      }

      let totalSupply = await queryBank.SupplyOf({
        denom: cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
      });
      this.spendableBalances = returnValue;
      this.totalSupply = totalSupply.amount.amount;
      this.totalSupplyPrice =
        (totalSupply.amount.amount / 1000000) * this.chainSelectedPrice;
      this.allWalletBalances = allBalances.balances;
    },
    async getStakingModule() {
      const queryStaking = new staking.QueryClientImpl(this.rpcClient);
      let getPoolStaking = await queryStaking.Pool({});
      let delegatorValidators = await queryStaking.DelegatorDelegations({
        delegatorAddr: this.addrWallet,
        pagination: {
          countTotal: false,
          key: "",
          offset: Long.fromNumber(0, true),
          limit: Long.fromNumber(200, true),
          reverse: false,
        },
      });

      let myDelegations = await queryStaking.DelegatorValidators({
        delegatorAddr: this.addrWallet,
      });

      let total = 0;
      let allUnbound = await queryStaking.DelegatorUnbondingDelegations({
        delegatorAddr: this.addrWallet,
      });
      let totalUnbound = 0;

      for (let i of delegatorValidators.delegationResponses) {
        total += Number(i.balance.amount);
      }
      if (allUnbound.unbondingResponses.length > 0) {
        for (let i of allUnbound.unbondingResponses) {
          for (let j of i.entries) {
            totalUnbound += Number(j.balance);
          }
        }
      } else {
        totalUnbound = 0.0;
      }

      this.totalDelegations = (total / 1000000).toFixed(2);
      this.totalUnbound = (totalUnbound / 1000000).toFixed(2);
      this.poolStaking = getPoolStaking.pool;
      this.myDelegations = myDelegations.validators;
    },
    async getDistribModule() {
      const queryDistrib = new distrib.QueryClientImpl(this.rpcClient);
      const queryDistribResult = await queryDistrib.DelegationTotalRewards({
        delegatorAddress: this.addrWallet,
      });
      const found = queryDistribResult.total.find(
        (element) =>
          element.denom ===
          cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
      );
      let returnValue = "";
      if (queryDistribResult.total.length > 0) {
        returnValue = Number(found.amount / 1000000000000000000000000).toFixed(
          6,
        );
      } else {
        returnValue = 0;
      }

      let oldValue = this.totalRewards;
      this.totalMyValidators = queryDistribResult.rewards.length;
      this.totalDelegationsRewards = queryDistribResult.rewards;
      this.totalRewards = returnValue;
      this.totalRewardsTime = {
        old: oldValue,
        new: returnValue,
      };

      const queryWithdrawAddressResult =
        await queryDistrib.DelegatorWithdrawAddress({
          delegatorAddress: this.addrWallet,
        });
      this.myDelegatorWithdrawAddress =
        queryWithdrawAddressResult.withdrawAddress;
    },
    async getAuthzModule() {
      const queryAuthz = new authz.QueryClientImpl(this.rpcClient);
      const queryAuthzResult = await queryAuthz.GranterGrants({
        granter: this.addrWallet,
      });
      const queryAuthzResultGrantee = await queryAuthz.GranteeGrants({
        grantee: this.addrWallet,
      });

      console.log("queryAuthzResult", queryAuthzResult);

      for (let i = 0; i < queryAuthzResult.grants.length; i++) {
        queryAuthzResult.grants[i].finaleAuthzType =
          GenericAuthorization.decode(
            queryAuthzResult.grants[i].authorization.value,
          );
        let finalsTxs = setAuthzMsg(queryAuthzResult.grants[i].finaleAuthzType);
        queryAuthzResult.grants[i].finalData = finalsTxs;

        console.log('test', queryAuthzResult.grants[i].grantee);

        this.getAuthzByGranter(queryAuthzResult.grants[i].grantee, "/cosmos.authz.v1beta1.MsgExec");

      }

      for (let i = 0; i < queryAuthzResultGrantee.grants.length; i++) {
        queryAuthzResultGrantee.grants[i].finaleAuthzType =
          GenericAuthorization.decode(
            queryAuthzResultGrantee.grants[i].authorization.value,
          );
        let finalsTxs = setAuthzMsg(
          queryAuthzResultGrantee.grants[i].finaleAuthzType,
        );
        queryAuthzResultGrantee.grants[i].finalData = finalsTxs;
      }

      let finalAllAuthz = {
        granter: queryAuthzResult.grants,
        grantee: queryAuthzResultGrantee.grants,
      };

      this.allAuthz = finalAllAuthz;
    },
    async getFeeGrantModule() {
      const queryFeegrant = new feegrant.QueryClientImpl(this.rpcClient);
      const queryFeegrantResult = await queryFeegrant.Allowances({
        grantee: this.addrWallet,
      });
      const queryAllowancesByGranterResult =
        await queryFeegrant.AllowancesByGranter({ granter: this.addrWallet });
      this.myFeeAllowances = queryFeegrantResult.allowances;
      this.myFeeGrants = queryAllowancesByGranterResult.allowances;

      for (let i = 0; i < this.myFeeGrants.length; i++) {
        if (
          this.myFeeGrants[i].allowance.typeUrl ===
          "/cosmos.feegrant.v1beta1.BasicAllowance"
        ) {
          this.myFeeGrants[i].allowance.value =
            feegrantType.BasicAllowance.decode(
              this.myFeeGrants[i].allowance.value,
            );
        }
        if (
          this.myFeeGrants[i].allowance.typeUrl ===
          "/cosmos.feegrant.v1beta1.PeriodicAllowance"
        ) {
          this.myFeeGrants[i].allowance.value =
            feegrantType.PeriodicAllowance.decode(
              this.myFeeGrants[i].allowance.value,
            );
        }
      }

      let finalGranter = [];
      for (let i = 0; i < this.myFeeAllowances.length; i++) {
        finalGranter[i] = this.myFeeAllowances[i].granter;

        if (
          this.myFeeAllowances[i].allowance.typeUrl ===
          "/cosmos.feegrant.v1beta1.BasicAllowance"
        ) {
          this.myFeeAllowances[i].allowance.value =
            feegrantType.BasicAllowance.decode(
              this.myFeeAllowances[i].allowance.value,
            );
        }
        if (
          this.myFeeAllowances[i].allowance.typeUrl ===
          "/cosmos.feegrant.v1beta1.PeriodicAllowance"
        ) {
          this.myFeeAllowances[i].allowance.value =
            feegrantType.PeriodicAllowance.decode(
              this.myFeeAllowances[i].allowance.value,
            );
        }
      }
      this.formFeeGranter = finalGranter;
    },
    async getAllProps() {
      // List of proposal from the blockchain
      let finalVersion = "v1";
      if (this.sdkVersion.substring(0, 5) === "v0.47") {
        finalVersion = "v1";
      }
      const allProposals = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/gov/" +
          finalVersion +
          "/proposals?pagination.limit=12", // &pagination.reverse=true
      );
      const communityPool = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/distribution/v1beta1/community_pool",
      );

      let finalPool = communityPool.data.pool.find(
        (element) =>
          element.denom ===
          cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
      );
      let allProps = allProposals.data.proposals.reverse();

      let finalProps = [];
      allProps.forEach((element) => {
        if (finalVersion === "v1") {
          finalProps.push({
            proposal_id: element.id,
            title: element.title,
            status: element.status,
            submit_time: element.submit_time,
            voting_start_time: element.voting_start_time,
            voting_end_time: element.voting_end_time,
            deposit_end_time: element.deposit_end_time,
            failed_reason: element.failed_reason,
            final_tally_result: {
              yes: element.final_tally_result.yes_count,
              no: element.final_tally_result.no_count,
              no_with_veto: element.final_tally_result.no_with_veto_count,
              abstain: element.final_tally_result.abstain_count,
            },
          });
        } else {
          finalProps.push({
            proposal_id: element.proposal_id,
            title: element.content.title,
            status: element.status,
            final_tally_result: {
              yes: element.final_tally_result.yes,
              no: element.final_tally_result.no,
              no_with_veto: element.final_tally_result.no_with_veto,
              abstain: element.final_tally_result.abstain,
            },
          });
        }
      });

      this.allProposals = finalProps;
      this.communityPool = finalPool?.amount / 1000000;
    },
    async getHomeProps() {
      let finalVersion = "v1beta1";
      if (this.sdkVersion.substring(0, 5) === "v0.47") {
        finalVersion = "v1";
      }
      // List of proposal from the blockchain
      const allProposals = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/gov/" +
          finalVersion +
          "/proposals?pagination.limit=12&pagination.reverse=true",
      );
      let allProps = allProposals.data.proposals.reverse();
      let finalProps = [];
      allProps.forEach((element) => {
        if (finalVersion === "v1") {
          finalProps.push({
            proposal_id: element.id,
            title: element.title,
            status: element.status,
            final_tally_result: {
              yes: element.final_tally_result.yes_count,
              no: element.final_tally_result.no_count,
              no_with_veto: element.final_tally_result.no_with_veto_count,
              abstain: element.final_tally_result.abstain_count,
            },
          });
        } else {
          finalProps.push({
            proposal_id: element.proposal_id,
            title: element.content.title,
            status: element.status,
            final_tally_result: {
              yes: element.final_tally_result.yes,
              no: element.final_tally_result.no,
              no_with_veto: element.final_tally_result.no_with_veto,
              abstain: element.final_tally_result.abstain,
            },
          });
        }
      });

      this.allHomeProposals = finalProps;
    },
    async getProposalId(id) {
      let finalVersion = "v1beta1";
      if (this.sdkVersion.substring(0, 5) === "v0.47") {
        finalVersion = "v1";
      }
      const getPropoId = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/gov/" +
          finalVersion +
          "/proposals/" +
          id,
      );

      let finalDataPropId = getPropoId.data.proposal;

      let finalProp = [];
      if (finalVersion === "v1") {
        let typeMsg = "";
        if (
          finalDataPropId.messages[0]["@type"] !==
          "/cosmos.gov.v1.MsgExecLegacyContent"
        ) {
          typeMsg = finalDataPropId.messages[0]["@type"];
        } else {
          typeMsg = finalDataPropId.messages[0].content["@type"];
        }

        finalProp = {
          proposal_id: finalDataPropId.id,
          type: typeMsg,
          title: finalDataPropId.title,
          description: finalDataPropId.summary,
          status: finalDataPropId.status,
          deposit_end_time: finalDataPropId.deposit_end_time,
          submit_time: finalDataPropId.submit_time,
          voting_end_time: finalDataPropId.voting_end_time,
          voting_start_time: finalDataPropId.voting_start_time,
          final_tally_result: {
            yes: finalDataPropId.final_tally_result.yes_count,
            no: finalDataPropId.final_tally_result.no_count,
            no_with_veto: finalDataPropId.final_tally_result.no_with_veto_count,
            abstain: finalDataPropId.final_tally_result.abstain_count,
          },
        };
      } else {
        finalProp = {
          proposal_id: finalDataPropId.proposal_id,
          type: finalDataPropId.content["@type"],
          title: finalDataPropId.content.title,
          description: finalDataPropId.content.description,
          status: finalDataPropId.status,
          deposit_end_time: finalDataPropId.deposit_end_time,
          submit_time: finalDataPropId.submit_time,
          voting_end_time: finalDataPropId.voting_end_time,
          voting_start_time: finalDataPropId.voting_start_time,
          final_tally_result: {
            yes: finalDataPropId.final_tally_result.yes,
            no: finalDataPropId.final_tally_result.no,
            no_with_veto: finalDataPropId.final_tally_result.no_with_veto,
            abstain: finalDataPropId.final_tally_result.abstain,
          },
        };
      }
      //return getPropoId.data.proposal
      return finalProp;
    },
    async getProposalIdVote(id) {
      const getPropoIdVote = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/gov/v1beta1/proposals/" +
          id +
          "/tally",
      );
      return getPropoIdVote.data.tally;
    },
    async propIsVoted(id) {
      const getPropoIdVote = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/gov/v1beta1/proposals/" +
          id +
          "/votes/" +
          this.addrWallet,
      );
      return getPropoIdVote.data;
    },
    async getTransactions() {
      const resultSender = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/tx/v1beta1/txs?query=message.sender=%27" +
          this.addrWallet +
          "%27&limit=10&order_by=2",
      );
      const resultRecipient = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/tx/v1beta1/txs?query=transfer.recipient=%27" +
          this.addrWallet +
          "%27&limit=10&order_by=2",
      );
      const finalTxs = await resultSender.data.tx_responses.concat(
        resultRecipient.data.tx_responses,
      );
      let push_array = [];
      for (let i of finalTxs) {
        let finalsTxs = setMsg(
          i.tx.body.messages[0],
          this.addrWallet,
          i.timestamp,
          i.txhash,
          { code: i.code, log: i.raw_log },
        );
        push_array.push(finalsTxs);
      }

      this.lastTransactions = push_array;
    },
    async getChainStats() {
      const inflation = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/mint/v1beta1/inflation",
      );
      const totalSupply = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/bank/v1beta1/supply/ubcna",
      );
      const communityPool = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/distribution/v1beta1/community_pool",
      );

      const querystaking = new staking.QueryClientImpl(this.rpcClient);
      let allValidators = await querystaking.Validators({
        status: "BOND_STATUS_BONDED",
      });
      let tokenBounded = 0;
      for (let i = 0; i < allValidators.validators.length; i++) {
        const tokenByVal = allValidators.validators[i].tokens;
        tokenBounded += Number(tokenByVal);
      }

      let finalInflation = inflation.data.inflation * 100;
      let finalTotalSupply = totalSupply.data.amount.amount / 1000000;
      let finalCommunityPool = communityPool.data.pool[0].amount / 1000000;
      let finalBondedTokens = tokenBounded / 1000000;

      let finalStats = {
        inflation: finalInflation,
        totalSupply: finalTotalSupply,
        bondedTokens: finalBondedTokens,
        notBondedTokens: finalTotalSupply - finalBondedTokens,
        communityPool: finalCommunityPool,
      };
      this.finalStats = finalStats;
      // commit('updateChainsStats', finalStats)
    },

    async getAuthzByGranter(grantee, msgType) {
      await this.initRpc();
      let finalDataAuthzTxs = [];

      const queryCustom = buildQuery({
        tags: [
          { key: "message.sender", value: grantee },
          { key: "message.action", value: msgType },
        ],
      });
      let resultQueryCustom = await this.rpcBase.txSearch({
        query: queryCustom,
        page: 1,
        per_page: 5,
        order_by: "desc",
      });

      console.log("resultQueryCustom", resultQueryCustom);

      for (let i of resultQueryCustom.txs) {
        const decoded = decodeTxRaw(i.tx);

        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === decoded.body.messages[0].typeUrl,
        );
        let finalType = foundMsgType[1].decode(decoded.body.messages[0].value);

        const foundAuthzMsgType = defaultRegistryTypes.find(
          (element) => element[0] === finalType.msgs[0].typeUrl,
        );

        let finalAuthzMsgType = foundAuthzMsgType[1].decode(
          finalType.msgs[0].value,
        );

        let formatMsg = {
          msg: finalType.msgs[0].typeUrl,
        };

        let finalData = setAuthzMsg(formatMsg);
        finalDataAuthzTxs.push({
          txHash: toHex(i.hash).toUpperCase(),
          blockTime: i.timestamp,
          status: i.code,
          log: i.raw_log,
          decodedTx: finalData,
          decoded: decoded,
          finalType: finalType,
          finalAuthzMsgType: finalAuthzMsgType,
        });
      }

      console.log("finalDataAuthzTxs", finalDataAuthzTxs);
      this.authzByGranter = finalDataAuthzTxs;
    },

    
    async getAuthzByGrantee(msgType) {
      await this.initRpc();
      let finalDataAuthzTxs = [];

      const queryCustom = buildQuery({
        tags: [
          { key: "message.sender", value: this.addrWallet },
          { key: "message.action", value: msgType }, // "exec" is the action for MsgExec (authz)
        ],
      });
      let resultQueryCustom = await this.rpcBase.txSearch({
        query: queryCustom,
        page: 1,
        per_page: 5,
        order_by: "desc",
      }); 
      for (let i of resultQueryCustom.txs) {
        const decoded = decodeTxRaw(i.tx); 

        const foundMsgType = defaultRegistryTypes.find(
          (element) => element[0] === decoded.body.messages[0].typeUrl,
        );
        let finalType = foundMsgType[1].decode(decoded.body.messages[0].value);

        const foundAuthzMsgType = defaultRegistryTypes.find(
          (element) => element[0] === finalType.msgs[0].typeUrl,
        );

        let finalAuthzMsgType = foundAuthzMsgType[1].decode(
          finalType.msgs[0].value,
        );

        let formatMsg = {
          msg: finalType.msgs[0].typeUrl,
        };

        let finalData = setAuthzMsg(formatMsg);
        finalDataAuthzTxs.push({
          txHash: toHex(i.hash).toUpperCase(),
          blockTime: i.timestamp,
          status: i.code,
          log: i.raw_log,
          decodedTx: finalData,
          decoded: decoded,
          finalType: finalType,
          finalAuthzMsgType: finalAuthzMsgType,
        }); 
      }
      this.authzByGrantee = finalDataAuthzTxs;
    },
    /*async getTransactions() {
      const queryDelegate = buildQuery({
        tags: [
          { key: "transfer.recipient", value: this.addrWallet },
          { key: "message.sender", value: this.addrWallet },
        ],
      });
      const resultDelegate = await this.rpcBase.txSearch({
        query: queryDelegate,
        page: 1,
        per_page: 5,
        order_by: "desc"
      });

      this.lastTransactions = resultDelegate.txs
      for (let i of this.lastTransactions) {
        const decoded = decodeTxRaw(i.tx);
        i.decodedTx = decoded;
        i.decodedEvents = JSON.parse(i.result.log);


        let findMsg = i.decodedEvents[0].events.find(element => element.type === 'message')
        let finalType = findMsg.attributes.find(element => element.key === 'action')

        i.type = finalType.value;

        let finalSyntax = setMsg(
          i.type,
          i.decodedEvents
        );
        // console.log(finalSyntax)
        i.finalSyntax = finalSyntax;
      }
    }, */
    // LCD API part
    async getAllValidators() {
      let test = await fetch(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/staking/v1beta1/validators?pagination.limit=500&status=BOND_STATUS_BONDED",
      );

      let getValidators = await test.json();

      this.allValidators = getValidators.validators;
      this.countAllValidators = getValidators.validators.length;
    },
    async checkIsValidator() {
      const decode = bech32.decode(this.addrWallet);
      const returnAddress = bech32.encode(
        decode.prefix + "valoper",
        decode.words,
      );

      this.allValidators.find(
        (element) => element.operator_address === returnAddress,
      )
        ? (this.isValidator = true)
        : (this.isValidator = false);
      if (this.isValidator) {
        const myValidatorData = await axios(
          cosmosConfig[this.setChainSelected].apiURL +
            "/cosmos/staking/v1beta1/validators/" +
            returnAddress,
        );
        const myValidatorRewards = await axios(
          cosmosConfig[this.setChainSelected].apiURL +
            "/cosmos/distribution/v1beta1/validators/" +
            returnAddress +
            "/commission",
        );
        this.myValidatorData = myValidatorData.data;
        this.myValidatorReward = (
          myValidatorRewards.data?.commission.commission[0].amount / 1000000
        ).toFixed(2);
      }
    },

    async keplrConnect() {
      await window.keplr?.experimentalSuggestChain({
        chainId: cosmosConfig[this.setChainSelected].chainId,
        chainName: cosmosConfig[this.setChainSelected].name,
        rpc: cosmosConfig[this.setChainSelected].rpcURL,
        rest: cosmosConfig[this.setChainSelected].apiURL,
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr:
            cosmosConfig[this.setChainSelected].coinLookup.addressPrefix,
          bech32PrefixAccPub:
            cosmosConfig[this.setChainSelected].coinLookup.addressPrefix +
            "pub",
          bech32PrefixValAddr:
            cosmosConfig[this.setChainSelected].coinLookup.addressPrefix +
            "valoper",
          bech32PrefixValPub:
            cosmosConfig[this.setChainSelected].coinLookup.addressPrefix +
            "valoperpub",
          bech32PrefixConsAddr:
            cosmosConfig[this.setChainSelected].coinLookup.addressPrefix +
            "valcons",
          bech32PrefixConsPub:
            cosmosConfig[this.setChainSelected].coinLookup.addressPrefix +
            "valconspub",
        },
        currencies: [
          {
            coinDenom: cosmosConfig[this.setChainSelected].coinLookup.viewDenom,
            coinMinimalDenom:
              cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
            coinDecimals: 6,
            coinGeckoId: cosmosConfig[this.setChainSelected].coingeckoId,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: cosmosConfig[this.setChainSelected].coinLookup.viewDenom,
            coinMinimalDenom:
              cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
            coinDecimals: 6,
            coinGeckoId: cosmosConfig[this.setChainSelected].coingeckoId,
            gasPriceStep: {
              low: 0,
              average: 0,
              high: 0,
            },
          },
        ],
        stakeCurrency: {
          coinDenom: cosmosConfig[this.setChainSelected].coinLookup.viewDenom,
          coinMinimalDenom:
            cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
          coinDecimals: 6,
          coinGeckoId: cosmosConfig[this.setChainSelected].coingeckoId,
        },
      });
      let chainId = cosmosConfig[this.setChainSelected].chainId;

      await window.keplr?.enable(chainId);
      const offlineSigner = await window.getOfflineSignerAuto(chainId);
      const accounts = await offlineSigner.getAccounts();
      const getKey = await window.keplr?.getKey(chainId);
      this.addrWallet = accounts[0].address;
      this.nameWallet = getKey;
      this.isLogged = true;

      let btcAddress = await window.bitcoin_keplr?.connectWallet();
      let btcAmount = await window.bitcoin_keplr?.getBalance();

      /*       let getNetwork = await window.bitcoin_keplr.getNetwork();
      let getAccounts = await window.bitcoin_keplr.getAccounts(); */

      this.btcAddress = btcAddress;
      this.btcAmount = btcAmount;
    },
  },
});
