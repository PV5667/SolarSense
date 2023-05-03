import {Box, Button, Grid, Center} from "@mantine/core"

function MapButtons() {
    return (
    <div class="p-4">
    <Center>
    <Grid>
      <Grid.Col span={4}>
      <Button variant="filled" color="indigo" radius="sm" size="lg">
      Upload GeoJson
      </Button>
      </Grid.Col>
      <Grid.Col span={4}>
      <Button variant="filled" color="indigo" radius="sm" size="lg">
      Clear Selection
      </Button>
      </Grid.Col>
      <Grid.Col span={4}>
      <Button variant="filled" color="indigo" radius="sm" size="lg">
      Submit Selection
    </Button>
      </Grid.Col>
    </Grid>
    </Center>
    </div>
    );
}

export default MapButtons;