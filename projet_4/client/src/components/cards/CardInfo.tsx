import { useAccount } from 'wagmi';
import { useCryptoBet } from '../../hooks/useCryptoBet';

function CardInfo() {
  const { isConnected } = useAccount();
  const { handleNextRound, handleRegisterBet, getLastRound } = useCryptoBet();

  return (
    <div className="card w-96 shadow-xl bg-[#2F2C2C]">
      <div className="card-body">
        <h2 className="card-title">Session actuelle</h2>
        <div className='card bg-base-100 h-full'>
          <div className="card-body flex flex-col items-center justify-center">
            <div className='mb-5'>Pari en cours ...</div>
            <div className='text-3xl text-primary font-bold'>
              $ 1 879.567
            </div>
            <div className='flex gap-5 mt-5'>
              <div className="badge badge-success badge-outline	 gap-2">
                <span>&#8593;</span>
                12
              </div>
              <div className="badge badge-error badge-outline	 gap-2">
                <span>&#8595;</span>
                24
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardInfo;
