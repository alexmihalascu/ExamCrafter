import { Icon } from '@iconify/react';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const highlights = [
  {
    icon: 'mdi:blur-linear',
    title: 'Liquid on-boarding',
    description: 'Interfata fluida, reactiva, ce adapteaza lumina si profunzimea la dispozitiv.',
  },
  {
    icon: 'mdi:shield-check',
    title: 'Autentificare unica',
    description: 'Cont Google obligatoriu pentru securitate Zero-Password.',
  },
  {
    icon: 'mdi:share-variant',
    title: 'Control granular',
    description: 'Partajezi seturi de intrebari pe email, privat sau public.',
  },
];

const SignIn = () => {
  const theme = useTheme();
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      navigate('/main');
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError('Autentificarea cu Google a esuat. Incearca din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 10,
        px: 2,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 10% 20%, rgba(124, 147, 255, 0.4), transparent 40%), radial-gradient(circle at 90% 0%, rgba(255, 140, 212, 0.3), transparent 45%)',
          filter: 'blur(40px)',
          opacity: 0.8,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{
            borderRadius: 6,
            p: { xs: 4, md: 6 },
            background:
              theme.palette.mode === 'dark' ? 'rgba(8, 12, 24, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 80px rgba(4,6,19,0.55)',
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Stack spacing={3} height="100%" justifyContent="center">
                <Typography variant="overline" color="primary" letterSpacing={4}>
                  EXAMCRAFTER
                </Typography>
                <Typography variant="h2">
                  Autentificare <br />
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Contul tau Google devine cheia unui ecosistem de chestionare premium cu estetica
                  moderna. Un singur click pentru a sincroniza avatar, preferinte si acces la
                  dataset-urile partajate.
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  startIcon={<Icon icon="mdi:google" />}
                  sx={{
                    py: 1.8,
                    fontSize: 18,
                    alignSelf: 'flex-start',
                  }}
                >
                  {loading ? 'Se autentifica...' : 'Continua cu Google'}
                </Button>

                <Divider flexItem light />

                <Stack direction="row" spacing={2} alignItems="center">
                  <Icon icon="mdi:sparkles" width={28} />
                  <Typography variant="body2" color="text.secondary">
                    Politica de acces bazata pe invitatii si partajari explicite.
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {highlights.map(highlight => (
                  <Box
                    key={highlight.title}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                      p: 2.5,
                      borderRadius: 4,
                      background:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(255,255,255,0.65)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        background:
                          'linear-gradient(135deg, rgba(105,119,255,0.2), rgba(255,145,207,0.2))',
                      }}
                    >
                      <Icon
                        icon={highlight.icon}
                        width={28}
                        height={28}
                        color={theme.palette.primary.main}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {highlight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {highlight.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignIn;
