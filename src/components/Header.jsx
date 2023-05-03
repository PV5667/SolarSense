import {Box, Center, Title} from "@mantine/core"

function Header() {
    return (
        <div>
            <Center>
            <Box
    sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.blue[5],
        textAlign: 'center',
        padding: theme.spacing.xl,
        borderRadius: theme.radius.md,
      })}
    >
        <Title order={1} c="white">SolarSense</Title>
    </Box>
    </Center>
    </div>
    );
}

export default Header;