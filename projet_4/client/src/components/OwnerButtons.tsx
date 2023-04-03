import { useAccount } from 'wagmi';
import { useCryptoBet } from '../hooks/useCryptoBet';

function OwnerButtons() {
  const { isConnected } = useAccount();
  const { handleNextRound, handleRegisterBet, getLastRound } = useCryptoBet();

  return (
    <div className="navbar flex flex-col bg-[#2F2C2C] py-5">
      <div className='pb-3'>
        Espace propiétaire
      </div>
      <div className='flex gap-5'>
        <button
          className="btn btn-error"
          onClick={handleNextRound}
        >force next round</button>
        <button
          className="btn btn-error"
          onClick={handleRegisterBet}
        >register bet</button>
        <button
          className="btn btn-error"
          onClick={getLastRound}
        >get last round</button>
      </div>
    </div>
  );
}

export default OwnerButtons;
