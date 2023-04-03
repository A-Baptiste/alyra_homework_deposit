import { useEffect, useState } from 'react';
import { useAccount, useContractEvent, useContractRead } from 'wagmi';
import { useContract, useSigner } from 'wagmi';
import artifact from '../contracts/CryptoBet.json';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

export function useCryptoBet() {
  const [userStatus, setUserStatus] = useState<string>("guest");

  const { data: signerData } = useSigner();
  const { address } = useAccount();

  const cryptoBet = useContract({
    address: import.meta.env.VITE_CRYPTOBET_ADDR,
    abi: artifact.abi,
    signerOrProvider: signerData,
  });

  const { data: votingOwner } = useContractRead({
    address: import.meta.env.VITE_VOTING_ADDR,
    abi: artifact.abi,
    functionName: 'owner',
  });

  const getUserStatus = async () => {
    if (votingOwner === address) {
      setUserStatus('owner');
    }
  };

  useEffect(() => {
    getUserStatus();
  }, [address]);

  return { address, userStatus }
};
