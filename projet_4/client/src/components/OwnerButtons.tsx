import { useCryptoBet } from '../hooks/useCryptoBet';

function OwnerButtons() {
  const { handleNextRound, contractBalance, userStatus } = useCryptoBet();

  console.log("contractBalance", contractBalance);

  return (
    <div className="flex justify-center items-center flex-col bg-[#2F2C2C] gap-3">
      {userStatus === "owner" &&
      <>
        <div className='text-lg font-bold mt-3'>
          Espace propiétaire
        </div>
        <span className="flex flex-col items-center">
          <span>Balance du contrat</span>
          <div>
          <b className='text-primary'>
            {contractBalance?.formatted}
          </b>
          &nbsp;ETH
          </div>
        </span>
        <div className='flex items-center gap-5'>
          <input
            className='input input-bordered input-primary input-sm'
            type="number"
            placeholder='00,0 ETH'
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => console.log("click")}
          >Transférer</button>
        </div>
        <button
          className="btn btn-error btn-sm mb-3"
          onClick={handleNextRound}
        >
          demo: force next round
        </button>
      </>
      }
    </div>
  );
}

export default OwnerButtons;
