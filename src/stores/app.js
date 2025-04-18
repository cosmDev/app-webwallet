 
// Utilities
import { defineStore } from 'pinia'
import axios from "axios";
import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import Long from "long";
import bech32 from "bech32";
import { buildQuery } from "@cosmjs/tendermint-rpc/build/tendermint37/requests.js";
import { decodeTxRaw } from "@cosmjs/proto-signing";
import cosmosConfig from '../cosmos.config'
import { setMsg } from "../libs/msgType";
import { setAuthzMsg } from "../libs/msgAuthzType";


import * as bank from "cosmjs-types/cosmos/bank/v1beta1/query";
import * as staking from "cosmjs-types/cosmos/staking/v1beta1/query";
import * as distrib from "cosmjs-types/cosmos/distribution/v1beta1/query";
import * as gov from "cosmjs-types/cosmos/gov/v1beta1/query";
import * as authz from "cosmjs-types/cosmos/authz/v1beta1/query";
import * as feegrant from "cosmjs-types/cosmos/feegrant/v1beta1/query";
import { GenericAuthorization, GrantAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import * as group from "cosmjs-types/cosmos/group/v1/query";


export const useAppStore = defineStore('app', {
  state: () => ({
    isLogged: false,
    rpcClient: null,
    rpcBase: null,
    sdkVersion: '',
    ibcVersion: '',
    addrWallet: '',
    nameWallet: '',
    allHomeProposals: [],
    spendableBalances: 0,
    totalDelegations: 0,
    totalUnbound: 0,
    totalRewards: 0,
    totalRewardsTime: {
      old: 0,
      new: 0
    },
    totalMyValidators: 0,
    allValidators: [],
    countAllValidators: 0,
    totalDelegationsRewards: [],
    setChainSelected: 0,
    lastTransactions: [],
    allProposals: [],
    allAuthz: [],
    myFeeAllowances: [],
    formFeeGranter: '',
    myFeeGrants: [],
    myFeeGrants: [],
    setFeePayer: '',
    isValidator: false,
    myValidatorData: null,
    myValidatorReward: null,
    allPrice: [],
    chainSelectedPrice: '',
    fiatWalletValue: 0,
    totalTokens: 0,
    totalSupply: 0,
    totalSupplyPrice: 0,
    communityPool: 0,
    aprNow: 0,
    finalStats: {},
    myDelegatorWithdrawAddress: '',
    finalAllaWalletsData: [],
    chainInflation: '',
    poolStaking: '',
    marketTokenInfo: '',
    allGroup: [],
    finalAmountGroup: 0,
    finalRewardGroup: 0,
    finalGroupMembers: [],
    finalGroupPolicies: [],
    finalGroupProposals: [],
    finalGroupPropMsg: [],
    finalGroupPropMsgType: [],
    finalGroupProposalId : '',
    lastGroupTransactions: [],
  }),
  actions: {
    resetData() {
      //this.isLogged = false;
      //this.rpcClient = null;
      //this.rpcBase = null;
      //this.addrWallet = '';
      this.nameWallet = '';
      this.ibcVersion = '';
      this.sdkVersion = '';
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
      this.allGroup = [];
      this.finalAmountGroup = 0;
    },
    async initRpc() {
      if(this.rpcClient) {
        this.rpcBase.disconnect();
      }
      const client = await Tendermint37Client.connect(cosmosConfig[this.setChainSelected].rpcURL)
      const queryClient = new QueryClient(client);
      const rpcClient = createProtobufRpcClient(queryClient);
      this.rpcClient = rpcClient
      this.rpcBase = client
    },
    async getSdkVersion() {
      const getSdk = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/base/tendermint/v1beta1/node_info"
      );
      for (let i of getSdk.data.application_version.build_deps) {
        let position = i.path.search("ibc-go");
        if (position !== -1) {
          this.ibcVersion = i.version
        }

      }
      this.sdkVersion = getSdk.data.application_version.cosmos_sdk_version
    },
    async getAllPrice() {
      let allChainPrice = []
      for (let i of cosmosConfig) {
        if (i.coingeckoId !== '')
          allChainPrice += i.coingeckoId + ','
      }

      const allPrice = await axios(
        "https://api.coingecko.com/api/v3/simple/price?ids=" + allChainPrice + "&vs_currencies=usd"
      );
      this.allPrice = allPrice.data
    },
    async getApr() {
      const totalSupply = await axios(
        cosmosConfig[this.setChainSelected].apiURL + "/cosmos/bank/v1beta1/supply?pagination.reverse=true"
      );
      const inflation = await axios(
        cosmosConfig[this.setChainSelected].apiURL + "/cosmos/mint/v1beta1/inflation"
      );

      let foundSupply = totalSupply.data.supply.find(
        (element) =>
          element.denom === cosmosConfig[this.setChainSelected].coinLookup.chainDenom
      );

      let finalApr = (
        ((foundSupply.amount * inflation.data.inflation) / this.finalStats.bondedTokens) *
        100
      ).toFixed(1);
      this.aprNow = finalApr
      this.chainInflation = (inflation.data.inflation * 100).toFixed(2)
      // commit("setAprNow", finalApr);
    },
    async setChainPrice() {
      const foundPrice = this.allPrice[cosmosConfig[this.setChainSelected].coingeckoId]
      this.chainSelectedPrice = foundPrice.usd

      const getTokenInfo = await axios(
        "https://api.coingecko.com/api/v3/coins/" + cosmosConfig[this.setChainSelected].coingeckoId
      );
      this.marketTokenInfo = getTokenInfo.data

    },
    async getWalletAmount() {
      let totalToken =
        Number(this.spendableBalances) +
        Number(this.totalDelegations) +
        Number(this.totalUnbound) +
        Number(this.totalRewards)

      this.totalTokens = (totalToken).toFixed(6)
      this.fiatWalletValue = totalToken * this.chainSelectedPrice
    },
    async getBankModule() {
      const queryBank = new bank.QueryClientImpl(this.rpcClient);
      let spendableBalances = await queryBank.SpendableBalances({ address: this.addrWallet });
      let allBalances = await queryBank.AllBalances({ address: this.addrWallet });

      const found = spendableBalances.balances.find(element => element.denom === cosmosConfig[this.setChainSelected].coinLookup.chainDenom);
      // TODO: fix this
      let returnValue = ''
      if ( found?.amount > 0){
        returnValue = found?.amount / 1000000
      } else {
        returnValue = 0
      }

      let totalSupply = await queryBank.SupplyOf({ denom: cosmosConfig[this.setChainSelected].coinLookup.chainDenom })
      this.spendableBalances = returnValue
      this.totalSupply = totalSupply.amount.amount
      this.totalSupplyPrice = ((totalSupply.amount.amount / 1000000) * this.chainSelectedPrice)
    },
    async getStakingModule() {
      const queryStaking = new staking.QueryClientImpl(this.rpcClient);
      let getPoolStaking = await queryStaking.Pool({ });
      let delegatorValidators = await queryStaking.DelegatorDelegations({ delegatorAddr: this.addrWallet, pagination: {
        countTotal: false,
        key: '',
        offset: Long.fromNumber(0, true),
        limit: Long.fromNumber(200, true),
        reverse: false,
      }});

      let total = 0;
      let allUnbound = await queryStaking.DelegatorUnbondingDelegations({ delegatorAddr: this.addrWallet });
      let totalUnbound = 0;

      for (let i of delegatorValidators.delegationResponses) {
        total += Number(i.balance.amount);
      }
      if (allUnbound.unbondingResponses.length > 0) {
        for (let i of allUnbound.unbondingResponses) {
          for (let j of i.entries) {
            totalUnbound += Number(j.balance)
          }
        }
      } else {
        totalUnbound = 0.00
      }

      this.totalDelegations = (total / 1000000).toFixed(2)
      this.totalUnbound = (totalUnbound / 1000000).toFixed(2)
      this.poolStaking = getPoolStaking.pool
    },
    async getDistribModule() {
      const queryDistrib = new distrib.QueryClientImpl(this.rpcClient);
      const queryDistribResult = await queryDistrib.DelegationTotalRewards({ delegatorAddress: this.addrWallet });
      const found = queryDistribResult.total.find(element => element.denom === cosmosConfig[this.setChainSelected].coinLookup.chainDenom);
      let returnValue = ''
      if ( queryDistribResult.total.length > 0){
        returnValue = Number(found.amount / 1000000000000000000000000).toFixed(6)
      } else {
        returnValue = 0
      }

      let oldValue = this.totalRewards
      this.totalMyValidators = queryDistribResult.rewards.length
      this.totalDelegationsRewards = queryDistribResult.rewards
      this.totalRewards = returnValue
      this.totalRewardsTime = {
        old: oldValue,
        new: returnValue
      }

      const queryWithdrawAddressResult = await queryDistrib.DelegatorWithdrawAddress({ delegatorAddress: this.addrWallet });
      // console.log('DelegatorWithdrawAddress', queryWithdrawAddressResult)
      this.myDelegatorWithdrawAddress = queryWithdrawAddressResult.withdrawAddress
    },
    async getAuthzModule() {
      const queryAuthz = new authz.QueryClientImpl(this.rpcClient);
      const queryAuthzResult = await queryAuthz.GranterGrants({ granter: this.addrWallet });

      // console.log('Authz', queryAuthzResult)

      for (let i = 0; i < queryAuthzResult.grants.length; i++) {
        queryAuthzResult.grants[i].finaleAuthzType = GenericAuthorization.decode(queryAuthzResult.grants[i].authorization.value)
        let finalsTxs = setAuthzMsg(queryAuthzResult.grants[i].finaleAuthzType);
        queryAuthzResult.grants[i].finalData = finalsTxs
      }

      this.allAuthz = queryAuthzResult.grants
    },
    async getFeeGrantModule() {
      const queryFeegrant = new feegrant.QueryClientImpl(this.rpcClient);
      const queryFeegrantResult = await queryFeegrant.Allowances({ grantee: this.addrWallet });
      const queryAllowancesByGranterResult = await queryFeegrant.AllowancesByGranter({ granter: this.addrWallet });
      this.myFeeAllowances = queryFeegrantResult.allowances
      this.myFeeGrants = queryAllowancesByGranterResult.allowances

      let finalGranter = []
      for (let i = 0; i < this.myFeeAllowances.length; i++) {

        finalGranter[i] = this.myFeeAllowances[i].granter
      }
      this.formFeeGranter = finalGranter
    },
    async getAllProps() {

      // List of proposal from the blockchain
      let finalVersion = 'v1beta1'
      if(this.sdkVersion.substring(0,5) === 'v0.47') {
        finalVersion = 'v1'
      }
      const allProposals = await axios(
        cosmosConfig[this.setChainSelected].apiURL + '/cosmos/gov/'+finalVersion+'/proposals?pagination.limit=12&pagination.reverse=true'
      );
      const communityPool = await axios(
        cosmosConfig[this.setChainSelected].apiURL + '/cosmos/distribution/v1beta1/community_pool'
      );



      let finalPool = communityPool.data.pool.find(element => element.denom === cosmosConfig[this.setChainSelected].coinLookup.chainDenom)
      let allProps = allProposals.data.proposals.reverse();

      let finalProps = []
      allProps.forEach(element => {
        if(finalVersion === 'v1') {
          finalProps.push({
            proposal_id: element.id,
            title: element.title,
            status: element.status,
            final_tally_result: {
              yes: element.final_tally_result.yes_count,
              no: element.final_tally_result.no_count,
              no_with_veto: element.final_tally_result.no_with_veto_count,
              abstain: element.final_tally_result.abstain_count,
            }
          })
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
            }
          })
        }
      });

      this.allProposals = finalProps;
      this.communityPool = finalPool?.amount / 1000000
    },
    async getHomeProps() {
      let finalVersion = 'v1beta1'
      if(this.sdkVersion.substring(0,5) === 'v0.47') {
        finalVersion = 'v1'
      }
      // List of proposal from the blockchain
      const allProposals = await axios(
        cosmosConfig[this.setChainSelected].apiURL + '/cosmos/gov/'+finalVersion+'/proposals?pagination.limit=12&pagination.reverse=true'
      )
      let allProps = allProposals.data.proposals.reverse();
      let finalProps = []
      allProps.forEach(element => {
        if(finalVersion === 'v1') {
          finalProps.push({
            proposal_id: element.id,
            title: element.title,
            status: element.status,
            final_tally_result: {
              yes: element.final_tally_result.yes_count,
              no: element.final_tally_result.no_count,
              no_with_veto: element.final_tally_result.no_with_veto_count,
              abstain: element.final_tally_result.abstain_count,
            }
          })
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
            }
          })
        }
      });

      this.allHomeProposals = finalProps;
    },
    async getProposalId(id) {
      let finalVersion = 'v1beta1'
      if(this.sdkVersion.substring(0,5) === 'v0.47') {
        finalVersion = 'v1'
      }
      const getPropoId = await axios(
        cosmosConfig[this.setChainSelected].apiURL + '/cosmos/gov/'+finalVersion+'/proposals/' + id
      );

      let finalDataPropId = getPropoId.data.proposal





      let finalProp = []
      if(finalVersion === 'v1') {
        let typeMsg = ''
        if (finalDataPropId.messages[0]['@type'] !== '/cosmos.gov.v1.MsgExecLegacyContent') {
            typeMsg = finalDataPropId.messages[0]['@type']
        } else {
          typeMsg = finalDataPropId.messages[0].content['@type']

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
          }
        }
      } else {
        finalProp = {
          proposal_id: finalDataPropId.proposal_id,
          type: finalDataPropId.content['@type'],
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
          }
        }
      }
      //return getPropoId.data.proposal
      return finalProp
    },
    async getProposalIdVote(id) {
      const getPropoIdVote = await axios(
        cosmosConfig[this.setChainSelected].apiURL + '/cosmos/gov/v1beta1/proposals/'+ id +'/tally'
      );
      return getPropoIdVote.data.tally
    },
    async propIsVoted(id) {
      const getPropoIdVote = await axios(
        cosmosConfig[this.setChainSelected].apiURL + '/cosmos/gov/v1beta1/proposals/'+ id +'/votes/' + this.addrWallet
      );
      return getPropoIdVote.data
    },
    async getTransactions() {
      const resultSender = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/tx/v1beta1/txs?query=message.sender=%27" +
          this.addrWallet +
          "%27&limit=10&order_by=2"
      );
      const resultRecipient = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/tx/v1beta1/txs?query=transfer.recipient=%27" +
          this.addrWallet +
          "%27&limit=10&order_by=2"
      );
      const finalTxs = await resultSender.data.tx_responses.concat(
        resultRecipient.data.tx_responses
      );
      let push_array = [];
      for (let i of finalTxs) {
        let finalsTxs = setMsg(i.tx.body.messages[0], this.addrWallet, i.timestamp, i.txhash, { code: i.code, log: i.raw_log} );
        push_array.push(finalsTxs);

      }

      this.lastTransactions = push_array

      // console.log(finalSyntax)
      //this.lastTransactions = finalTxs
    },
    async getChainStats() {

      const inflation = await axios(cosmosConfig[this.setChainSelected].apiURL + '/cosmos/mint/v1beta1/inflation')
      const totalSupply = await axios(cosmosConfig[this.setChainSelected].apiURL + '/cosmos/bank/v1beta1/supply/ubcna')
      const communityPool = await axios(cosmosConfig[this.setChainSelected].apiURL + '/cosmos/distribution/v1beta1/community_pool')

      const querystaking = new staking.QueryClientImpl(this.rpcClient);
      let allValidators = await querystaking.Validators({ status: 'BOND_STATUS_BONDED' });
      let tokenBounded = 0
      for (let i = 0; i < allValidators.validators.length; i++) {
        const tokenByVal = allValidators.validators[i].tokens
        tokenBounded += Number(tokenByVal)
      }

      let finalInflation = inflation.data.inflation * 100
      let finalTotalSupply = totalSupply.data.amount.amount / 1000000
      let finalCommunityPool = communityPool.data.pool[0].amount / 1000000
      let finalBondedTokens = tokenBounded / 1000000

      let finalStats = {
        inflation: finalInflation,
        totalSupply: finalTotalSupply,
        bondedTokens: finalBondedTokens,
        notBondedTokens: finalTotalSupply - finalBondedTokens,
        communityPool: finalCommunityPool
      }
      this.finalStats = finalStats
      // commit('updateChainsStats', finalStats)
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
      let test = await fetch(cosmosConfig[this.setChainSelected].apiURL +'/cosmos/staking/v1beta1/validators?pagination.limit=500&status=BOND_STATUS_BONDED')

      let getValidators = await test.json()
      this.allValidators = getValidators.validators
      this.countAllValidators = getValidators.validators.length
    },
    async checkIsValidator() {
      const decode = bech32.decode(this.addrWallet)
      const returnAddress = bech32.encode(decode.prefix + 'valoper', decode.words)

      this.allValidators.find(element => element.operator_address === returnAddress) ? this.isValidator = true : this.isValidator = false
      if (this.isValidator) {
        // let myValidatorData = await fetch(cosmosConfig[this.setChainSelected].apiURL +'/cosmos/staking/v1beta1/validators/' + returnAddress)
        const myValidatorData = await axios(
          cosmosConfig[this.setChainSelected].apiURL + "/cosmos/staking/v1beta1/validators/" + returnAddress
        );
        const myValidatorRewards = await axios(
          cosmosConfig[this.setChainSelected].apiURL + "/cosmos/distribution/v1beta1/validators/"+returnAddress+"/commission"
        );
        this.myValidatorData = myValidatorData.data
        this.myValidatorReward = (myValidatorRewards.data?.commission.commission[0].amount / 1000000).toFixed(2)
      }
    },
    async getAllGroups() {
      const queryGroup = new group.QueryClientImpl(this.rpcClient);
      console.log(queryGroup)


      const queryGroupResult = await queryGroup.Groups({  });
      console.log(queryGroupResult)
      this.allGroup = queryGroupResult.groups

    },
    async getGroupId(id) {
      const queryGroup = new group.QueryClientImpl(this.rpcClient);

      console.log(queryGroup)

      let idGroup = Long.fromNumber(id, true)
      const queryGroupResult = await queryGroup.GroupPoliciesByGroup({ groupId: idGroup });
      const queryGroupMembersResult = await queryGroup.GroupMembers({ groupId: idGroup });


      let finalAmout = 0
      let finalRewards = 0
      for (let i = 0; i < queryGroupResult.groupPolicies.length; i++) {
        console.log('groupPolicies', queryGroupResult.groupPolicies[i])

        const queryBank = new bank.QueryClientImpl(this.rpcClient);
        let spendableBalances = await queryBank.SpendableBalances({ address: queryGroupResult.groupPolicies[i].address });
        //let allBalances = await queryBank.AllBalances({ address: queryGroupResult.groupPolicies[i].address });
        //console.log(spendableBalances)

        const found = spendableBalances.balances.find(element => element.denom === cosmosConfig[this.setChainSelected].coinLookup.chainDenom);
        console.log('found', found)
        if (typeof found !== 'undefined')
          finalAmout += Number(found?.amount)

        const queryDistrib = new distrib.QueryClientImpl(this.rpcClient);
        const queryDistribResult = await queryDistrib.DelegationTotalRewards({ delegatorAddress: queryGroupResult.groupPolicies[i].address });
        const foundRewards = queryDistribResult.total.find(element => element.denom === cosmosConfig[this.setChainSelected].coinLookup.chainDenom);

        if (typeof foundRewards !== 'undefined')
        finalRewards += Number(foundRewards.amount / 1000000000000000000000000)


      }
      console.log(finalAmout)
      console.log('foundRewards', finalRewards )
      this.finalAmountGroup = finalAmout / 1000000
      this.finalRewardGroup = finalRewards
      this.finalGroupMembers = queryGroupMembersResult
      this.finalGroupPolicies = queryGroupResult.groupPolicies

      let proposalsOfGroup = []
      for (let i = 0; i < queryGroupResult.groupPolicies.length; i++) {
        let queryGroupProposalsResult = await queryGroup.ProposalsByGroupPolicy({ address: queryGroupResult.groupPolicies[i].address });
        console.log('queryGroupProposalsResult', queryGroupProposalsResult.proposals)
        for (let j = 0; j < queryGroupProposalsResult.proposals.length; j++) {
          proposalsOfGroup.push(queryGroupProposalsResult.proposals[j])
        }

      }


      console.log('proposalsOfGroup', proposalsOfGroup)
      this.finalGroupProposals = proposalsOfGroup.reverse()
    },
    async getGroupProposalsId(id) {
      const queryGroup = new group.QueryClientImpl(this.rpcClient);
      console.log(Number(id))


      const queryGroupProposalResult = await queryGroup.Proposal({ proposalId: Long.fromNumber(id, true) });
      console.log(queryGroupProposalResult)
      this.finalGroupProposalId = queryGroupProposalResult
    },
    async allWalletByChain(key) {

      this.finalAllaWalletsData = []
      for (let key in cosmosConfig) {

        const decode = bech32.decode(this.addrWallet)
        const returnAddress = bech32.encode(cosmosConfig[key].coinLookup.addressPrefix, decode.words)

        var getBalance = Promise.all([
          fetch(cosmosConfig[key].apiURL + `/cosmos/bank/v1beta1/balances/` + returnAddress).then(resp => resp.json()),
          //fetch(cosmosConfig[this.setChainSelected].apiURL + `/cosmos/distribution/v1beta1/delegators/` + this.addrWallet + `/rewards`).then(resp => resp.json()),
          // fetch(cosmosConfig[data].apiURL + `/staking/delegators/` + addresseByChain + `/delegations`).then(resp => resp.json()),
          fetch('https://api.coingecko.com/api/v3/coins/' + cosmosConfig[key].coingeckoId + '/market_chart?vs_currency=usd&days=30').then(resp => resp.json()),
          // fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + cosmosConfig[data].coingeckoId + '&vs_currencies=usd').then(resp => resp.json()),
        ])
        getBalance.then((value) => {

          const foundAmount = value[0].balances.find(element => element.denom === cosmosConfig[key].coinLookup.chainDenom);

            let tokenPrice = []
            for (let keyPrice in value[1].prices) {
              // console.log(value[1].prices[keyPrice][1])
              if (cosmosConfig[key].name === 'Chihuahua')
                tokenPrice.push(value[1].prices[keyPrice][1] * 100)
              else
                tokenPrice.push(value[1].prices[keyPrice][1])
            }
           this.finalAllaWalletsData.push({
            wallet: returnAddress,
            chainConfig: cosmosConfig[key],
            walletBalance: foundAmount.amount,
            historicPrice: tokenPrice
          })
          //this.finalAllaWalletsData.push(value)
        })



      }

/*       const decode = bech32.decode(this.addrWallet)
      const returnAddress = bech32.encode(cosmosConfig[key].coinLookup.addressPrefix, decode.words)

      let finalAllaWalletsData = []

      console.log(this.addrWallet)
        var getBalance = Promise.all([
          fetch(cosmosConfig[key].apiURL + `/cosmos/bank/v1beta1/balances/` + returnAddress).then(resp => resp.json()),
          //fetch(cosmosConfig[this.setChainSelected].apiURL + `/cosmos/distribution/v1beta1/delegators/` + this.addrWallet + `/rewards`).then(resp => resp.json()),
          // fetch(cosmosConfig[data].apiURL + `/staking/delegators/` + addresseByChain + `/delegations`).then(resp => resp.json()),
          fetch('https://api.coingecko.com/api/v3/coins/' + cosmosConfig[key].coingeckoId + '/market_chart?vs_currency=usd&days=7').then(resp => resp.json()),
          // fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + cosmosConfig[data].coingeckoId + '&vs_currencies=usd').then(resp => resp.json()),
        ])
        getBalance.then((value) => {
          // console.log(value)
          this.finalAllaWalletsData.push(value)
        }) */
        console.log(this.finalAllaWalletsData)
    },

    async getGroupTransactions(addressGroup) {
      const resultSender = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/tx/v1beta1/txs?events=message.sender=%27" +
          addressGroup +
          "%27&limit=10&order_by=2"
      );
      const resultRecipient = await axios(
        cosmosConfig[this.setChainSelected].apiURL +
          "/cosmos/tx/v1beta1/txs?events=transfer.recipient=%27" +
          addressGroup +
          "%27&limit=10&order_by=2"
      );
      const finalTxs = await resultSender.data.tx_responses.concat(
        resultRecipient.data.tx_responses
      );
      let push_array = [];
      for (let i of finalTxs) {
        let finalsTxs = setMsg(i.tx.body.messages[0], addressGroup, i.timestamp, i.txhash, { code: i.code, log: i.raw_log} );
        push_array.push(finalsTxs);

      }

      this.lastGroupTransactions = push_array
    },
    async keplrConnect() {

      await window.keplr.experimentalSuggestChain({
        chainId: cosmosConfig[this.setChainSelected].chainId,
        chainName: cosmosConfig[this.setChainSelected].name,
        rpc: cosmosConfig[this.setChainSelected].rpcURL,
        rest: cosmosConfig[this.setChainSelected].apiURL,
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: cosmosConfig[this.setChainSelected].coinLookup.addressPrefix,
          bech32PrefixAccPub: cosmosConfig[this.setChainSelected].coinLookup.addressPrefix + "pub",
          bech32PrefixValAddr: cosmosConfig[this.setChainSelected].coinLookup.addressPrefix + "valoper",
          bech32PrefixValPub: cosmosConfig[this.setChainSelected].coinLookup.addressPrefix + "valoperpub",
          bech32PrefixConsAddr: cosmosConfig[this.setChainSelected].coinLookup.addressPrefix + "valcons",
          bech32PrefixConsPub: cosmosConfig[this.setChainSelected].coinLookup.addressPrefix + "valconspub",
        },
        currencies: [
          {
            coinDenom: cosmosConfig[this.setChainSelected].coinLookup.viewDenom,
            coinMinimalDenom: cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
            coinDecimals: 6,
            coinGeckoId: cosmosConfig[this.setChainSelected].coingeckoId,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: cosmosConfig[this.setChainSelected].coinLookup.viewDenom,
            coinMinimalDenom: cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
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
          coinMinimalDenom: cosmosConfig[this.setChainSelected].coinLookup.chainDenom,
          coinDecimals: 6,
          coinGeckoId: cosmosConfig[this.setChainSelected].coingeckoId,
        },
    })
      let chainId = cosmosConfig[this.setChainSelected].chainId

      await window.keplr.enable(chainId);
      const offlineSigner = await window.getOfflineSignerAuto(chainId);
      const accounts = await offlineSigner.getAccounts();
      const getKey = await window.keplr.getKey(chainId);
      this.addrWallet = accounts[0].address
      this.nameWallet = getKey
      this.isLogged = true
      // console.log('addr: '+accounts[0].address)
      /* commit('setAddrWallet', accounts[0].address)
      commit('setNameWallet', getKey.name)
      dispatch('getAccountData') */

    },
  }
})
