// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// import "hardhat/console.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract CryptoBet is Ownable {
  // --- VARIABLES ---
  struct UserBet {
      uint256 betValue;
      uint256 balance;
      Expectations expectStatus;
      BetStatus betStatus;
  }

  enum Expectations {
    noting,
    down,
    up
  }

  enum BetStatus {
    noBet,
    pending,
    loose,
    win
  }

  mapping(address => UserBet) userBets;

  address[] betters;
  uint256 public currentBetBalance;

  int256 public currentPriceFeed;
  uint256 public betValue = 10;

  AggregatorV3Interface internal priceFeed;

  // --- EVENTS ---

  event evt_newBet(uint256 totalBet, uint256 betBalance);
  event evt_betFinish(address userAddr, bool result);
  event evt_nextRound(uint256 winners,  uint256 totalBet, int256 newPriceFeed);

  // --- CONSTRUCTOR ---
  
  // sepolia testnet price feed address (ETH vs USD) :
  // 0x694AA1769357215DE4FAC081bf1f309aDC325306

  constructor(address _oracleAddress) {
      priceFeed = AggregatorV3Interface(_oracleAddress);
  }

  // --- MODIFIERS ---

  modifier mustNotBeBetting() {
      require(
          userBets[msg.sender].betStatus == BetStatus(uint256(0)),
          unicode"must not betting to execute this function"
      );
      _;
  }

  modifier mustSendRightValue() {
      require(
          msg.value == betValue,
          unicode"you must send exactly the bet value"
      );
      _;
  }

  modifier mustBetEnded() {
      require(
          userBets[msg.sender].betStatus == BetStatus(uint256(2)) ||
          userBets[msg.sender].betStatus == BetStatus(uint256(3)),
          unicode"wait till your bet has finished"
      );
      _;
  }

  // --- FUCTIONS ---

  function getBetters() public view returns(address[] memory) {
    return betters;
  }

  function getOneBetter(address _addr) public view returns(UserBet memory) {
      return userBets[_addr];
  }

  function nextRound() external onlyOwner {
    int256 newPriceFeed = getLatestPrice();
    uint256 winners;
    Expectations answerStatus = getRoundAnswer(newPriceFeed);

    // update price feed
    currentPriceFeed = newPriceFeed;
   
    // compute winners 
    for (uint256 i = 0; i < betters.length; i = i + 1) {
      if (userBets[betters[i]].expectStatus == answerStatus) {
        userBets[betters[i]].betStatus = BetStatus(uint256(3));
        winners = winners + 1;
        emit evt_betFinish(betters[i], true); 
      } else {
        userBets[betters[i]].betStatus = BetStatus(uint256(2));
        // resetUserBet(betters[i]);
        emit evt_betFinish(betters[i], false); 
      }
    }

    computeRewards(winners);
    emit evt_nextRound(winners, betters.length, currentPriceFeed); 

    delete betters;
    delete currentBetBalance;
  }

  function getRoundAnswer(int256 _newPriceFeed) private view returns(Expectations) {
    if (_newPriceFeed > currentPriceFeed) {
      return Expectations(uint256(2));
    }
    return Expectations(uint256(1));
  }

  function computeRewards(uint256 win) private {
    for (uint256 i = 0; i < betters.length; i = i + 1) {
      if (userBets[betters[i]].betStatus == BetStatus(uint256(3))) {
        userBets[betters[i]].balance = currentBetBalance / win;
      }
    }
  }

  // register a bet
  function registerBet(uint256 _expectation) external payable mustNotBeBetting mustSendRightValue {
    betters.push(msg.sender);
    userBets[msg.sender].betValue = betValue;
    userBets[msg.sender].expectStatus = Expectations(uint256(_expectation));
    userBets[msg.sender].betStatus = BetStatus(uint256(1));
    currentBetBalance = currentBetBalance + betValue;
    emit evt_newBet(betters.length, currentBetBalance);
  }

  // claim a bet
  function claimBet() external mustBetEnded{
    // TODO get marge
    if (userBets[msg.sender].betStatus == BetStatus(uint256(3))) {
      (bool success, ) = msg.sender.call{value: userBets[msg.sender].balance}("");
      require (success, unicode"Reward transfer failed, please retry");
    }
    resetUserBet(msg.sender);
  }

  function resetUserBet(address _userToRemove) private {
    delete userBets[_userToRemove].betValue;
    delete userBets[_userToRemove].expectStatus;
    delete userBets[_userToRemove].balance;
    delete userBets[msg.sender].betStatus;
  }

  // get latest price
  function getLatestPrice() public view returns (int) {
  ( , int price, , , ) = priceFeed.latestRoundData();
      return price;
  }

  receive() external payable {}
  fallback() external payable {}
}
