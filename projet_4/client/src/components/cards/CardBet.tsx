import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useCryptoBet } from '../../hooks/useCryptoBet';
import { toast } from 'react-toastify';

interface Props {
  useToken: boolean;
};

function CardBet({ useToken }: Props) {
  const { address, handleRegisterBet, userBet } = useCryptoBet();
  const [status,  setStatus] = useState<string>("log");

  const handleRegisterBetFromCard = async (expectation: number) => {
    const response = await handleRegisterBet(expectation, useToken)
    await response.wait();
    console.log("register set !")
    toast.success(`Bet ${expectation === 1 ? "DOWN" : "UP"} registered !`);
    setStatus("betted");
  };

  const handleChangeStatus = () => {
    console.log(userBet.data);
    // @ts-ignore
    if (address && status === "log") {
      setStatus("canBet")
    }
    // @ts-ignore
    if (userBet && userBet.data && userBet.data.betStatus !== 0) {
      setStatus("betted")
    }
  };

  useEffect(() => {
    handleChangeStatus();
  }, [address]);

  useEffect(() => {
    
  }, [address, userBet]);

  return (
    <div className="card w-96 shadow-xl bg-[#2F2C2C]">
      <div className="card-body">
        <h2 className="card-title">Pariez !</h2>
        <div className='card bg-base-100 h-full'>
          <div className="card-body flex flex-col items-center  justify-center">
            { status === "log" && 
              <div className='h-full flex items-center text-error font-bold text-center'>
                Veuillez connecter votre wallet !
              </div>
            }
            { status === "betted" && 
              <div className='h-full flex items-center text-primary font-bold text-center'>
                Vous avec parié pour cette session !
              </div>
            }
            { status === "canBet" && 
              <>
                <button
                  className='btn btn-primary w-full'
                  onClick={() => handleRegisterBetFromCard(2)}
                >
                  Parier a la hausse
                </button>
                <button
                  className='btn btn-error w-full'
                  onClick={() => handleRegisterBetFromCard(1)}
                >
                  Parier a la baisse
                </button>
              </>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardBet;
function usEffect(arg0: () => void, arg1: (`0x${string}` | undefined)[]) {
  throw new Error('Function not implemented.');
}

