import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  useTheme,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import Footer from '../components/Footer';

const User = () => {
  const theme = useTheme();
  const { currentUser, resetPassword } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await updateProfile(currentUser, { displayName });
      setMessage({ text: 'Profil actualizat cu succes!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Eroare la actualizarea profilului.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await resetPassword(currentUser.email);
      setMessage({ text: 'Email de resetare parolă trimis cu succes!', type: 'success' });
    } catch (error) {
      console.error('Error sending password reset:', error);
      setMessage({ text: 'Eroare la trimiterea emailului de resetare.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const boxVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.default }}>
      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={boxVariants}
        >
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Icon icon="mdi:account-cog" width={40} height={40} color={theme.palette.primary.main} />
              <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }}>
                Setări Cont
              </Typography>
            </Box>

            {message.text && (
              <Alert severity={message.type} sx={{ mb: 3 }}>
                {message.text}
              </Alert>
            )}

            <Grid container spacing={4}>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Avatar
                  src={currentUser?.photoURL}
                  alt={currentUser?.displayName}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto',
                    mb: 2,
                    border: `4px solid ${theme.palette.primary.main}`,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {currentUser?.displayName || 'Utilizator'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser?.email}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informații Profil
                </Typography>
                <form onSubmit={handleUpdateProfile}>
                  <TextField
                    fullWidth
                    label="Nume Complet"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={currentUser?.email}
                    disabled
                    sx={{ mb: 3 }}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    fullWidth
                    startIcon={<Icon icon="mdi:content-save" />}
                  >
                    Salvează Modificări
                  </Button>
                </form>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Securitate
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Resetează parola prin email
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleResetPassword}
                  disabled={loading}
                  fullWidth
                  startIcon={<Icon icon="mdi:lock-reset" />}
                >
                  Trimite Email Resetare Parolă
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>
      <Footer />
    </Box>
  );
};

export default User;
