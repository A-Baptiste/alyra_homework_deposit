import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useCryptoBet } from '../hooks/useCryptoBet';

function NavBar() {
  const { isConnected } = useAccount();
  const { userStatus } = useCryptoBet();

  return (
    <div className="navbar flex justify-between bg-[#2F2C2C]">
      <span className='text-primary font-bold text-2xl border px-3 py-1 border-primary rounded-full'>
        EASYDAPP
      </span>
      <div className="flex flex-col items-end">
        <div className="flex flex-col items-center">
          <ConnectButton />
          {isConnected ? (
            <span className='text-primary font-bold'>
              Bonjour ! Vous êtes {userStatus} !
            </span>
          ) : (
            <span className='text-primary font-bold'>
              Connectez votre wallet !
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
