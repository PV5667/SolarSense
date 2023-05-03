import React from 'react';
import { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Draw90DegreePolygonMode, DrawPolygonByDraggingMode, ViewMode, DrawRectangleUsingThreePointsMode, DrawRectangleMode } from '@nebula.gl/edit-modes';
import { EditableGeoJsonLayer } from '@nebula.gl/layers';
import StaticMap from 'react-map-gl';
import {Box, Button, Grid} from "@mantine/core"
import { MapView } from '@deck.gl/core';
import { bboxPolygon, area, bbox, squareGrid } from '@turf/turf';

const box = [-122.1404, 37.7139, -122.1346, 37.7195];
//const bbox = [37.3602, -121.9742, 37.646, -121.9686];
const poly = bboxPolygon(box);
const sqm = area(poly);

console.log(sqm);
console.log(poly);

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZ2Vvcmdpb3MtdWJlciIsImEiOiJjanZidTZzczAwajMxNGVwOGZrd2E5NG90In0.gdsRu_UeU_uPi9IulBruXA';

const INITIAL_VIEW_STATE = {
  longitude: -121.89,
  latitude: 37.3387,
  zoom: 13,
  pitch: 0,
  bearing: 0,
};
function Map () {
  const [features, setFeatures] = useState({
    type: "FeatureCollection",
    features: []
  });
  const [mode, setMode] = useState(() => DrawRectangleUsingThreePointsMode); 
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState(
    []
  );

  const layer = new EditableGeoJsonLayer({
    id: 'geojson-layer',
    data: features,
    mode: DrawRectangleUsingThreePointsMode,
    selectedFeatureIndexes: selectedFeatureIndexes,
    onEdit: ({ updatedData }) => {
      console.log(updatedData);
      const newData = squareGrid(bbox(updatedData), 0.5);
      console.log("New Data ")
      console.log(newData);
      setFeatures(newData);
    }
  });

  return (
    <div class="my-12">
      <Box
        sx={{ width: '80em', height: '50em', borderRadius: 4, position: 'relative' }}
        className="ml-auto mr-auto"
      >
      <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={{
            doubleClickZoom: false
          }}
          id="deck-gl"
          layers={[layer]}
          getCursor={layer.getCursor.bind(layer)}
        >
        <MapView id="map" controller={false} width="100%" height="100%">
          <StaticMap mapStyle="mapbox://styles/mapbox/satellite-v9" mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
        </MapView>
        </DeckGL>
      </Box>
    </div>
  );
}

export default Map;