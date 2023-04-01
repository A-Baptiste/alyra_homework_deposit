import { ethers } from "hardhat";

async function main() {
  const cryptoBetContract = await ethers.getContractFactory("CryptoBet");
  const cryptoBet = await cryptoBetContract.deploy();

  await cryptoBet.deployed();

  console.log(`Voting deployed to ${cryptoBet.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
