import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useCryptoBet } from '../hooks/useCryptoBet';
import { useEffect, useState } from 'react';

function Timer() {
  const { isConnected } = useAccount();
  const { userStatus } = useCryptoBet();

  const currentDate = new Date();
  const TIME = 60;

  useEffect(() => {
    const h = currentDate.getUTCHours()
    const m = currentDate.getUTCMinutes()
    const s = currentDate.getUTCSeconds()
    let dayQuater = -1;

    if (h >= 0 && h < 6) { dayQuater = 6 }
    if (h >= 6 && h < 12) { dayQuater = 12 }
    if (h >= 12 && h < 18) { dayQuater = 18 }
    if (h >= 18 && h < 24) { dayQuater = 24 }

    if (dayQuater != -1) {
      console.log('Remaining time : ', (dayQuater - h) - 1, (TIME - m) - 1, (TIME - s) - 1);
      setHours((dayQuater - h) - 1);
      setMinutes((TIME - m) - 1);
      setSecond((TIME - s) - 1);
    }
  }, [])

  const [hours, setHours] = useState<number>(currentDate.getUTCHours());
  const [minutes, setMinutes] = useState<number>(currentDate.getUTCMinutes());
  const [second, setSecond] = useState<number>(currentDate.getUTCSeconds());

  useEffect(() => {
    if (hours < 0) {return}
    setTimeout(() => {
      if (second > 1) {
        setSecond(second - 1);
      } else {
        if (minutes > 1) {
          setSecond(59);
          setMinutes(minutes - 1);
        } else {
          setSecond(59);
          setMinutes(59);
          setHours(hours - 1);
        }
      }
    }, 1000);
  }, [second]);
  

  return (
    <div className="flex flex-col items-center gap-1 my-5">
      <div className='font-bold'>
        Temps restant avant le prochain round
      </div>
      {hours < 0 ? (
        <div className='flex text-xl font-bold gap-5'>
          <div className='text-primary animate-spin h-7 w-7 border-t border-b border-primary rounded-full' />
          Calculs en cours
        </div>
      ) : (
        <div className='flex justify-center gap-5'>
          <div className='flex flex-col items-center'>
            <div className='text-4xl'>{hours}</div>
            <div className='text-primary'>heures</div>
          </div>
          <div className='flex flex-col items-center'>
            <div className='text-4xl'>{minutes}</div>
            <div className='text-primary'>minutes</div>
          </div>
          <div className='flex flex-col items-center'>
            <div className='text-4xl'>{second}</div>
            <div className='text-primary'>secondes</div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default Timer;
