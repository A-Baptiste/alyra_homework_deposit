import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='flex justify-center border'>
      test bonjour
      <button className="btn btn-primary">Button</button>
    </div>
  )
}

export default App
