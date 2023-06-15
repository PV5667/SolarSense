import React, { useEffect, useRef, useState, useContext } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
//import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import "/src/geocoder.css";
import { LocationContext } from './LocationProvider';

mapboxgl.accessToken = 'pk.eyJ1IjoicHY1NjY3IiwiYSI6ImNsZGFtOHVoejBiZ2Mzb3A2djgyaDl1OGEifQ.FSssERk7wLiG1fDpen0iXA';

function SearchBar ()  {
    const geocoderRef = useRef(null);
    const [location, setLocation] = useContext(LocationContext);
    useEffect(() => {
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            types: 'country,region,place,postcode,locality,neighborhood,address,poi',
            placeholder: 'Type in an area of interest to get started.',
          });
        if (geocoderRef.current) {
            geocoder.addTo(geocoderRef.current);
        }
        geocoder.on('result', (e) => {
            setLocation(e.result);
            console.log(e.result);
            });
             
        geocoder.on('clear', () => {
            //setLocation();
            });            
    }, []);
    
  return (
    <div>
      <div ref={geocoderRef}></div>
    </div>
  );
};

export default SearchBar;
