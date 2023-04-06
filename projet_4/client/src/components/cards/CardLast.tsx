import { useAccount } from 'wagmi';
import { useCryptoBet } from '../../hooks/useCryptoBet';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getPriceFeedInDollar } from '../../utils/balances';
import { BigNumber } from 'ethers';

interface Props {
  useToken: boolean;
}

interface ResultData {
  lastWinnersETH: string;
  lastWinnersEDFT: string;
  lastLosersETH: string;
  lastLosersEDFT: string;
}

function CardLast({ useToken }: Props) {
  const { address, userBet, userResult, handleClaimReward, getLastRound} = useCryptoBet();
  const [hasFinish, setHasFinish] = useState<string>("unknow");
  const [lastPriceFeed, setLastPriceFeed] = useState<BigNumber>();
  const [resultData, setResultData] = useState<ResultData>({
    lastWinnersETH: "-",
    lastWinnersEDFT: "-",
    lastLosersETH: "-",
    lastLosersEDFT: "-",
  });

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
  }, [userBet])

  useEffect(() => {
    if (userResult === "win") {
      setHasFinish("reward");
    }
    if (userResult === "los") {
      setHasFinish("loose");
    }
  }, [userResult])

  useEffect(() => {
    handleLastRoundData();
  })

  const handleLastRoundData = async () => {
    //@ts-ignore
    const response = await getLastRound();
    console.log("last round ", response);
    if (response && response.args?.newPriceFeed.toString() != lastPriceFeed) {
      setResultData({
        lastWinnersETH: response.args?.winners.toString(),
        lastWinnersEDFT: response.args?.winnersErc20.toString(),
        lastLosersETH: response.args?.loosers.toString(),
        lastLosersEDFT: response.args?.loosersErc20.toString(),
      })
      console.log("pf", response.args?.newPriceFeed);
      setLastPriceFeed(response.args?.newPriceFeed);
    }
  };

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
            <div className='text-3xl text-primary font-bold'>
              $ {getPriceFeedInDollar(lastPriceFeed)}
            </div>
            <div className='grid grid-cols-4 gap-1 w-full'>
                <div className='text-sm'>ETH</div>
                <div className="badge badge-success badge-outline gap-2">
                  {resultData?.lastWinnersETH}
                </div>
                <div className="badge badge-error badge-outline gap-2">
                  {resultData?.lastLosersETH}
                </div>
                <div className="badge badge-outline gap-2">
                  {resultData?.lastWinnersETH !== "-" ?
                    parseInt(resultData?.lastWinnersETH) + parseInt(resultData?.lastLosersETH)
                    :
                    "-"
                  }
                </div>
                <div className='text-sm'>EDFT</div>
                <div className="badge badge-success badge-outline gap-2">
                  {resultData?.lastWinnersEDFT}
                </div>
                <div className="badge badge-error badge-outline gap-2">
                  {resultData?.lastLosersEDFT}
                </div>
                <div className="badge badge-outline gap-2">
                  {resultData?.lastWinnersEDFT !== "-" ?
                    parseInt(resultData?.lastWinnersEDFT) + parseInt(resultData?.lastLosersEDFT)
                    :
                    "-"
                  }
                </div>
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
