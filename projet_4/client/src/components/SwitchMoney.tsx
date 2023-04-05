import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { useCryptoBet } from '../hooks/useCryptoBet';
import { useEffect, useState } from 'react';
import { getStringBalanceFromBigNumber } from '../utils/balances';

interface Props {
  changeUseToken: (x: boolean) => void;
}

function SwitchMoney({ changeUseToken }: Props) {
  const { edftBalance } = useCryptoBet();
  const [balance, setBalance] = useState<number>(0);
  const [tab, setTab] = useState<number>(0);

  useEffect(() => {
    if (edftBalance) {
      setBalance(getStringBalanceFromBigNumber(edftBalance));
    }
  }, [edftBalance])
  
  useEffect(() => {
    if (tab == 0) { changeUseToken(false) };
    if (tab == 1) { changeUseToken(true) };
  }, [tab])


  return (
    <div className="flex justify-between items-center mb-5">
      <div className="w-full"/>
      <div className="w-full flex justify-center">
        <div className="tabs tabs-boxed bg-[#2F2C2C]">
          <a
            className={`tab ${tab === 0 && "tab-active"}`}
            onClick={() => setTab(0)}
          >
            Jouer avec ETH
          </a> 
          <a
            className={`tab ${tab === 1 && "tab-active"}`}
            onClick={() => setTab(1)}
          >
            Jouer avec EDFT
          </a> 
        </div>
      </div>
      
      <div className={`w-full ${tab === 0 && "opacity-0"}`}>
        {balance} EDFT
      </div>
    </div>
  );
}

export default SwitchMoney;
