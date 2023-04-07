import { useCryptoBet } from '../hooks/useCryptoBet';
import { getStringBalanceFromBigNumber } from '../utils/balances';

function BetBalances() {
  const { betBalanceEth, betBalanceEdft } = useCryptoBet();

  return (
    <div className="flex flex-col items-center justify-center mb-5">
      <div className='font-bold'>Actuellement en jeu</div>
      <div className='flex gap-5'>
        <div className="text-2xl">
          <b className='text-primary'>
            {betBalanceEth.data ? getStringBalanceFromBigNumber(betBalanceEth.data) : "0"}
          </b>
          &nbsp;ETH
        </div>
        <div className="text-2xl">
          <b className='text-primary'>
            {betBalanceEdft.data ? betBalanceEdft.data.toString() : "0"}
          </b>
          &nbsp;EDFT
        </div>
      </div>
    </div>
  );
}

export default BetBalances;
