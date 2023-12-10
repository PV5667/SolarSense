import React from 'react';
import { useState, useRef, useContext, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { Draw90DegreePolygonMode, DrawPolygonByDraggingMode, DrawPolygonMode, ViewMode, DrawRectangleUsingThreePointsMode, DrawRectangleMode } from '@nebula.gl/edit-modes';
import { EditableGeoJsonLayer} from '@nebula.gl/layers';
import {GeoJsonLayer, PolygonLayer, IconLayer} from '@deck.gl/layers';
import StaticMap from 'react-map-gl';
import {Box, Button, Grid, Stack, Center, Title, Switch, Group, Loader, Modal, SegmentedControl, Progress, CloseButton} from "@mantine/core"
import { MapView, FlyToInterpolator, WebMercatorViewport } from '@deck.gl/core';
import { bboxPolygon, area, bbox, buffer, squareGrid, lineString} from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import {LocationContext} from './LocationProvider';
import { FeaturesContext } from './FeaturesProvider';
import { useDisclosure } from '@mantine/hooks';
import { WorldDownload, Trash } from 'tabler-icons-react';
import Supercluster from 'supercluster';


const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicHY1NjY3IiwiYSI6ImNsZGFtOHVoejBiZ2Mzb3A2djgyaDl1OGEifQ.FSssERk7wLiG1fDpen0iXA';

const INITIAL_VIEW_STATE = {
  longitude: -120.4265,
  latitude: 34.8670892225,
  zoom: 16,
  pitch: 0,
  bearing: 0,
};
function Map () {
  const [features, setFeatures] = useContext(FeaturesContext);
  const [analysisMode, setAnalysisMode] = useState("analysis");
  const [mode, setMode] = useState(() => DrawPolygonMode);//DrawRectangleMode); 
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState(
    []
  );
  // For Error Modal
  const [errorOpened, errorHandlers] = useDisclosure(false);
  const [sizeOpened, sizeHandlers] = useDisclosure(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [panels, setPanels] = useState(
    []);
  const [numPanelsFound, setNumPanelsFound] = useState(0);
  const [progress, setProgress] = useState(0);
  const [clusters, setClusters] = useState({
    type: "FeatureCollection",
    features: []
  }); 
  const [useClusters, setUseClusters] = useState(false);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const location = useContext(LocationContext)[0];
  //console.log(location)
  const constructedViewState = {
    latitude: location["center"][1],
    longitude: location["center"][0],
    zoom: 14,
    pitch: 0,
    bearing: 0,
    transitionDuration: 5000,
    transitionInterpolator: new FlyToInterpolator()
  }
  const progressBarRef = useRef(null)
  const scrollToBottom = () => {
      progressBarRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [awaitingResponse]);

  //console.log("Map.jsx location: ", location);

  function submitSelection () {
    //console.log("Inputted Selection:" + JSON.stringify(features));
    setAwaitingResponse(true);
    //http://127.0.0.1:5000/detect
    //https://flask-service.1ub7bv2ebr060.us-east-1.cs.amazonlightsail.com/detect
    //https://api.lec-hacks.org/detect
    fetch('https://api.pvirupaksha.com/detect', {
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
              const newPanels = JSON.parse(response).features
              setPanels(newPanels);
              setNumPanelsFound(newPanels.length);
              setFeatures({
                type: "FeatureCollection",
                features: []
              });
              console.log(newPanels);
              setMode(() => ViewMode);
              setAnalysisMode("view");
              handleViewStateChange(viewState, newPanels);
          });
      }
      else {
          setAwaitingResponse(false);
          console.log(response);
          errorHandlers.open();
          throw Error('Something went wrong');
      }
  })
  .catch(error => {
    setAwaitingResponse(false);
    console.log(error);
    errorHandlers.open();
    throw Error('Something went wrong');
  });
  }
  function postprocessPanels (panels) {
    const processedPanels = {
      type: "FeatureCollection",
      features: panels//panels.features,
    };
    //console.log(processedPanels);
    return processedPanels;
  }
  function downloadPanelsGeoJSON (){
    //console.log("Downloading Panels GeoJSON");
    const processedPanels = postprocessPanels(panels);
    const file = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(processedPanels));
    const element = document.createElement("a");
    element.href = file;
    element.download = "panels.json";
    document.body.appendChild(element); 
    element.click();
  }
  function calculateArea (features) {
    const sqm = area(features);
    const sqkm = (sqm / Math.pow(1000, 2)).toFixed(2);
    return sqkm;
  }

  function changeAnalysisMode () {
      if (analysisMode == "view") {
        setMode(() => DrawPolygonMode);
        setAnalysisMode("analysis");
      } else {
        setAnalysisMode("view");
        setMode(() => ViewMode);
      }
  }

  function getClustersToPlot(zoom, bounds, newPanels) {
    //console.log("Bounds: ", bounds)
    //console.log("Zoom: ", zoom)
    let panelsToPlot;
    if (newPanels.length > 0) {
      panelsToPlot = newPanels;
    } else {
      panelsToPlot = panels;
    }
    //console.log("Inside Get Clusters: " + panelsToPlot.length)
    if (panelsToPlot.length == 0) {
      return [];
    }
    const index = new Supercluster({ radius: 60, maxZoom: 16 });
    index.load(
      panelsToPlot.map((d) => ({
        type: 'Feature',
        geometry: { 
          type: 'Point',
          coordinates: [d.geometry.coordinates[0][0][0], d.geometry.coordinates[0][0][1]],
        },
        properties: d.properties,
      }))
    );
    const clusters = index.getClusters(bounds, Math.floor(zoom));
    //console.log(clusters)
    return clusters;
  }
  // from https://github.com/visgl/deck.gl/blob/8.9-release/examples/website/icon/icon-cluster-layer.js
  function getIconName(size) {
    if (size === 0) {
      return '';
    }
    if (size < 10) {
      return `marker-${size}`;
    }
    if (size < 100) {
      return `marker-${Math.floor(size / 10)}0`;
    }
    return 'marker-100';
  }
  
  function getIconSize(size) {
    return Math.min(100, size) / 100 + 1;
  }

  const handleViewStateChange = (viewState, newPanels=[]) => {
    setViewState(viewState)
    const viewport = new WebMercatorViewport(viewState);
    const nw = viewport.unproject([0, 0]);
    const se = viewport.unproject([viewport.width, viewport.height]);
    var bounds = [nw[0], se[1], se[0], nw[1]];
    var zoom = viewState.zoom;
    if (zoom <= 16) {
      const clusters = getClustersToPlot(zoom, bounds, newPanels);
      setUseClusters(true);
      setClusters(clusters);      
    } else {
      setUseClusters(false);
    }
  };
  // switch between polygon and icon layer based on boolean value in state
  let featureLayer;
  if (useClusters) {
    featureLayer = new IconLayer({
      id: "icon-layer",
      data: clusters,
      pickable: false,
      iconAtlas: "./location-icon-atlas.png",
      iconMapping: "https://raw.githubusercontent.com/visgl/deck.gl/8.9-release/examples/website/icon/data/location-icon-mapping.json",
      getIcon: d => getIconName(d.properties.cluster ? d.properties.point_count : 1),
      getSize: d => getIconSize(d.properties.cluster ? d.properties.point_count : 1),
      getPosition: d => d.geometry.coordinates,
      sizeScale: 40,
    })
  } else {
    featureLayer = new PolygonLayer({
      id: "poly-layers",
      data: panels,
      pickable: true,
      filled: true,
      extruded: true,
      wireframe: true,
      getPolygon: d => d.geometry.coordinates,
      getFillColor: [255, 0, 0],
      getLineColor: [168, 85, 247],
      getLineWidth: 0.3,
      getElevation: 1,
      _normalize: true,
    })
  }
  

  const editableGjsonLayer = new EditableGeoJsonLayer({
    id: 'geojson-layer',
    data: features,
    mode: mode, 
    selectedFeatureIndexes: selectedFeatureIndexes,
    onEdit: ({ updatedData }) => {
      //console.log(updatedData);
      const options = { units: "kilometers", mask: updatedData};
      const newData = squareGrid(bbox(buffer(updatedData, 0.06)), 0.12, options);
      //console.log("New Data:")
      //console.log(newData);
      if (newData.features.length > 900) {
        //console.log(newData.features.length)
        sizeHandlers.open();
      }
      //console.log(newData.features.length);
      setFeatures(newData);
    }
  });

  let interval; 

  useEffect(() => {
    if (awaitingResponse) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev === "Almost Done...") {
            return "Almost Done...";
          }
          const newProgress = +((prev + (100 / features.features.length)).toFixed(2));
          //console.log("Working...." + newProgress);
          return newProgress >= 100 ? "Almost Done..." : newProgress; 
        });
      }, 2005);
    } else {
      //console.log("Clearing Interval");
      setProgress(0); 
      clearInterval(interval);
    }
  
    return () => {
      clearInterval(interval); 
    };
  }, [awaitingResponse, features.features.length]); 
  
  useEffect(() => {
    if (progress === 100 && awaitingResponse) { 
      setProgress("Almost Done...");
      setAwaitingResponse(false);
      clearInterval(interval);
    }
  }, [progress, awaitingResponse]);
  return (
    <>
    <Modal size="xl" opened={errorOpened} onClose={errorHandlers.close} withCloseButton={false} centered>
        <Group position="center" direction="row" spacing="xs">
        Oops! Something went wrong. A quick refresh should fix it.
        </Group>
    </Modal>
    <Modal size="xl" opened={sizeOpened} onClose={sizeHandlers.close} withCloseButton={false} centered>
        <Group position="center" direction="row" spacing="xs">
        Please reduce the size of your selection.
        </Group>
    </Modal>
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
          layers={[featureLayer, editableGjsonLayer]} 
          getCursor={editableGjsonLayer.getCursor.bind(editableGjsonLayer)}
          getTooltip={mode===ViewMode ? ({object}) => object && `Area: ${area(object).toFixed(3)} m²\nLon: ${object.geometry.coordinates[0][0][0].toFixed(4)}\nLat: ${object.geometry.coordinates[0][0][1].toFixed(4)}`: null}
          onViewStateChange={ e => handleViewStateChange(e.viewState) }
        >
        <MapView id="map" controller={false} width="100%" height="100%">
            <StaticMap mapStyle="mapbox://styles/mapbox/satellite-v9" mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
        </MapView>
        </DeckGL>
      </Box>
      {features.features.length > 0 && (
      <Group position="center" direction="row" spacing="xs">
        <Title order={4} c="white">Area: {calculateArea(features)} km²</Title>
        <button type="button" class="inline-flex items-center py-2 text-white 
        text-md font-medium rounded-md gap-1 hover:text-red-500 p-1 outline focus:outline-none focus:ring focus:ring-red" 
        onClick={() => {
          setFeatures({type: "FeatureCollection", features: []})
          setAwaitingResponse(false);
          }}>
          Clear Selection
          <Trash size={20} />
        </button>
      </Group>
      )}
      <Group position="center" direction="row" spacing="xs">
      <SegmentedControl
      value={analysisMode}
      onChange={changeAnalysisMode}
      data={[
        { label: 'Select Mode', value: 'analysis' },
        { label: 'View Mode', value: 'view' },
      ]}
      />
      </Group>
      {analysisMode==="analysis" && (
      <>
      <button class="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:hover:bg-blue-500" 
      disabled={features.features.length>900} onClick={submitSelection}>
        Submit Selection
      </button>
      </>
      )}
      {awaitingResponse && (
        <div class="p-6 space-y-4" ref={progressBarRef}>
        <Progress value={progress} label={progress + "%"} size="xl" radius="xl" />
        <Group position="center" direction="row" spacing="xs">
        <Title order={4} c="white">Detecting Solar Panels...</Title>
        </Group>
        </div>
      )}
      {numPanelsFound > 0 && ( 
        <>
        <Title style={{color: "#e8caf1"}}>{numPanelsFound} Panels Found</Title>
        <div class="max-w-6xl mx-auto pb-16">
        <button type="button" class="inline-flex items-center px-4 py-2 text-white text-md font-medium rounded-md gap-2.5 outline outline-1 hover:outline-blue-400 focus:outline-none focus:ring focus:ring-violet-300" onClick={downloadPanelsGeoJSON}>
          <WorldDownload size={20} />
          Download Panel GeoJSON
        </button>
        </div>
        </>
      )}
      </Stack>
      </Center>

    </div>
    </>
  );
}

export default Map;

