import { useState } from 'react'
import reactLogo from './assets/react.svg'
import bgImage from './assets/background.png'
import viteLogo from '/vite.svg'
import './App.css'
import SelectionInterface from './components/SelectionInterface';
import Header from './components/Header';
import { LocationProvider } from './components/LocationProvider';
import InputChoices from "./components/InputChoices"
import { FeaturesProvider } from './components/FeaturesProvider';
import {MantineProvider} from "@mantine/core"
import { Analytics } from '@vercel/analytics/react';

/*
      <MantineProvider theme={{ colorScheme: 'dark' }}>
*/

function App() {

  return (
    <div className="App">
      <FeaturesProvider>
      <LocationProvider>
        <Analytics />
        <Header />
        <InputChoices />
        <SelectionInterface />
      </LocationProvider>
      </FeaturesProvider>
    </div>
  )
}

export default App
