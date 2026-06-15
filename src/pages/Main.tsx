import { Icon } from '@iconify/react';
import { Avatar, Box, Button, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import * as countUpExports from 'react-countup';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/auth-context';
import { db } from '../firebase/firebaseConfig';
import { interopDefault } from '../utils/interop';

const CountUp = interopDefault(countUpExports);

const features = [
  {
    icon: 'ph:database',
    title: 'Seturi de grile',
    description: 'Intrebarile tale sunt stocate in cloud si organizate pe seturi si grile compuse.',
  },
  {
    icon: 'ph:chart-line-up',
    title: 'Analiza progresului',
    description: 'Vezi rata de promovare, media raspunsurilor corecte si evolutia in timp.',
  },
  {
    icon: 'ph:lock-key',
    title: 'Date private',
    description: 'Rezultatele raman legate de contul tau si nu sunt partajate fara permisiune.',
  },
];

const Stat = ({ value, label }: { value: number; label: string }) => (
  <Box>
    <Typography
      className="tabular-nums"
      sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.5rem', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em' }}
    >
      <CountUp end={value} duration={1.6} />
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
      {label}
    </Typography>
  </Box>
);

const Main = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [testStats, setTestStats] = useState({ totalTests: 0, passedTests: 0 });

  useEffect(() => {
    const fetchTestStats = async () => {
      if (!currentUser?.uid) return;
      try {
        const resultsRef = collection(db, 'results');
        const q = query(resultsRef, where('user_id', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => doc.data());
        setTestStats({
          totalTests: data.length,
          passedTests: data.filter((test) => test.passed).length,
        });
      } catch (error) {
        console.error('Error fetching test stats:', error);
      }
    };
    fetchTestStats();
  }, [currentUser]);

  const firstName = currentUser?.displayName?.split(' ')[0] || 'Explorator';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ flex: 1 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="overline" color="primary.main">
            Panou principal
          </Typography>
          <Grid container spacing={4} sx={{ mt: 0.5, mb: { xs: 6, md: 9 } }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                <Avatar
                  src={currentUser?.photoURL || undefined}
                  alt={currentUser?.displayName || ''}
                  sx={{ width: 64, height: 64, borderRadius: 3 }}
                  variant="rounded"
                >
                  {firstName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h2" sx={{ mb: 0.5 }}>
                    Buna, {firstName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Alege un set, da-i drumul la grile si urmareste-ti progresul.
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" size="large" onClick={() => navigate('/quiz')} startIcon={<Icon icon="ph:play" />}>
                  Incepe un test
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/sets')}>
                  Gestioneaza seturi
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 4 }}>
                <Stack direction="row" spacing={5}>
                  <Stat value={testStats.totalTests} label="Teste efectuate" />
                  <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: 'divider' }} />
                  <Stat value={testStats.passedTests} label="Teste promovate" />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Ce poti face aici
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '52ch' }}>
              Cateva dintre lucrurile pe care platforma le face in fundal pentru tine.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 8 }}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={feature.title}>
                <Paper
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  sx={{ p: 3.5, height: '100%' }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.main',
                      bgcolor: (t) => `${t.palette.primary.main}14`,
                      mb: 2,
                    }}
                  >
                    <Icon icon={feature.icon} width={24} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Main;
