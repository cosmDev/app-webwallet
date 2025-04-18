export default [
  {
    chainId: "cosmoshub-4",
    name: "Atom",
    desc: "Cosmos is an ever-expanding ecosystem of interoperable and sovereign blockchain apps and services, built for a decentralized future.",
    slot: "atom",
    mode: 'mainnet',
    apiURL: "https://cosmoshub.lava.build:443",
    rpcURL: "https://rpc.lavenderfive.com:443/cosmoshub",
    coinLookup: {
      viewDenom: "ATOM",
      chainDenom: "uatom",
      addressPrefix: "cosmos",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
      banner: "https://pbs.twimg.com/profile_banners/1019126440233615361/1684483223/1500x500",
    },
    feeMultiplier: 1.3,
    gasPrice: 0.025,
    explorerUrl: 'https://www.mintscan.io/cosmos/txs/',
    coingeckoId: 'cosmos',
    color: "#0091EA",
    colorChart: ['#20212b', '#2E3148', '#0091EA', '#004d38'],
    modules: {
      feeGrant: true,
      authz: true,
      wasm: false,
      group: false,
    }
  }
]
