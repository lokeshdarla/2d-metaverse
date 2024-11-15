import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BallGame from './ChatComponent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BallGame />
    </>
  )
}

export default App
