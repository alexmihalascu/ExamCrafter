import { Icon } from '@iconify/react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebaseConfig';

const FeatureCard = ({ icon, title, description, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        sx={{
          height: '100%',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(140deg, rgba(16,18,38,0.92), rgba(8,10,24,0.88))'
              : 'linear-gradient(140deg, rgba(255,255,255,0.9), rgba(230,236,255,0.85))',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 45px rgba(0,0,0,0.35)',
          transition: 'all 0.3s ease-in-out',
          backdropFilter: 'blur(22px)',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 35px 65px rgba(0,0,0,0.45)',
          },
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <motion.div
            animate={{
              y: isHovered ? -5 : 0,
              color: isHovered ? theme.palette.primary.main : theme.palette.text.secondary,
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon icon={icon} width={48} height={48} />
          </motion.div>
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Main = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [testStats, setTestStats] = useState({ totalTests: 0, passedTests: 0 });

  useEffect(() => {
    const fetchTestStats = async () => {
      if (currentUser?.uid) {
        try {
          const resultsRef = collection(db, 'results');
          const q = query(resultsRef, where('user_id', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);

          const data = querySnapshot.docs.map(doc => doc.data());
          const passedTests = data.filter(test => test.passed).length;

          setTestStats({
            totalTests: data.length,
            passedTests,
          });
        } catch (error) {
          console.error('Error fetching test stats:', error);
        }
      }
    };

    fetchTestStats();
  }, [currentUser]);

  const features = [
    {
      icon: 'mdi:database',
      title: 'Sistem de Grile',
      description: 'Bază de date cloud pentru stocarea și gestionarea întrebărilor',
    },
    {
      icon: 'mdi:chart-line',
      title: 'Analiză Performanță',
      description: 'Monitorizează progresul și rezultatele testelor cu statistici detaliate',
    },
    {
      icon: 'mdi:shield-check',
      title: 'Date Anonime',
      description: 'Securitate maximă - datele sunt stocate anonim pentru confidențialitatea ta',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
      }}
    >
      <Container maxWidth="lg" sx={{ flex: 1, py: 6 }}>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                p: { xs: 4, md: 6 },
                borderRadius: 5,
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 40px 90px rgba(3,4,12,0.55)',
                background:
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(7,10,22,0.95), rgba(16,19,40,0.9))'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.93), rgba(229,235,255,0.9))',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.6,
                  background:
                    'radial-gradient(circle at 25% 15%, rgba(120,140,255,0.55), transparent 55%)',
                }}
              />

              {currentUser && (
                <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <Avatar
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      sx={{
                        width: 120,
                        height: 120,
                        margin: '0 auto',
                        mb: 3,
                        border: '4px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 30px 50px rgba(0,0,0,0.45)',
                      }}
                    />
                  </motion.div>

                  <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
                    Buna, {currentUser.displayName?.split(' ')[0] || 'Explorator'}!
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4 }}>
                    Esti in controlul dataset-urilor tale inteligente.
                  </Typography>

                  <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <Typography variant="h4" color="white" fontWeight="bold">
                          <CountUp end={testStats.totalTests} duration={2} />
                        </Typography>
                        <Typography color="rgba(255,255,255,0.8)">Teste efectuate</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <Typography variant="h4" color="white" fontWeight="bold">
                          <CountUp end={testStats.passedTests} duration={2} />
                        </Typography>
                        <Typography color="rgba(255,255,255,0.8)">Teste promovate</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box mt={5}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/quiz')}
                        sx={{ px: 5, py: 1.6, fontSize: 18 }}
                      >
                        Incepe un Test
                      </Button>
                    </motion.div>
                  </Box>
                </Box>
              )}
            </Paper>{' '}
          </motion.div>
        </AnimatePresence>

        <Box sx={{ mt: 8, mb: 6 }}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 'bold',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              color: 'transparent',
              mb: 2,
            }}
          >
            Functionalitati
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: '600px',
              mx: 'auto',
              mb: 6,
            }}
          >
            Descoperă instrumentele care te ajută să excelezi
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.2 * (index + 1)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
};

export default Main;
