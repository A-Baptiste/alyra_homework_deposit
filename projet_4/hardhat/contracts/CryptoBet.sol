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
      Results betStatus;
      bool isBetting;
  }

  enum Expectations {
    noting,
    down,
    up
  }

  enum Results {
    noting,
    loose,
    win
  }

  mapping(address => UserBet) userBets;

  address[] betters;
  uint256 currentBetBalance;

  int256 currentPriceFeed;
  uint256 DEFAULT_BET_VALUE = 10;

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

  function nextRound() external {
    Expectations answerStatus = Expectations(uint256(1));
    int256 newPriceFeed = getLatestPrice();

    uint256 winners;

    if (newPriceFeed > currentPriceFeed) {
      answerStatus = Expectations(uint256(2));
    }
    currentPriceFeed = newPriceFeed;

    for (uint256 i = 0; i < betters.length; i = i + 1) {
      if (userBets[betters[i]].expectStatus == answerStatus) {
        userBets[betters[i]].betStatus == Results(uint256(2));
        winners = winners + 1;
        // EVT -> you win
      } else {
        userBets[betters[i]].betStatus == Results(uint256(1));
        // EVT -> you loose
      }
    }

    computeRewards(winners);
    delete betters;
    // EVT -> next round
  }

  function computeRewards(uint256 win) private {
    for (uint256 i = 0; i < betters.length; i = i + 1) {
      if (userBets[betters[i]].betStatus == Results(uint256(2))) {
        userBets[betters[i]].balance = win / currentBetBalance;
      }
    }
  }

  // register a bet
  function registerBet(uint256 _expectation) external payable mustNotBeBetting {
    betters.push(msg.sender);
    userBets[msg.sender].bet_value = DEFAULT_BET_VALUE;
    userBets[msg.sender].expectStatus = Expectations(uint256(_expectation));
    userBets[msg.sender].isBetting = true;
  }

  // claim a bet
  function claimBet() external mustBeBetting {
    if (userBets[msg.sender].betStatus == Results(uint256(2))) {
      // VIREMENT userBets[msg.sender].balance
    }

    delete userBets[msg.sender].bet_value;
    delete userBets[msg.sender].expectStatus;
    delete userBets[msg.sender].balance;
    userBets[msg.sender].isBetting = false;
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
