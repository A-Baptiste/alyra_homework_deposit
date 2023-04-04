// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// import "hardhat/console.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
* @title CryptoBet
* @author Baptiste ALCHAIR
* @notice Bet on crypto currency rate, with eth or custom erc20
*/
contract CryptoBet is Ownable, ERC20 {
  // --- VARIABLES ---
  struct UserBet {
      uint256 betValue;
      uint256 balance;
      Expectations expectStatus;
      BetStatus betStatus;
      bool token;
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
  uint256 public currentBetBalanceErc20;

  int256 public currentPriceFeed;
  uint256 public betValue = 10;
  uint256 salesMargin = 90; // means 10% margin
  bool transferPending; // avoid re-entrency

  AggregatorV3Interface internal priceFeed;

  // --- EVENTS ---

  event evt_newBet(uint256 totalBet, uint256 betBalance, bool token);
  event evt_betFinish(address userAddr, bool result);
  event evt_nextRound(
    uint256 winners,
    uint256 winnersErc20,
    uint256 loosers,
    uint256 loosersErc20,
    int256 newPriceFeed
  );

  // --- CONSTRUCTOR ---
  
  // sepolia testnet price feed address (ETH vs USD) :
  // 0x694AA1769357215DE4FAC081bf1f309aDC325306

  constructor(address _oracleAddress) ERC20("EasyDappFreeToken", "EDFT") {
      priceFeed = AggregatorV3Interface(_oracleAddress);
      _mint(msg.sender,1000*10**18);
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

  // avoid dos gas limit
  modifier mustRemainsSpace() {
      require(
          betters.length < 10000,
          unicode"bet pool is full"
      );
      _;
  }

  modifier mustHaveLowToken() {
    require(
          balanceOf(msg.sender) < betValue * 3,
          unicode"you have too much EDFT"
      );
      _;
  }

  modifier mustEnouthErc20() {
    require(
          balanceOf(msg.sender) >= betValue,
          unicode"not enough EDFT"
      );
      _;
  }

  // --- FUCTIONS ---

  /**
  * @dev Return betters array
  * @return betters array
  */
  function getBetters() public view returns(address[] memory) {
    return betters;
  }

  /**
  * @dev return better data by his address
  * @param _addr better's address
  * @return UserBet struct
  */
  function getOneBetter(address _addr) public view returns(UserBet memory) {
      return userBets[_addr];
  }

  /**
  * @dev comptue winners (ETH and EDFT) and switch to next round
  */
  function nextRound() external onlyOwner {
    int256 newPriceFeed = getLatestPrice();
    uint256 winners;
    uint256 winnersErc20;
    uint256 loosers;
    uint256 loosersErc20;
    Expectations answerStatus = getRoundAnswer(newPriceFeed);

    // update price feed
    currentPriceFeed = newPriceFeed;
   
    // compute winners 
    for (uint256 i = 0; i < betters.length; i = i + 1) {
      if (userBets[betters[i]].expectStatus == answerStatus) {
        userBets[betters[i]].betStatus = BetStatus(uint256(3));
        if (userBets[betters[i]].token == true) {
          winnersErc20 = winnersErc20 + 1;
        } else {
          winners = winners + 1;
        }
        emit evt_betFinish(betters[i], true); 
      } else {
        userBets[betters[i]].betStatus = BetStatus(uint256(2));
        if (userBets[betters[i]].token == true) {
          loosersErc20 = loosersErc20 + 1;
        } else {
          loosers = loosers + 1;
        }
        // resetUserBet(betters[i]);
        emit evt_betFinish(betters[i], false); 
      }
    }

    computeRewards(winners, winnersErc20);
    emit evt_nextRound(
      winners,
      winnersErc20,
      loosers,
      loosersErc20,
      currentPriceFeed
    ); 

    delete betters;
    delete currentBetBalance;
    delete currentBetBalanceErc20;
  }

  /**
  * @dev compute round answer with current and last price feed
  * @param _newPriceFeed new price feed
  * @return Expectations enum (1 or 2)
  */
  function getRoundAnswer(int256 _newPriceFeed) private view returns(Expectations) {
    if (_newPriceFeed > currentPriceFeed) {
      return Expectations(uint256(2));
    }
    return Expectations(uint256(1));
  }

  /**
  * @dev compute rewards for the winnig betters
  * @param win number of winner
  * @param winErc20 number of winner using EDFT
  */
  function computeRewards(uint256 win, uint256 winErc20) private {
    for (uint256 i = 0; i < betters.length; i = i + 1) {
      if (userBets[betters[i]].betStatus == BetStatus(uint256(3))) {
        if (userBets[betters[i]].token == true) {
          userBets[betters[i]].balance = currentBetBalanceErc20 / winErc20;
        } else {
          userBets[betters[i]].balance = currentBetBalance / win;
        }
      }
    }
  }

  /**
  * @dev register a bet
  * @param _expectation expectation af results (up or down)
  */
  function registerBet(uint256 _expectation) external payable mustNotBeBetting mustSendRightValue mustRemainsSpace {
    betters.push(msg.sender);
    userBets[msg.sender].betValue = betValue;
    userBets[msg.sender].expectStatus = Expectations(uint256(_expectation));
    userBets[msg.sender].betStatus = BetStatus(uint256(1));
    currentBetBalance = currentBetBalance + betValue;
    emit evt_newBet(betters.length, currentBetBalance, false);
  }

  /**
  * @dev register a bet with erc20
  * @param _expectation expectation af results (up or down)
  */
  function registerBetErc20(uint256 _expectation) external mustNotBeBetting mustEnouthErc20 mustRemainsSpace {
    // handle token tranfer
    increaseAllowance(msg.sender, betValue*10**18);
    bool response = transferFrom(msg.sender, owner(), betValue*10**18);
    require (response == true, unicode"transfer erc20 failed, please retry");

    betters.push(msg.sender);
    userBets[msg.sender].betValue = betValue;
    userBets[msg.sender].expectStatus = Expectations(uint256(_expectation));
    userBets[msg.sender].betStatus = BetStatus(uint256(1));
    userBets[msg.sender].token = true;

    currentBetBalanceErc20 = currentBetBalanceErc20 + betValue;
    emit evt_newBet(betters.length, currentBetBalanceErc20, true);
  }

  /**
  * @dev claim a reward if sender is a winner
  */
  function claimBet() external mustBetEnded{
    if (userBets[msg.sender].betStatus == BetStatus(uint256(3)) && transferPending == false) {
      transferPending = true;
      if (userBets[msg.sender].token == true) {
        _mint(msg.sender, userBets[msg.sender].balance*10**18);
      } else {
        uint256 rewardValue = ( userBets[msg.sender].balance * salesMargin ) / 100;
        (bool success, ) = msg.sender.call{value: rewardValue}("");
        require (success, unicode"Reward transfer failed, please retry");
      }
    }
    resetUserBet(msg.sender);
    transferPending = false;
  }

  /**
  * @dev reset bet user data
  * @param _userToRemove user's address to remove
  */
  function resetUserBet(address _userToRemove) private {
    delete userBets[_userToRemove].betValue;
    delete userBets[_userToRemove].expectStatus;
    delete userBets[_userToRemove].balance;
    delete userBets[_userToRemove].betStatus;
    delete userBets[_userToRemove].token;
  }

  /**
  * @dev mint some edft
  */
  function mintEDFT() external mustHaveLowToken {
    _mint(msg.sender, 30*10**18);
  }

  /**
  * @dev call oracle to get latest price
  */
  function getLatestPrice() public view returns (int) {
  ( , int price, , , ) = priceFeed.latestRoundData();
      return price;
  }

  receive() external payable {}
  fallback() external payable {}
}
