import { useEffect, useState } from 'react';
import { useAccount, useBalance, useContractEvent, useContractRead } from 'wagmi';
import { useContract, useSigner } from 'wagmi';
import artifact from '../contracts/CryptoBet.json';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

// const BET_VALUE = "0.000000000000000010" // 10 wei
const BET_VALUE = "1" // 1 eth

export function useCryptoBet() {
  const [userStatus, setUserStatus] = useState<string>("guest");
  const [bettersFromEvt, setBettersFromEvt] = useState<string[]>([]);
  const [userResult, setUserResult] = useState<string>("noResult");

  const { data: signerData } = useSigner();
  const { address } = useAccount();

  // -------------------------------------------------------- CONTRACT GETTERS

  const cryptoBet = useContract({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    signerOrProvider: signerData,
  });

  const { data: contractBalance, isError, isLoading } = useBalance({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
  })

  const { data: cryptoBetOwner } = useContractRead({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    functionName: 'owner',
  });

  const { data: edftBalance } = useContractRead({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  const userBet = useContractRead({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    functionName: 'getOneBetter',
    args: [address],
  });

  const currentPriceFeed = useContractRead({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    functionName: 'currentPriceFeed',
    watch: true,
  });

  // -------------------------------------------------------- EVENTS LISTENERS

  useContractEvent({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    eventName: 'evt_nextRound',
    listener(node, label, owner) {
      // console.log("evt_nextRound", node, label, owner);
    },
  });

  useContractEvent({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    eventName: 'evt_betFinish',
    listener(node, label, owner) {
      //@ts-ignore
      if (owner.args.userAddr == address) {
        //@ts-ignore
        if (owner.args.result) {
          setUserResult("win");
        } else {
          setUserResult("los");
        }
      }
    },
  });

  useContractEvent({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    eventName: 'evt_newBet',
    listener(node, label, owner) {
      // console.log("evt_newBet", node, label, owner);
      // getBetters();
    },
  });

  // -------------------------------------------------------- EVENTS FETCHERS

  async function getLastRound() {
    if (!cryptoBet || !address) return;

    console.log('- TRY GET LAST ROUND -');
    try {
      const cryptoBetFilter = cryptoBet.filters.evt_nextRound();
      if (!cryptoBetFilter) return;
      const cryptoBetEvents = await cryptoBet.queryFilter(
        cryptoBetFilter
      );
      if (!cryptoBetEvents) return;

      return(cryptoBetEvents[cryptoBetEvents.length - 1])
      // cryptoBetEvents.map((elem) => {
      //   //@ts-ignore
      //   const roundTimestamp = elem.args.startedtAt.toNumber();
      //   console.log('round time stamp ', roundTimestamp)
      //   var roundDate = new Date(roundTimestamp);
      //   console.log('round', roundDate);
      // })
      // console.log("get rounds ", cryptoBetEvents);

      // const fetchedVoters = voterRegisteredEvents.map(
      //   (voter) => voter?.args?.voterAddress
      // ) as string[];

      // setVoters(fetchedVoters);
    } catch (error) {
      console.error(error);
    }
  }

  async function getBetters() {
    if (!cryptoBet) return;

    try {
      const cryptoBetFilter = cryptoBet.filters.evt_newBet();
      if (!cryptoBetFilter) return;
      const cryptoBetEvents = await cryptoBet.queryFilter(
        cryptoBetFilter
      );
      if (!cryptoBetEvents) return;

      console.log("betters", cryptoBetEvents);

      let bettersArray = cryptoBetEvents.map((elem) => {
        //@ts-ignore
        return elem.args.userAddr;
      })
      setBettersFromEvt(bettersArray);
      // console.log("rounds array ", bettersArray);

      // const fetchedVoters = voterRegisteredEvents.map(
      //   (voter) => voter?.args?.voterAddress
      // ) as string[];

      // setVoters(fetchedVoters);
    } catch (error) {
      console.error(error);
    }
  }

  // -------------------------------------------------------- FUNCTIONS

  const getUserStatus = async () => {
    console.log("test owner");
    console.log(cryptoBetOwner);
    console.log(address);
    if (cryptoBetOwner === address) {
      setUserStatus('owner');
    }
  };

  const handleNextRound = async () => {
    console.log('NEXT ROUND FORCE');
    if (cryptoBet) {
      await cryptoBet.nextRound(); 
    }
  };

  const handleRegisterBet = async (expectation: number, isToken: boolean) => {
    console.log('REGISTER BET (up)');
    let response;
    if ((expectation === 1 || expectation === 2) && cryptoBet) {
      if (isToken) {
        response = await cryptoBet.registerBetErc20(expectation);
      } else {
        response = await cryptoBet.registerBet(expectation, { value: ethers.utils.parseEther(BET_VALUE) });
      }
    }

    return response;
  };

  const handleClaimReward = async () => {
    console.log('CLAIM BET REWARD');
    let response;
    if (cryptoBet) {
      response = await cryptoBet.claimBet();
    }
    return response;
  };

  const handleMintEdft = async () => {
    console.log('MINT EDFT');
    let response;
    if (cryptoBet) {
      response = await cryptoBet.mintEDFT();
    }
    return response;
  };

  // -------------------------------------------------------- FUNCTIONS

  // trigger functions
  useEffect(() => {
    getUserStatus();
  }, [address]);

  // trigger event readers
  useEffect(() => {
    // getBetters();
  }, [address]);

  return {
    address,
    contractBalance,
    edftBalance,
    userStatus,
    userBet,
    userResult,
    currentPriceFeed,
    handleNextRound,
    handleRegisterBet,
    getLastRound,
    handleClaimReward,
    handleMintEdft,
    bettersFromEvt
  }
};
