import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { useCryptoBet } from '../hooks/useCryptoBet';
import { useEffect, useState } from 'react';
import { getStringBalanceFromBigNumber } from '../utils/balances';
import { toast } from 'react-toastify';

interface Props {
  changeUseToken: (x: boolean) => void;
}

function SwitchMoney({ changeUseToken }: Props) {
  const { address, edftBalance, handleMintEdft } = useCryptoBet();
  const [balance, setBalance] = useState<number>(0);
  const [tab, setTab] = useState<number>(0);

  useEffect(() => {
    if (edftBalance) {
      console.log('edft balance', edftBalance.toString())
      setBalance(getStringBalanceFromBigNumber(edftBalance));
    }
  }, [edftBalance])
  
  useEffect(() => {
    if (tab == 0) { changeUseToken(false) };
    if (tab == 1) { changeUseToken(true) };
  }, [tab])

  const handleMintEdftCard = async () => {
    if (getStringBalanceFromBigNumber(edftBalance) > 29) {
      toast.error(`Vous avez trop d'EDFT`);
      return;
    }
    const response = await handleMintEdft();
    await response.wait();
    console.log("response mint ", response);
    toast.success(`Vos 30 EDFT on été envoyés !`);
    setBalance(balance ? balance + 30 : 30);
  };

  return (
    <div className="flex justify-between items-center mb-5">
      <div className="w-full flex justify-end">
        <button
          className={`btn btn-primary btn-sm ${(tab === 0 || !address) && "opacity-0"}`}
          disabled={tab === 0 || !address}
          onClick={handleMintEdftCard}
        >
          Mint 30 EDFT
        </button>
      </div>
      <div className="w-full flex justify-center">
        <div className="tabs tabs-boxed bg-[#2F2C2C]">
          <a
            className={`tab ${tab === 0 && "tab-active"} ${!address && "pointer-events-none tab-disabled"}`}
            onClick={() => setTab(0)}
          >
            Jouer avec ETH
          </a> 
          <a
            className={`tab ${tab === 1 && "tab-active"} ${!address && "pointer-events-none tab-disabled"}`}
            onClick={() => setTab(1)}
          >
            Jouer avec EDFT
          </a> 
        </div>
      </div>
      
      <span className={`w-full transition ${(tab === 0 || !address) && "opacity-0"}`}>
        <b className='text-primary'>{balance ? balance : "0"}</b> EDFT
      </span>
    </div>
  );
}

export default SwitchMoney;
