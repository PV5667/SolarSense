import { useState } from 'react'
import reactLogo from './assets/react.svg'
import bgImage from './assets/background.png'
import viteLogo from '/vite.svg'
import './App.css'
import SelectionInterface from './components/SelectionInterface';
import Header from './components/Header';
import { LocationProvider } from './components/LocationProvider';

function App() {

  return (
    <div className="App">
      <LocationProvider>
        <Header />
        <SelectionInterface />
      </LocationProvider>
    </div>
  )
}

export default App
