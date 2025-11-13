import React, { useState, useEffect } from 'react';
import {
  Container, Box, Paper, Typography, Avatar, Grid,
  Card, CardContent, useTheme, Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import CountUp from 'react-countup';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

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
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.grey[800]}`,
          borderRadius: 2,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 20px ${theme.palette.primary.main}25`
          }
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <motion.div
            animate={{ 
              y: isHovered ? -5 : 0,
              color: isHovered ? theme.palette.primary.main : theme.palette.text.secondary
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon icon={icon} width={48} height={48} />
          </motion.div>
          <Typography 
            variant="h6" 
            sx={{ mt: 3, mb: 2, fontWeight: 600 }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
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
            passedTests
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
      icon: "mdi:database",
      title: "Sistem de Grile",
      description: "Bază de date cloud pentru stocarea și gestionarea întrebărilor"
    },
    {
      icon: "mdi:chart-line",
      title: "Analiză Performanță",
      description: "Monitorizează progresul și rezultatele testelor cu statistici detaliate"
    },
    {
      icon: "mdi:shield-check",
      title: "Date Anonime",
      description: "Securitate maximă - datele sunt stocate anonim pentru confidențialitatea ta"
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.palette.background.default
    }}>
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
                p: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                border: `1px solid ${theme.palette.grey[800]}`
              }}
            >
              {currentUser && (
                <Box sx={{ textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Avatar
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      sx={{
                        width: 96,
                        height: 96,
                        margin: '0 auto',
                        mb: 3,
                        border: '4px solid rgba(255,255,255,0.2)',
                        boxShadow: theme.shadows[4]
                      }}
                    />
                  </motion.div>

                  <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
                    Bună, {currentUser.displayName?.split(' ')[0] || 'User'}!
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4 }}>
                    Bine ai venit înapoi la ExamCrafter
                  </Typography>

                  <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} sm={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="white" fontWeight="bold">
                          <CountUp end={testStats.totalTests} duration={2} />
                        </Typography>
                        <Typography color="rgba(255,255,255,0.7)">
                          Teste Efectuate
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="white" fontWeight="bold">
                          <CountUp end={testStats.passedTests} duration={2} />
                        </Typography>
                        <Typography color="rgba(255,255,255,0.7)">
                          Teste Promovate
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box mt={4}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/quiz')}
                        sx={{
                          bgcolor: 'white',
                          color: theme.palette.primary.main,
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.9)'
                          }
                        }}
                      >
                        Începe un Test
                      </Button>
                    </motion.div>
                  </Box>
                </Box>
              )}
            </Paper>
          </motion.div>
        </AnimatePresence>

        <Box sx={{ mt: 8, mb: 6 }}>
          <Typography 
            variant="h4" 
            align="center"
            sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 2
            }}
          >
            Funcționalități Principale
          </Typography>
          <Typography 
            variant="body1" 
            align="center"
            sx={{ 
              color: theme.palette.text.secondary,
              maxWidth: '600px',
              mx: 'auto',
              mb: 6 
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