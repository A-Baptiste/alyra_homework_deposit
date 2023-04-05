import { useAccount } from 'wagmi';
import { useCryptoBet } from '../../hooks/useCryptoBet';
import { getPriceFeedInDollar } from '../../utils/balances';

interface Props {
  useToken: boolean;
}

function CardInfo({ useToken }: Props) {
  const { currentPriceFeed } = useCryptoBet();
  console.log("cpf ", getPriceFeedInDollar(currentPriceFeed));
  const betValue = "10";

  return (
    <div className="card w-96 shadow-xl bg-[#2F2C2C]">
      <div className="card-body">
        <h2 className="card-title">Session actuelle</h2>
        <div className='card bg-base-100 h-full'>
          <div className="card-body flex flex-col items-center justify-center">
            <div className='mb-5'>Pari en cours ...</div>
            <div className='text-3xl text-primary font-bold'>
              $ {getPriceFeedInDollar(currentPriceFeed)}
            </div>
            <div className='mt-5 flex flex-col items-center'>
              <div>Mise obligatoire :</div>
              {useToken ?
                <div className='text-primary'>{10} EDFT</div>
              :
                <div className='text-primary'>{betValue} Wei</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardInfo;
