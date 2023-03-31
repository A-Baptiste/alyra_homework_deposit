// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// import "hardhat/console.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract CryptoBet is Ownable {
  // --- VARIABLES ---
  struct UserBet {
      uint256 bet_value;
      uint256 balance;
      Expectations expectStatus;
      bool isWinner;
      bool isBetting;
  }

  enum Expectations {
    noting,
    down,
    up
  }

  mapping(address => UserBet) userBets;

  address[] betters;
  uint256 public currentBetBalance;

  int256 public currentPriceFeed;
  uint256 public betValue = 10;

  AggregatorV3Interface internal priceFeed;

  // --- EVENTS ---

  // --- CONSTRUCTOR ---
  
  // sepolia testnet price feed address (ETH vs USD) :
  // 0x694AA1769357215DE4FAC081bf1f309aDC325306

  constructor() {
      priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
  }

  // --- MODIFIERS ---

  modifier mustNotBeBetting() {
      require(
          userBets[msg.sender].isBetting == false,
          unicode"must not betting to execute this function"
      );
      _;
  }

  modifier mustBeBetting() {
      require(
          userBets[msg.sender].isBetting == true,
          unicode"must be betting to execute this function"
      );
      _;
  }

  // --- FUCTIONS ---

  function nextRound() external onlyOwner {
    int256 newPriceFeed = getLatestPrice();
    uint256 winners;
    Expectations answerStatus = getRoundAnswer(newPriceFeed);

    // update price feed
    currentPriceFeed = newPriceFeed;
   
    for (uint256 i = 0; i < betters.length; i = i + 1) {
      if (userBets[betters[i]].expectStatus == answerStatus) {
        userBets[betters[i]].isWinner == true;
        winners = winners + 1;
        // EVT -> you win
      } else {
        resetUserBet(betters[i]);
        // EVT -> you loose
      }
    }

    computeRewards(winners);
    delete betters;
    // EVT -> next round
  }

  function getRoundAnswer(int256 _newPriceFeed) private view returns(Expectations) {
    if (_newPriceFeed > currentPriceFeed) {
      return Expectations(uint256(2));
    }
    return Expectations(uint256(1));
  }

  function computeRewards(uint256 win) private {
    for (uint256 i = 0; i < betters.length; i = i + 1) {
      if (userBets[betters[i]].isWinner == true) {
        userBets[betters[i]].balance = win / currentBetBalance;
      }
    }
  }

  // register a bet
  function registerBet(uint256 _expectation) external payable mustNotBeBetting {
    betters.push(msg.sender);
    userBets[msg.sender].bet_value = betValue;
    userBets[msg.sender].expectStatus = Expectations(uint256(_expectation));
    userBets[msg.sender].isBetting = true;
    currentBetBalance = currentBetBalance + betValue;
    // EVT -> nex bet
  }

  // claim a bet
  function claimBet() external mustBeBetting {
    if (userBets[msg.sender].isWinner == true) {
      (bool success, ) = msg.sender.call{value: userBets[msg.sender].bet_value}("");
      require (success, unicode"Echec du transfer de la recompense veuillez réessayer");
    }
    resetUserBet(msg.sender);
  }

  function resetUserBet(address _userToRemove) private {
    delete userBets[_userToRemove].bet_value;
    delete userBets[_userToRemove].expectStatus;
    delete userBets[_userToRemove].balance;
    delete userBets[_userToRemove].isBetting;
    delete userBets[_userToRemove].isWinner;
  }

  // get latest price
  function getLatestPrice() public view returns (int) {
  (
      uint80 roundID, 
      int price,
      uint startedAt,
      uint timeStamp,
      uint80 answeredInRound
  ) = priceFeed.latestRoundData();
      return price;
  }
}
