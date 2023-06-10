import Map from "./Map";
import { useContext } from "react";
import MapButtons from "./MapButtons";
import SearchBar from "./SearchBar";
import { LocationContext, LocationProvider } from "./LocationProvider";

function SelectionInterface () {
  const location = useContext(LocationContext);
  const filteredLocation = location[0]
  console.log("SelectionInterface location: ", filteredLocation);
  return (
    <div>
        <Map />
    </div>
  );
}

export default SelectionInterface;