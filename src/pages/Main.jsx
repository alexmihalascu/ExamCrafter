import React, { useEffect, useState } from 'react';
import { Typography, Container, Box, Grid, Paper, Avatar, Button } from '@mui/material';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

// Adăugați importul pentru service worker
import { registerSW } from 'virtual:pwa-register';

const Main = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [testStats, setTestStats] = useState({ totalTests: 0, passedTests: 0 });
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    // Înregistrează service worker-ul
    const updateSW = registerSW({
      onNeedRefresh() {
        if (window.confirm("New content is available. Do you want to refresh?")) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log("The app is ready to work offline.");
      },
    });

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

    // Set image URL with optimization parameters
    if (user && user.imageUrl) {
      const params = new URLSearchParams();
      params.set('height', '200');
      params.set('width', '200');
      params.set('quality', '100');
      params.set('fit', 'crop');
      setImageSrc(`${user.imageUrl}?${params.toString()}`);
    }
  }, [user]);

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Paper sx={{ padding: 3, borderRadius: 2, textAlign: 'center' }}>
            {user && (
              <>
                <Avatar
                  alt={user.firstName + ' ' + user.lastName}
                  src={imageSrc}
                  sx={{ width: 56, height: 56, margin: '0 auto', mb: 2 }}
                />
                <Typography variant="h4" component="h1" gutterBottom>
                  Bună, {user.firstName}! Bine ai venit la ExamCrafter!
                </Typography>
              </>
            )}
            <Typography variant="h6" component="p" gutterBottom>
              Ai efectuat <CountUp end={testStats.totalTests} duration={2} /> teste, dintre care <CountUp end={testStats.passedTests} duration={2} /> au fost promovate.
            </Typography>
          </Paper>
        </motion.div>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Funcționalități cheie aplicație
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Paper sx={{ padding: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h6">Sistem de grile</Typography>
                <Typography variant="body1">Aplicația folosește o bază de date cloud (Supabase) pentru a stoca întrebările.</Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Paper sx={{ padding: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h6">Istoric detaliat</Typography>
                <Typography variant="body1">Aplicația furnizează statistici și istoric al grilelor.</Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Paper sx={{ padding: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h6">Datele sunt anonime</Typography>
                <Typography variant="body1">Datele sunt stocate în siguranță cu id-uri aleatoare pentru a nu identifica utilizatorii.</Typography>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Button variant="contained" color="primary" onClick={handleStartQuiz}>
              Începe Grile
            </Button>
          </motion.div>
        </Box>
      </Box>
      
      <Footer />

    </Container>
  );
};

export default Main;
