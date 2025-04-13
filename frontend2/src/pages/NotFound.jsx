import { Container, Typography, Box } from "@mui/material";

function NotFound() {
  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4">404 - Page Not Found</Typography>
        <Typography variant="body1">
          The page you’re looking for doesn’t exist.
        </Typography>
      </Box>
    </Container>
  );
}

export default NotFound;
