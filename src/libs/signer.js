import {
  defaultRegistryTypes,
  assertIsDeliverTxSuccess,
  SigningStargateClient,
  SigningStargateClientOptions,
  GasPrice,
  calculateFee,
} from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
import cosmosConfig from "@/cosmos.config";

import { MsgExecLegacyContent } from "cosmjs-types/cosmos/gov/v1/tx";
import { MsgCommunityPoolSpend } from "cosmjs-types/cosmos/distribution/v1beta1/tx";

export async function selectSigner(chain) {
  // Register the legacy content type
  const registry = new Registry(defaultRegistryTypes);

  registry.register(
    "/cosmos.gov.v1.MsgExecLegacyContent",
    MsgExecLegacyContent,
  );
  registry.register(
    "/cosmos.distribution.v1beta1.MsgCommunityPoolSpend",
    MsgCommunityPoolSpend,
  );

  console.log("cosmosConfig", chain);
  // Keplr connect
  const chainId = cosmosConfig[chain].chainId;
  await window.keplr.enable(chainId);
  const offlineSigner = await window.getOfflineSignerAuto(chainId);

  const accounts = await offlineSigner.getAccounts();

  const client = await SigningStargateClient.connectWithSigner(
    cosmosConfig[chain].rpcURL,
    offlineSigner,
    {
      gasPrice: GasPrice.fromString(
        cosmosConfig[chain].gasPrice +
          cosmosConfig[chain].coinLookup.chainDenom,
      ),
      registry: registry,
    },
  );

  return { client, accounts };
}

export async function calculFee(msg) {
  // calcul Fee

  return { msg };
}
