import { useAccount } from 'wagmi';
import { useCryptoBet } from '../../hooks/useCryptoBet';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  useToken: boolean;
}

function CardLast({ useToken }: Props) {
  const { userBet, userResult, handleClaimReward } = useCryptoBet();
  const [hasFinish, setHasFinish] = useState<string>("unknow");

  useEffect(() => {
    if ( userBet && userBet.data && hasFinish !== "claimed" ) {
      //@ts-ignore
      if (userBet.data.betStatus == 3) {
        setHasFinish("reward");
      }
      //@ts-ignore
      if (userBet.data.betStatus == 2) {
        setHasFinish("loose");
      }
    }
  }, [userBet, userResult])

  useEffect(() => {
    if (userResult === "win") {
      setHasFinish("reward");
    }
    if (userResult === "los") {
      setHasFinish("loose");
    }
  }, [userResult])

  const handleClaimBetFromCard = async () => {
    const response = await handleClaimReward();
    await response.wait();
    console.log("claim finish")
    if (hasFinish === "loose") {
      toast.success("Pari terminé, rejouez !");
    }
    if (hasFinish === "reward") {
      toast.success("Récompense distribuée !");
    }
    setHasFinish("claimed");
  };

  return (
    <div className="card w-96 shadow-xl bg-[#2F2C2C]">
      <div className="card-body">
        <h2 className="card-title">Session précedente</h2>
        <div className='card bg-base-100 h-full'>
          <div className="card-body flex flex-col gap-5 items-center justify-center">
            <div>Résultats</div>
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
            {hasFinish === "reward" && (
              <button
                className='btn btn-primary w-full mt-5'
                onClick={handleClaimBetFromCard}
              >
                GAGNÉ: Réclamez vos gains
              </button>
            )}
            {hasFinish === "loose" && (
              <button
                className='btn btn-error w-full mt-5'
                onClick={handleClaimBetFromCard}
              >
                PERDU: Terminer le pari
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardLast;
