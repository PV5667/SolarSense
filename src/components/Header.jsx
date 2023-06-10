import {Box, Center, Title} from "@mantine/core"
import SearchBar from './SearchBar';


const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicHY1NjY3IiwiYSI6ImNsZGFtOHVoejBiZ2Mzb3A2djgyaDl1OGEifQ.FSssERk7wLiG1fDpen0iXA';

function Header() {
    return (
        <div class="relative isolate px-6 pt-14 lg:px-8">
            <div class="mx-auto max-w-2xl py-32 sm:py-80 lg:py-56 space-y-4">
                <div class="text-center">
                    <h1 class="text-4xl font-bold text-white sm:text-8xl">SolarSense</h1>
                </div>
                <SearchBar /> 
            </div>
        </div>
    
    );
}

export default Header;