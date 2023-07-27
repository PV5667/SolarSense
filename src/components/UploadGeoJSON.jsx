import { FileInput, Stack, rem, Center, Divider } from '@mantine/core';
import { WorldUpload } from 'tabler-icons-react';
import SearchBar from './SearchBar';
import { useState, useContext } from 'react'
import { LocationContext } from './LocationProvider';
import { FeaturesContext } from './FeaturesProvider';
import { center, squareGrid, bbox, buffer } from '@turf/turf';

function Value({ file }) {
    return (
      <Center
        inline
        sx={(theme) => ({
          fontSize: theme.fontSizes.sm,
          borderRadius: theme.radius.sm,
          color: theme.colors.gray[1],
        })}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            maxWidth: rem(200),
            display: 'inline-block',
          }}
        >
          {file.name}
        </span>
      </Center>
    );
  }
  
const ValueComponent = ({ value }) => {
    if (Array.isArray(value)) {
      return (
        <Group spacing="sm" py="xs">
          {value.map((file, index) => (
            <Value file={file} key={index} />
          ))}
        </Group>
      );
    }
  
    return <Value file={value} />;
  };
  
  function UploadGeoJSON() {
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
    <Center>
        <div class="text-white hover:outline-blue-400 focus:outline-none focus:ring focus:ring-violet-300">
            <FileInput sx={{color:"white"}} placeholder="Upload GeoJSON" onChange={handleFileChange} icon={<WorldUpload size={rem(20)} style={{color:"white"}}/>} accept=".geojson,application/json" valueComponent={ValueComponent} />
        </div>
    </Center>
  );
}

export default UploadGeoJSON;