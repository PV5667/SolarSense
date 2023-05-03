import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SelectionInterface from './components/SelectionInterface';


function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
    <SelectionInterface />
    </div>
  )
}

export default App
