import React from 'react';
import { Typography, Container, Box, Grid, Paper } from '@mui/material';

const Main = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Bine ai venit la Quiz App
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6">Chestionare</Typography>
              <Typography variant="body1">Începe un nou chestionar pentru a-ți testa cunoștințele.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6">Istoric</Typography>
              <Typography variant="body1">Vezi istoricul chestionarelor completate.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6">Profil</Typography>
              <Typography variant="body1">Gestionează setările profilului tău.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Main;
