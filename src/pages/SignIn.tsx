import { Icon } from '@iconify/react';
import { Alert, Box, Button, Container, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const highlights = [
  {
    icon: 'ph:user-circle',
    title: 'Un singur cont',
    description: 'Te autentifici cu Google. Fara parole de tinut minte si fara formulare.',
  },
  {
    icon: 'ph:shield-check',
    title: 'Acces controlat',
    description: 'Seturile de intrebari raman private pana cand alegi sa le partajezi.',
  },
  {
    icon: 'ph:share-network',
    title: 'Partajare pe email',
    description: 'Trimiti acces unei persoane sau faci un set public, dupa caz.',
  },
];

const SignIn = () => {
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
      setError('Autentificarea cu Google nu a reusit. Incearca din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '80dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Container maxWidth="lg">
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ overflow: 'hidden' }}
        >
          <Grid container>
            <Grid size={{ xs: 12, md: 6 }} sx={{ p: { xs: 4, md: 6 } }}>
              <Stack spacing={3} sx={{ height: '100%', justifyContent: 'center' }}>
                <Typography variant="overline" color="primary.main">
                  ExamCrafter
                </Typography>
                <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3rem' } }}>
                  Intra in cont
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '48ch' }}>
                  Contul Google iti sincronizeaza numele, avatarul si accesul la seturile partajate.
                  Un singur click si esti inauntru.
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  startIcon={<Icon icon="ph:google-logo" />}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {loading ? 'Se autentifica…' : 'Continua cu Google'}
                </Button>

                <Divider />

                <Typography variant="body2" color="text.secondary">
                  Accesul se acorda prin invitatii si partajari explicite.
                </Typography>
              </Stack>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                p: { xs: 4, md: 6 },
                bgcolor: (t) => (t.palette.mode === 'light' ? t.palette.grey[100] : t.palette.grey[100]),
                borderLeft: { md: '1px solid' },
                borderTop: { xs: '1px solid', md: 'none' },
                borderColor: { xs: 'divider', md: 'divider' },
              }}
            >
              <Stack spacing={1}>
                {highlights.map((highlight, index) => (
                  <Box key={highlight.title}>
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ py: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          flexShrink: 0,
                          borderRadius: 2.5,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'primary.main',
                          bgcolor: (t) => `${t.palette.primary.main}14`,
                        }}
                      >
                        <Icon icon={highlight.icon} width={24} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {highlight.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {highlight.description}
                        </Typography>
                      </Box>
                    </Stack>
                    {index < highlights.length - 1 && <Divider />}
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
