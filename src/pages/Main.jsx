import React, { useEffect, useState } from 'react';
import { Typography, Container, Box, Grid, Paper, Avatar, Button } from '@mui/material';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Main = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [testStats, setTestStats] = useState({ totalTests: 0, passedTests: 0 });

  useEffect(() => {
    const fetchTestStats = async () => {
      if (user && user.id) {
        try {
          const { data: totalTestsData, error: totalTestsError } = await supabase
            .from('results')
            .select('*')
            .eq('user_id', user.id);

          if (totalTestsError) {
            throw totalTestsError;
          }

          const passedTestsData = totalTestsData.filter(test => test.passed);
          setTestStats({ totalTests: totalTestsData.length, passedTests: passedTestsData.length });
        } catch (error) {
          console.error('Error fetching test stats:', error);
        }
      }
    };

    fetchTestStats();
  }, [user]);

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ padding: 3, borderRadius: 2, textAlign: 'center' }}>
          <Avatar
            alt={user.fullName}
            src={user.profileImageUrl}
            sx={{ width: 56, height: 56, margin: '0 auto', mb: 2 }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            Bună, {user.firstName}! Bine ai venit la ExamCrafter!
          </Typography>
          <Typography variant="h6" component="p" gutterBottom>
            Ai efectuat {testStats.totalTests} teste, dintre care {testStats.passedTests} au fost promovate.
          </Typography>
        </Paper>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Funcționalități cheie aplicație
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6">Sistem de grile</Typography>
              <Typography variant="body1">Aplicația foloseste de o baza de date cloud (Supabase) pentru a stoca întrebările.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6">Istoric detaliat</Typography>
              <Typography variant="body1">Aplicația furnizează statistici și istoric al grilelor.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6">Datele sunt anonime</Typography>
              <Typography variant="body1">Datele sunt stocate în siguranță cu id-uri aleatoare pentru a nu identifica utilizatorii.</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleStartQuiz}>
            Începe Grile
          </Button>
        </Box>
      </Box>
      <Footer />
    </Container>
  );
};

export default Main;
