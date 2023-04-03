import { useAccount } from 'wagmi';
import { useCryptoBet } from '../hooks/useCryptoBet';
import CardLast from './cards/CardLast';
import CardInfo from './cards/CardInfo';
import CardBet from './cards/CardBet';

function BetCards() {
  const { isConnected } = useAccount();
  const { handleNextRound, handleRegisterBet, getLastRound } = useCryptoBet();

  return (
    <div className="flex justify-center gap-5 mb-5">
      <CardLast />
      <CardInfo />
      <CardBet />
    </div>
  );
}

export default BetCards;
