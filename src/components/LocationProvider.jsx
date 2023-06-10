import { createContext, useState } from "react"; 

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(
        {
            "id": "place.77809900",
            "type": "Feature",
            "relevance": 1,
            "place_name": "Cupertino, California, United States",
            "bbox": [
                -122.15257,
                37.26471,
                -121.995462,
                37.340627
            ],
            "center": [
                -122.03229,
                37.322893
            ],
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -122.03229,
                    37.322893
                ]
            },
            
        }
    );
    
    return (
        <LocationContext.Provider value={[location, setLocation]}>
            {children}
        </LocationContext.Provider>
    );
}

export default LocationProvider;

