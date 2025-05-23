export function setMsg(msg, msgData, addrGet, timestamp, allVal, txHash) {
  let type = "";
  let typeReadable = "";
  let color = "";
  let icon = "";
  let foundVal = "";
  let foundVal2 = "";
  let finalHash = "";

  switch (msg) {
    case "/cosmos.bank.v1beta1.MsgSend":
      console.log("MsgSend", msgData);
      if (msgData.to_address === addrGet) {
        typeReadable = "Receive";
      } else typeReadable = "Send";
      type = msg;

      color = "#00b786";
      icon = "Send.svg";
      finalHash = txHash;
      msgData = {
        from: msgData.from_address,
        to: msgData.to_address,
        amount: msgData.amount[0].amount / 1000000,
      };
      break;
    case "/cosmos.staking.v1beta1.MsgDelegate":
      foundVal = allVal.find(
        (element) => element.operator_address === msgData.validator_address,
      );
      type = msg["@type"];
      typeReadable = "Delegate";
      color = "#f0a841";
      icon = "Stake.svg";
      finalHash = txHash;

      msgData = {
        delegator_address: msgData.delegator_address,
        validator_address: foundVal?.description.moniker,
        amount: msgData.amount.amount / 1000000,
      };
      break;
    case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
      foundVal = allVal.find(
        (element) => element.operator_address === msgData.validator_address,
      );
      type = msg["@type"];
      typeReadable = "Claim reward";
      color = "#6fffa3";
      icon = "ClaimRewards.svg";
      finalHash = txHash;
      msgData = {
        delegator_address: msgData.delegator_address,
        validator_address: foundVal?.description.moniker,
      };

      break;
    case "/cosmos.staking.v1beta1.MsgUndelegate":
      /* foundVal = allVal.find(
        (element) => element.op_address === msg.validator_address
      ); */
      type = msg["@type"];
      typeReadable = "Unbond";
      color = "#f15249";
      icon = "Unstake.svg";
      finalHash = txHash;
      msgData = {
        delegator_address: msgData.delegator_address,
        //validator_address: foundVal?.name,
        amount: msgData.amount.amount / 1000000,
      };
      console.log("Unbond", msgData);
      break;
    case "/cosmos.gov.v1beta1.MsgSubmitProposal":
      type = msg["@type"];
      typeReadable = "Submit proposal v1beta1";
      color = "#8555de";
      icon = "Unknown.svg";
      finalHash = txHash;
      msgData = {
        proposal_id: msg.proposal_id,
      };
      break;

    case "/cosmos.gov.v1.MsgVote":
    case "/cosmos.gov.v1beta1.MsgVote":
      type = msg["@type"];
      typeReadable = "Vote";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      msgData = {
        proposal_id: msgData.proposal_id,
        option: msgData.option,
      };
      break;
    case "/cosmos.gov.v1beta1.MsgDeposit":
    case "/cosmos.gov.v1.MsgDeposit":
      type = msg["@type"];
      typeReadable = "Submit Deposit";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      /*       msgData = {
        proposal_id: msg.proposal_id,
        amount: msg.amount[0].amount / 1000000,
      }; */
      break;
    case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
      /*       foundVal = allVal.find(
        (element) => element.op_address === msg.validator_src_address
      );
      foundVal2 = allVal.find(
        (element) => element.op_address === msg.validator_dst_address
      ); */
      type = msg["@type"];
      typeReadable = "Redelegate";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      msgData = {
        //from: foundVal?.name,
        //to: foundVal2?.name,
        amount: msgData.amount.amount / 1000000,
      };
      break;
    case "/cosmos.slashing.v1beta1.MsgUnjail":
      type = msg["@type"];
      typeReadable = "Unjail";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.staking.v1beta1.MsgCreateValidator":
      type = msg["@type"];
      typeReadable = "Create Validator";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.staking.v1beta1.MsgEditValidator":
      type = msg["@type"];
      typeReadable = "Edit Validator";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/ibc.applications.transfer.v1.MsgTransfer":
      typeReadable = "IBC";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.bank.v1beta1.MsgMultiSend":
      typeReadable = "MultiSend";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.group.v1.MsgCreateGroupWithPolicy":
      typeReadable = "Create Group With Policy";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.group.v1.MsgUpdateGroupMembers":
      typeReadable = "Update Group Members";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.group.v1.MsgCreateGroupPolicy":
      typeReadable = "Create Group Policy";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.group.v1.MsgSubmitProposal":
      typeReadable = "Submit Group Proposal";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.group.v1.MsgVote":
      type = msg["@type"];
      typeReadable = "Group Vote";
      color = "#8555de";
      icon = "Unknown.svg";
      finalHash = txHash;
      msgData = {
        option: msg.option,
        proposal_id: msg.proposal_id,
        metadata: msg.metadata,
      };
      break;
    case "/cosmos.group.v1.MsgExec":
      typeReadable = "Group Execute";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    // Feegrant
    case "/cosmos.feegrant.v1beta1.MsgGrantAllowance":
      typeReadable = "Fee Grant";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.feegrant.v1beta1.MsgRevokeAllowance":
      typeReadable = "Revoke Fee Grant";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    // ibc
    case "/ibc.core.channel.v1.MsgRecvPacket":
      typeReadable = "Ibc Recv Packet";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/ibc.core.client.v1.MsgUpdateClient":
      typeReadable = "Ibc Update Client";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;

    case "/ibc.core.channel.v1.MsgTimeout":
      typeReadable = "Ibc Timeout";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission":
      typeReadable = "Val Commission";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.authz.v1beta1.MsgExec":
      typeReadable = "Authz Exec";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
    case "/cosmos.gov.v1.MsgSubmitProposal":
      typeReadable = "Submit Proposal v1";
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;

    default:
      //console.log("Sorry, dont know " + msg + ".");
      typeReadable = msg;
      color = "#00b786";
      icon = "Unknown.svg";
      finalHash = txHash;
      break;
  }
  return { type, typeReadable, color, icon, timestamp, finalHash, msgData };
}
