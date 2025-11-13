import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const User = () => {
  const theme = useTheme();
  const { currentUser, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Numele nu poate fi gol.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await updateUserProfile({ displayName: displayName.trim() });
      setMessage({ type: 'success', text: 'Profil actualizat cu succes.' });
    } catch (error) {
      console.error('Failed to update display name:', error);
      setMessage({ type: 'error', text: 'Actualizarea a esuat. Incearca din nou.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event) => {
    if (!currentUser?.uid) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Incarca un fisier imagine valid.' });
      return;
    }

    setAvatarUploading(true);
    setUploadProgress(0);
    setMessage(null);

    const storageRef = ref(storage, `avatars/${currentUser.uid}/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Avatar upload failed:', error);
        setMessage({ type: 'error', text: 'Incarcarea avatarului a esuat.' });
        setAvatarUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          await updateUserProfile({ photoURL: downloadURL });
          setMessage({ type: 'success', text: 'Avatar actualizat cu succes.' });
        } catch (error) {
          console.error('Failed to save avatar:', error);
          setMessage({ type: 'error', text: 'Salvarea avatarului a esuat.' });
        } finally {
          setAvatarUploading(false);
          setUploadProgress(0);
        }
      }
    );
  };

  const boxVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
      <Container maxWidth="md" sx={{ flex: 1, py: 6 }}>
        <motion.div initial="hidden" animate="visible" variants={boxVariants}>
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
            <Stack spacing={4}>
              <Box display="flex" alignItems="center" gap={2}>
                <Icon icon="mdi:account-circle-outline" width={40} height={40} color={theme.palette.primary.main} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    Profil personal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actualizeaza-ti numele afisat si avatarul vizibil in platforma.
                  </Typography>
                </Box>
              </Box>

              {message && (
                <Alert severity={message.type} onClose={() => setMessage(null)}>
                  {message.text}
                </Alert>
              )}

              <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      height: '100%',
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      <Avatar
                        src={currentUser?.photoURL || ''}
                        alt={currentUser?.displayName || ''}
                        sx={{ width: 140, height: 140, border: `4px solid ${theme.palette.primary.light}` }}
                      />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {currentUser?.displayName || 'Utilizator'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentUser?.email}
                      </Typography>
                      <Button
                        component="label"
                        variant="contained"
                        disabled={avatarUploading}
                        startIcon={<Icon icon="mdi:cloud-upload" />}
                        sx={{ textTransform: 'none' }}
                      >
                        {avatarUploading ? 'Se incarca...' : 'Actualizeaza avatar'}
                        <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                      </Button>
                      {avatarUploading && (
                        <Box width="100%">
                          <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 10 }} />
                          <Typography variant="caption" color="text.secondary">
                            {uploadProgress}% complet
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      height: '100%',
                    }}
                  >
                    <Stack spacing={3} component="form" onSubmit={handleProfileSave}>
                      <Typography variant="h6" fontWeight={600}>
                        Date profil
                      </Typography>
                      <TextField
                        label="Nume afisat"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        fullWidth
                        required
                      />
                      <TextField label="Email" value={currentUser?.email || ''} disabled fullWidth />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={<Icon icon="mdi:content-save" />}
                        sx={{ textTransform: 'none' }}
                      >
                        {loading ? 'Se salveaza...' : 'Salveaza modificarile'}
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
      <Footer />
    </Box>
  );
};

export default User;
