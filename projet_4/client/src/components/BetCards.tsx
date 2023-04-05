import { useAccount } from 'wagmi';
import { useCryptoBet } from '../hooks/useCryptoBet';
import CardLast from './cards/CardLast';
import CardInfo from './cards/CardInfo';
import CardBet from './cards/CardBet';

interface Props {
  useToken: boolean;
};

function BetCards({ useToken }: Props) {
  const { isConnected } = useAccount();
  const { handleNextRound, handleRegisterBet, getLastRound } = useCryptoBet();

  return (
  <>
    <div>
      {useToken ?
        <div>Play with edft</div>
        :
        <div>Play with eth</div>
      }
    </div>
    <div className="flex justify-center gap-5 mb-5">
      <CardLast />
      <CardInfo />
      <CardBet />
    </div>
  </>
  );
}

export default BetCards;
