import { useAccount } from 'wagmi';
import { useCryptoBet } from '../../hooks/useCryptoBet';

function CardLast() {
  const { isConnected } = useAccount();
  const { handleNextRound, handleRegisterBet, getLastRound } = useCryptoBet();

  const hasReward = false;

  return (
    <div className="card w-96 shadow-xl bg-[#2F2C2C]">
      <div className="card-body">
        <h2 className="card-title">Session précedente</h2>
        <div className='card bg-base-100 h-full'>
          <div className="card-body flex flex-col gap-5 items-center justify-center">
            <div className='mb-5'>Résultats</div>
            <div className='flex gap-5'>
              <div className='flex flex-col items-center'>
                <div className='text-sm'>Gagnants</div>
                <div className="badge badge-success badge-outline gap-2">
                  12
                </div>
              </div>
              <div className='flex flex-col items-center'>
                <div className='text-sm'>Perdants</div>
                <div className="badge badge-error badge-outline gap-2">
                  32
                </div>
              </div>
            </div>
            <div className='text-3xl text-primary font-bold'>
              $ 1 923.347
            </div>
            {hasReward && (
              <button className='btn btn-primary w-full mt-5'>
                Réclamer vos gains
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardLast;
