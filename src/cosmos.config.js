import igniteConfig from "./ignite.config.json";
import axios from "axios";

let allTokensData = [];

const fetchChainToken = async () => {
  try {
    const response = await axios.get(
      "https://chain-lcd.cosmdev.com/cosmos/bank/v1beta1/supply",
    );

    const tokens = response.data.supply;
    for (const token of tokens) {
      const denom = token.denom;
      const amount = token.amount;

      allTokensData.push({
        denom: denom,
        amount: amount,
        viewDenom: denom.replace("u", "").toUpperCase(),
      });
    }
  } catch (error) {
    console.error("Error fetching chain info:", error);
  }
};

fetchChainToken();

export default [
  {
    chainId: igniteConfig.chainID,
    name: igniteConfig.chainID,
    desc: "Description for " + igniteConfig.chainID,
    apiURL: "https://chain-lcd.cosmdev.com",
    rpcURL: "https://chain-rpc.cosmdev.com",
    coinLookup: {
      viewDenom: igniteConfig.chainViewdenom,
      chainDenom: igniteConfig.chainDenom,
      addressPrefix: igniteConfig.chainPrefix,
    },
    allTokensData,
    feeMultiplier: 1.3,
    gasPrice: 0.025,
  },
];
