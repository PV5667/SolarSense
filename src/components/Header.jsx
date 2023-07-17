import {Box, Center, Title} from "@mantine/core"
import SearchBar from './SearchBar';
import { Image } from '@mantine/core';
import { TypeAnimation } from 'react-type-animation';
import { LinearGradient } from 'react-text-gradients'


const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicHY1NjY3IiwiYSI6ImNsZGFtOHVoejBiZ2Mzb3A2djgyaDl1OGEifQ.FSssERk7wLiG1fDpen0iXA';

/*
<div class="text-center">
    <h1 class="text-4xl font-bold text-white sm:text-8xl">SolarSense</h1>
</div>
*/

function Header() {
    return (
        <div>
        <nav class="rounded-xl border-gray-200 px-4 lg:px-6 py-8 bg-neutral-950">
        <a href="/">
        <Image fit="contain" height={60} src="./src/assets/SolarSense_Logo.png" />
        </a>
        </nav>
        <div class="mx-auto max-w-2xl py-6 pt-25 space-y-4">
        <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        'Unlock Solar Panel Insights with Geospatial AI',
        1000
      ]}
      wrapper="span"
      speed={37}
      style={{ fontWeight:"bold", fontSize: '45px', display: 'inline-block', color: "#e8caf1"}}
      repeat={0}
    />
        </div>
        </div>
    );
}

export default Header;