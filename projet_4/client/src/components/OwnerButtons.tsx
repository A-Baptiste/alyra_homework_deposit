import { useState } from 'react';
import { useCryptoBet } from '../hooks/useCryptoBet';
import { toast } from 'react-toastify';

function OwnerButtons() {
  const { handleNextRound, contractBalance, userStatus, handleDrainFund } = useCryptoBet();

  console.log("contractBalance", contractBalance);
  const [inputValue, setInputValue] = useState<number>();

  const handleDrainFundCard = async (value: number) => {
    try {
      await handleDrainFund(value);
      toast.success("Valeur extraite !");
    } catch(err) {
      console.log("error", err);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col bg-[#2F2C2C] gap-3">
      {userStatus === "owner" &&
      <>
        <div className='text-lg font-bold mt-3'>
          Espace propiétaire
        </div>
        <div className='flex justify-center items-center gap-5 mb-3'>
          <span className="flex flex-col items-center w-52">
            <span>Balance du contrat</span>
            <div>
            <b className='text-primary'>
              {contractBalance ? contractBalance.formatted : "0"}
            </b>
            &nbsp;ETH
            </div>
          </span>
          <div className='flex flex-col w-52'>
            <input
              className='input input-bordered input-primary input-sm'
              type="number"
              placeholder='en ETH'
              value={inputValue}
              onChange={(e) => setInputValue(parseInt(e.currentTarget.value))}
            />
            <button
              className="btn btn-primary btn-sm"
              disabled={inputValue ? false : true}
              //@ts-ignore
              onClick={() => handleDrainFundCard(inputValue)}
            >Extraire</button>
          </div>
          <button
            className="btn btn-error btn-sm mb-3 w-52"
            onClick={handleNextRound}
          >
            demo: force next round
          </button>
        </div>
      </>
      }
    </div>
  );
}

export default OwnerButtons;
