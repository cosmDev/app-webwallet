export function setAuthzMsg(data) { 
  let finalType = data.msg;
  let titleMsg = ""; 


  // console.log(all)
 
  switch (finalType) {
    case "/cosmos.bank.v1beta1.MsgSend":
      titleMsg = "Send" 
      break;
    case "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission":
      titleMsg = "Withdraw Validator"
      break;      
    case "/cosmos.staking.v1beta1.MsgDelegate":
      titleMsg = "Delegate"
      break;  
    case "/cosmos.gov.v1beta1.MsgVote":
      titleMsg = "Vote"
      break;        
    case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
      titleMsg = "Redelegate"
      break;      
    case "/cosmos.staking.v1beta1.MsgUndelegate":
      titleMsg = "Undelegate"
      break; 
    case "/cosmos.bank.v1beta1.MsgMultiSend":
      titleMsg = "Multi Send"
      break; 

    // Gitopia msg
    case "/gitopia.gitopia.gitopia.MsgAddRepositoryBackupRef":
      titleMsg = "Add Repository Backup"
      break;    
    case "/gitopia.gitopia.gitopia.MsgUpdateRepositoryBackupRef":
      titleMsg = "Update Repository Backup"
      break;                
    case "/gitopia.gitopia.gitopia.MsgForkRepository":
      titleMsg = "Fork Repository"
      break;    
    case "/gitopia.gitopia.gitopia.MsgForkRepositorySuccess":
      titleMsg = "Fork Repository Success"
      break;   
    case "/gitopia.gitopia.gitopia.MsgSetPullRequestState":
      titleMsg = "Set Pull Request State"
      break;         
    case "/gitopia.gitopia.gitopia.MsgUpdateTask":
      titleMsg = "Update Task"
      break;           
      
    default:
      console.log("Sorry, dont know authz " + finalType + ".");
  }
  return { finalType, titleMsg };
}
