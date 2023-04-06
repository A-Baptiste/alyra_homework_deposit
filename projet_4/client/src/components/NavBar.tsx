import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useCryptoBet } from '../hooks/useCryptoBet';
import logo from '../assets/logo.png';

function NavBar() {
  const { isConnected } = useAccount();
  const { userStatus } = useCryptoBet();

  const getUserStatus = () => {
    if (userStatus === "owner") { return "propriétaire"}
    return "invité(e)";
  };

  return (
    <div className="navbar flex justify-between bg-[#333333]">
      <button className='btn font-bold text-2xl'>
        easy<div className='text-primary'>dapp</div>
      </button>
      {/* <img className="h-16 w-16" src={logo} alt="school logo" /> */}
      <div className="flex flex-col items-end">
        <div className="flex flex-col items-center">
          <ConnectButton />
          {isConnected ? (
            <span className='font-bold flex'>
              Bonjour ! Vous êtes&nbsp;<div className='text-primary'>{getUserStatus()}</div>&nbsp;!
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
