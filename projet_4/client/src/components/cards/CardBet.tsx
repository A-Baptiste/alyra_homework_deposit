import { useAccount } from 'wagmi';
import { useCryptoBet } from '../../hooks/useCryptoBet';

function CardBet() {
  const { isConnected } = useAccount();
  const { handleNextRound, handleRegisterBet, getLastRound } = useCryptoBet();

  const hasBetted = false;
  const betValue = "0,000000000000000010";

  return (
    <div className="card w-96 shadow-xl bg-[#2F2C2C]">
      <div className="card-body">
        <h2 className="card-title">Pariez !</h2>
        <div className='card bg-base-100 h-full'>
          <div className="card-body flex flex-col items-center  justify-center">
            <div className='mb-5 flex flex-col items-center'>
              <div>Mise obligatoire :</div>
              <div className='text-primary'>{betValue} ETH</div>
            </div>
            {hasBetted ? (
              <div className='h-full text-primary font-bold text-center'>
                Vous avec parié pour cette session !
              </div>
            ) : (
              <>
                <button className='btn btn-primary w-full'>
                  Parier a la hausse
                </button>
                <button className='btn btn-error w-full'>
                  Parier a la baisse
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardBet;
