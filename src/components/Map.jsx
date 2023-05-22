
import React from 'react';
import { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Draw90DegreePolygonMode, DrawPolygonByDraggingMode, ViewMode, DrawRectangleUsingThreePointsMode, DrawRectangleMode } from '@nebula.gl/edit-modes';
import { EditableGeoJsonLayer} from '@nebula.gl/layers';
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers';
import StaticMap from 'react-map-gl';
import {Box, Button, Grid, Stack, Center, Title, Switch, Group} from "@mantine/core"
import { MapView } from '@deck.gl/core';
import { bboxPolygon, area, bbox, squareGrid } from '@turf/turf';
import * as fs from "fs";
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const [panels, setPanels] = useState(
    []);
  const [numPanelsFound, setNumPanelsFound] = useState(0);

  function submitSelection () {
    console.log("Inputted Selection:" + JSON.stringify(features));
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
          response.json()
          .then(function(response) {
              console.log(typeof(JSON.parse(response)));
              const newPanels = JSON.parse(response).features;
              setPanels(newPanels);
              setNumPanelsFound(newPanels.length);
              setFeatures(null);
              console.log(newPanels);
              setMode(() => ViewMode);
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
    <div>
      <Center>
      <Stack spacing="lg">
      <Box
        sx={{ width: '50em', height: '50em', m: 4, borderRadius: 4, position: 'relative' }}
        className="ml-auto mr-auto"
      >
      <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
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
      <Title order={4} c="blue">Analysis Mode</Title>
      </Group>
      {analysisMode && (
      <>
      <Title order={4} c="white">Draw a rectangle around the area you want to analyze and then submit your selection.</Title>
      <Button variant="filled" color="indigo" radius="sm" size="lg" onClick={submitSelection}>
      Submit Selection
      </Button>
      </>
      )}
      {numPanelsFound > 0 && ( 
        <Title>{numPanelsFound} Panels Found</Title>
      )}
      </Stack>
      </Center>
    </div>
  );
}

export default Map;

