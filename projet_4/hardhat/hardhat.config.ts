import { HardhatUserConfig } from "hardhat/config";
require('dotenv').config();
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        // @ts-ignore
        url: process.env.SEPOLIA_RPC_URL
      }
    },
    // kovan: {
    //   url: process.env.KOVAN_RPC_URL,
    //   accounts: {
    //     mnemonic: process.env.MNEMONIC
    //   }
    // }
  },
  solidity: "0.8.18",
};

export default config;
