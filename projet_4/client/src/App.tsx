import { useState } from 'react'
import NavBar from './components/NavBar'
import Timer from './components/Timer'
import OwnerButtons from './components/OwnerButtons';
import BetCard from './components/BetCards';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
     <NavBar />
     <Timer />
     <BetCard />
     <OwnerButtons />
    </div>
  )
}

export default App
