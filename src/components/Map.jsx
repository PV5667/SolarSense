
import React from 'react';
import { useState, useRef, useContext } from 'react';
import DeckGL from '@deck.gl/react';
import { Draw90DegreePolygonMode, DrawPolygonByDraggingMode, ViewMode, DrawRectangleUsingThreePointsMode, DrawRectangleMode } from '@nebula.gl/edit-modes';
import { EditableGeoJsonLayer} from '@nebula.gl/layers';
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers';
import StaticMap from 'react-map-gl';
import {Box, Button, Grid, Stack, Center, Title, Switch, Group, Loader} from "@mantine/core"
import { MapView, FlyToInterpolator } from '@deck.gl/core';
import { bboxPolygon, area, bbox, squareGrid } from '@turf/turf';
import * as fs from "fs";
import 'mapbox-gl/dist/mapbox-gl.css';
import {LocationContext} from './LocationProvider';


const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicHY1NjY3IiwiYSI6ImNsZGFtOHVoejBiZ2Mzb3A2djgyaDl1OGEifQ.FSssERk7wLiG1fDpen0iXA';

const INITIAL_VIEW_STATE = {
  longitude: -120.4265,
  latitude: 34.8670892225,
  zoom: 16,
  pitch: 0,
  bearing: 0,
};
function Map () {
  const [features, setFeatures] = useState({
    type: "FeatureCollection",
    features: []//panels.features,
  });
  const [analysisMode, setAnalysisMode] = useState(true);
  const [mode, setMode] = useState(() => DrawRectangleMode); 
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState(
    []
  );
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [panels, setPanels] = useState(
    []);
  const [numPanelsFound, setNumPanelsFound] = useState(0);
  const location = useContext(LocationContext)[0];
  console.log(location)
  const constructedViewState = {
    latitude: location["center"][1],
    longitude: location["center"][0],
    zoom: 14,
    pitch: 0,
    bearing: 0,
    transitionDuration: 5000,
    transitionInterpolator: new FlyToInterpolator()
}
  console.log("Map.jsx location: ", location);

  function submitSelection () {
    console.log("Inputted Selection:" + JSON.stringify(features));
    setAwaitingResponse(true);
    //http://127.0.0.1:5000/detect
    //https://flask-service.1ub7bv2ebr060.us-east-1.cs.amazonlightsail.com/detect
    fetch('http://127.0.0.1:5000/detect', {
      method : 'POST',
      headers : {
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify(
        features
      ),
  })
  .then(function (response){
      if(response.ok) {
        setAwaitingResponse(false);
          response.json()
          .then(function(response) {
              console.log(typeof(JSON.parse(response)));
              const newPanels = JSON.parse(response).features;
              setPanels(newPanels);
              setNumPanelsFound(newPanels.length);
              setFeatures({
                type: "FeatureCollection",
                features: []//panels.features,
              });
              console.log(newPanels);
              setMode(() => ViewMode);
              setAnalysisMode(false);
          });
      }
      else {
          console.log(response);
          throw Error('Something went wrong');
      }
  })
  }

  function calculateArea (features) {
    const sqm = area(features);
    const sqkm = (sqm / Math.pow(1000, 2)).toFixed(2);
    return sqkm;
  }
  
  const panelLayer = new PolygonLayer({
    id: "poly-layers",
    data: panels,
    pickable: true,
    filled: true,
    extruded: false,
    wireframe: true,
    getPolygon: d => d.geometry.coordinates,
    getFillColor: [255, 0, 0],
    _normalize: true,
  });
  

  const editableGjsonLayer = new EditableGeoJsonLayer({
    id: 'geojson-layer',
    data: features,
    mode: mode, 
    selectedFeatureIndexes: selectedFeatureIndexes,
    onEdit: ({ updatedData }) => {
      console.log(updatedData);
      const newData = squareGrid(bbox(updatedData), 0.12);
      console.log("New Data:")
      console.log(newData);
      setFeatures(newData);
    }
  });

  return (
    <>
    <div>
      <Center>
      <Stack spacing="lg">
      <Box
        sx={{ width: '50em', height: '50em', m: 4, borderRadius: 4, position: 'relative' }}
        className="ml-auto mr-auto"
      >
      <DeckGL
          initialViewState={constructedViewState}
          controller={{doubleClickZoom: false}}
          id="deck-gl"
          layers={[panelLayer, editableGjsonLayer]} 
          getCursor={editableGjsonLayer.getCursor.bind(editableGjsonLayer)}
        >
        <MapView id="map" controller={false} width="100%" height="100%">
            <StaticMap mapStyle="mapbox://styles/mapbox/satellite-v9" mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
        </MapView>
        </DeckGL>
      </Box>
      <Group position="center" direction="row" spacing="xs">
      <Switch
        checked={analysisMode}
        onChange={() => {
          setAnalysisMode(!analysisMode);
          if (!analysisMode) {
            setMode(() => DrawRectangleMode);
          } else {
            setMode(() => ViewMode);
          }
        }}
      >
      </Switch>
      <Title order={4} c="white">Analysis Mode</Title>
      </Group>
      {analysisMode && (
      <>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={submitSelection}>
        Submit Selection
      </button>
      </>
      )}
      {awaitingResponse && (
        <Group position="center" direction="row" spacing="xs">
        <Loader />
        <Title order={4} c="white">Detecting Solar Panels...</Title>
        </Group>
      )}
      {numPanelsFound > 0 && ( 
        <Title c="blue">{numPanelsFound} Panels Found</Title>
      )}
      </Stack>
      </Center>
    </div>
    </>
  );
}

export default Map;

