import {Box, Center, Title} from "@mantine/core"
import SearchBar from './SearchBar';
import { Image, Text } from '@mantine/core';
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
        <nav class="rounded-xl px-4 lg:px-6 py-8">
        <a href="/">
        <Image fit="contain" height={60} src={"./SolarSense_Logo.png"} />
        </a>
        </nav>
        <div class="mx-auto max-w-2xl py-6 pt-25 space-y-4">
        <Text style={{ fontWeight:"bold", fontSize: '45px', display: 'inline-block', color: "#e8caf1"}}>Unlock Solar Panel Insights with Geospatial AI</Text>
        </div>
        </div>
    );
}

export default Header;