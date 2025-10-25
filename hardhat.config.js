require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

module.exports = {
  solidity: "0.8.19",
  networks: {
    monad: {
      url: process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 10143,
    },
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      monad: process.env.MONAD_API_KEY || "verifyContract",
    },
    customChains: [
      {
        network: "monad",
        chainId: 10143,
        urls: {
          apiURL: "https://testnet.monadexplorer.com/api",
          browserURL: "https://testnet.monadexplorer.com",
        },
      },
    ],
  },
}
