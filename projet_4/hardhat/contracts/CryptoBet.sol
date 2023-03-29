// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// import "hardhat/console.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract CryptoBet {
    // --- VARIABLES ---
    uint256 currentRound;
    AggregatorV3Interface internal priceFeed;

    struct Bet {
        uint256 bet_value;
        uint256 start_crypto_value;
        uint256 block_number;
        bool expectation;
        bool isBetting;
    }

    struct BetRound{
      address[] betters;
      uint256 workflowBetBalance;
    }

    mapping(address => uint256) balances;
    mapping(address => Bet) bets;

    uint256 DEFAULT_BET_VALUE = 10 wei;

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
            bets[msg.sender].isBetting == false,
            unicode"must not betting to execute this function"
        );
        _;
    }

    modifier mustBeBetting() {
        require(
            bets[msg.sender].isBetting == true,
            unicode"must be betting to execute this function"
        );
        _;
    }

    // --- FUCTIONS ---

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

    // register a bet
    function registerBet(bool _expectation) external payable mustNotBeBetting {
      // do something
    }

    // claim a bet
    function claimBet() external mustBeBetting {
      // do someting
    }
}
