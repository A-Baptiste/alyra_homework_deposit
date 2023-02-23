// Import du smart contract "voting.sol"
const Voting = artifacts.require("voting");
module.exports = (deployer) => {
 // Deployer le smart contract!
 deployer.deploy(Voting);
} 