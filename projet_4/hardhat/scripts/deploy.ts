import { ethers } from "hardhat";
require('dotenv').config();

async function main() {
  const cryptoBetContract = await ethers.getContractFactory("CryptoBet");
  // @ts-ignore
  const cryptoBet = await cryptoBetContract.deploy(process.env.SEPOLIA_ORACLE_ADDRESS);

  await cryptoBet.deployed();

  console.log(`CryptoBet deployed to ${cryptoBet.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
