import { useState } from 'react'
import NavBar from './components/NavBar'
import Timer from './components/Timer'
import OwnerButtons from './components/OwnerButtons';
import BetCard from './components/BetCards';
import SwitchMoney from './components/SwitchMoney';

function App() {
  const [useToken, setUseToken] = useState<boolean>(false);

  return (
    <div>
     <NavBar />
     <Timer />
     <SwitchMoney changeUseToken={setUseToken}/>
     <BetCard useToken={useToken} />
     <OwnerButtons />
    </div>
  )
}

export default App
