import { useState } from 'react'
import NavBar from './components/NavBar'
import Timer from './components/Timer'
import OwnerButtons from './components/OwnerButtons';
import BetCard from './components/BetCards';
import SwitchMoney from './components/SwitchMoney';
import { ToastContainer } from 'react-toastify';
import BetBalances from './components/BetBalances';

function App() {
  const [useToken, setUseToken] = useState<boolean>(false);

  return (
    <div>
     <NavBar />
     <Timer />
     <SwitchMoney changeUseToken={setUseToken}/>
     <BetCard useToken={useToken} />
     <BetBalances />
     <OwnerButtons />
     <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default App
