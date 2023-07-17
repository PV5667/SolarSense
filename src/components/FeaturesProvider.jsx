import { createContext, useState } from "react"; 

export const FeaturesContext = createContext();

export const FeaturesProvider = ({ children }) => {
    const [features, setFeatures] = useState({
        type: "FeatureCollection",
        features: []//panels.features,
      });
    
    return (
        <FeaturesContext.Provider value={[features, setFeatures]}>
            {children}
        </FeaturesContext.Provider>
    );
}

export default FeaturesProvider;

