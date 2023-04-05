import { useEffect, useState } from 'react';
import { useAccount, useBalance, useContractEvent, useContractRead } from 'wagmi';
import { useContract, useSigner } from 'wagmi';
import artifact from '../contracts/CryptoBet.json';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

const BET_VALUE = "0.000000000000000010" // 10 wei

export function useCryptoBet() {
  const [userStatus, setUserStatus] = useState<string>("guest");

  const { data: signerData } = useSigner();
  const { address } = useAccount();

    // -------------------------------------------------------- CONTRACT GETTERS

  const cryptoBet = useContract({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    signerOrProvider: signerData,
  });

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

  // -------------------------------------------------------- EVENTS LISTENERS

  useContractEvent({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    eventName: 'evt_nextRound',
    listener(node, label, owner) {
      console.log("evt_nextRound", node, label, owner);
    },
  });

  useContractEvent({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    eventName: 'evt_betFinish',
    listener(node, label, owner) {
      console.log("evt_betFinish", node, label, owner);
    },
  });

  // -------------------------------------------------------- EVENTS FETCHERS

  async function getLastRound() {
    if (!cryptoBet) return;

    try {
      const cryptoBetFilter = cryptoBet.filters.evt_nextRound();
      if (!cryptoBetFilter) return;
      const cryptoBetEvents = await cryptoBet.queryFilter(
        cryptoBetFilter
      );
      if (!cryptoBetEvents) return;

      cryptoBetEvents.map((elem) => {
        //@ts-ignore
        const roundTimestamp = elem.args.startedtAt.toNumber();
        console.log('round time stamp ', roundTimestamp)
        var roundDate = new Date(roundTimestamp);
        console.log('round', roundDate);
      })
      // console.log("get rounds ", cryptoBetEvents);

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
    // console.log('user status test');
    // console.log(cryptoBetOwner)
    // console.log(address)
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

  const handleRegisterBet = async () => {
    console.log('REGISTER BET (up)');
    if (cryptoBet) {
      await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });

      // const result = cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
    }
  };

  useEffect(() => {
    getUserStatus();
  }, [address]);

  return {
    address,
    edftBalance,
    userStatus,
    handleNextRound,
    handleRegisterBet,
    getLastRound
  }
};
