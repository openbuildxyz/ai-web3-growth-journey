require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: "0.8.20",
  networks: {
    monad_testnet: {
      url: "https://testnet-rpc.monad.xyz/",
      chainId: 10143,
      accounts: [PRIVATE_KEY]
    }
  }
};
