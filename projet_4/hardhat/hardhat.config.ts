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
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      //@ts-ignore
      accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    }
  },
  solidity: "0.8.18",
};

export default config;
