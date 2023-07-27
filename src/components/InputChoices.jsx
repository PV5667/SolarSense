import { FileInput, Stack, rem, Center, Divider, HoverCard, Text } from '@mantine/core';
import { WorldUpload } from 'tabler-icons-react';
import SearchBar from './SearchBar';
import { useState, useContext } from 'react'
import { LocationContext } from './LocationProvider';
import { FeaturesContext } from './FeaturesProvider';
import { center, squareGrid, bbox, buffer } from '@turf/turf';
import UploadGeoJSON from './UploadGeoJSON';
import {MantineProvider} from "@mantine/core"

function InputChoices() {
    const [uploadedGeoJSON, setUploadedGeoJSON] = useContext(LocationContext);
    const [features, setFeatures] = useContext(FeaturesContext);
    const handleFileChange = (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = JSON.parse(event.target.result);
        const options = { units: "kilometers", mask: fileContent};
        setFeatures(squareGrid(bbox(buffer(fileContent, 0.06)), 0.12, options));
        const uploadedCenter = center(fileContent.features[0].geometry);
        fileContent["center"] = uploadedCenter.geometry.coordinates;
        setUploadedGeoJSON(fileContent);
        console.log("Uploaded Location: ", fileContent)
      };

      reader.readAsText(file);
  };
  return (
    <div class="max-w-2xl mx-auto pb-8">
    <Stack>
    <MantineProvider theme={{ colorScheme: 'dark' }}>
    <HoverCard shadow="md" closeDelay={250} >
      <HoverCard.Target>
        <div class="p-6 hover:outline-blue-400">
          <SearchBar /> 
        </div>
      </HoverCard.Target>
      <HoverCard.Dropdown>
          <Text size="sm">Then draw an area to be analyzed on the map and click "Submit Selection"!</Text>
      </HoverCard.Dropdown>
    </HoverCard>
    </MantineProvider>
    <Divider size="lg" my="xs" label="OR" labelPosition="center" />
    <HoverCard shadow="md" closeDelay={250} >
      <HoverCard.Target>
        <div>
          <UploadGeoJSON />
        </div>
      </HoverCard.Target>
      <MantineProvider theme={{ colorScheme: 'dark' }}>
      <HoverCard.Dropdown>
          <Text size="sm">Then click "Submit Selection"!</Text>
      </HoverCard.Dropdown>
      </MantineProvider>
    </HoverCard>

    </Stack>
      </div>
  );
}

export default InputChoices;