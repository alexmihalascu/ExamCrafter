import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, query, limit } from 'firebase/firestore';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Footer from '../components/Footer';

const Admin = () => {
  const theme = useTheme();
  const { currentUser, isAdmin } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ totalQuestions: 0, totalUsers: 0 });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, questionId: null });

  useEffect(() => {
    if (isAdmin()) {
      fetchQuestions();
      fetchStats();
    }
  }, []);

  const fetchQuestions = async () => {
    try {
      const q = query(collection(db, 'intrebari'), limit(100));
      const querySnapshot = await getDocs(q);
      const questionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching questions:', error);
      showSnackbar('Eroare la încărcarea întrebărilor', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const questionsSnapshot = await getDocs(collection(db, 'intrebari'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      setStats({
        totalQuestions: questionsSnapshot.size,
        totalUsers: usersSnapshot.size,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      let parsedData = [];

      if (file.name.endsWith('.json')) {
        // Parse JSON
        const text = await file.text();
        parsedData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            parsedData = results.data;
            await importQuestions(parsedData);
          },
          error: (error) => {
            showSnackbar('Eroare la parsarea CSV: ' + error.message, 'error');
            setLoading(false);
          }
        });
        return; // Exit early as Papa.parse is async
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Parse Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        showSnackbar('Format de fișier nesuportat. Folosește JSON, CSV sau Excel.', 'error');
        setLoading(false);
        return;
      }

      await importQuestions(parsedData);
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('Eroare la încărcarea fișierului: ' + error.message, 'error');
      setLoading(false);
    }
  };

  const importQuestions = async (data) => {
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of data) {
        try {
          // Validate required fields
          if (!item.intrebare || !item.varianta_a || !item.raspuns_corect) {
            errorCount++;
            continue;
          }

          await addDoc(collection(db, 'intrebari'), {
            intrebare: item.intrebare,
            varianta_a: item.varianta_a,
            varianta_b: item.varianta_b || '',
            varianta_c: item.varianta_c || '',
            raspuns_corect: item.raspuns_corect,
            createdAt: new Date().toISOString(),
          });
          successCount++;
        } catch (error) {
          console.error('Error importing question:', error);
          errorCount++;
        }
      }

      showSnackbar(
        `Import finalizat: ${successCount} întrebări adăugate, ${errorCount} erori`,
        errorCount > 0 ? 'warning' : 'success'
      );

      fetchQuestions();
      fetchStats();
    } catch (error) {
      console.error('Error importing questions:', error);
      showSnackbar('Eroare la importul întrebărilor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteDoc(doc(db, 'intrebari', questionId));
      showSnackbar('Întrebare ștearsă cu succes', 'success');
      fetchQuestions();
      fetchStats();
      setDeleteDialog({ open: false, questionId: null });
    } catch (error) {
      console.error('Error deleting question:', error);
      showSnackbar('Eroare la ștergerea întrebării', 'error');
    }
  };

  const downloadTemplate = (format) => {
    const template = [
      {
        intrebare: 'Exemplu de întrebare?',
        varianta_a: 'Răspuns A',
        varianta_b: 'Răspuns B',
        varianta_c: 'Răspuns C',
        raspuns_corect: 'a'
      }
    ];

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_intrebari.json';
      a.click();
    } else if (format === 'csv') {
      const csv = Papa.unparse(template);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_intrebari.csv';
      a.click();
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(template);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Intrebari');
      XLSX.writeFile(workbook, 'template_intrebari.xlsx');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.default }}>
      <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Icon icon="mdi:shield-crown" width={40} height={40} color={theme.palette.primary.main} />
              <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }}>
                Admin Dashboard
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Gestionează întrebările și monitorizează platforma
            </Typography>
          </Paper>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                    <Icon icon="mdi:help-circle" width={48} height={48} />
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.totalQuestions}
                      </Typography>
                      <Typography variant="body1">
                        Total Întrebări
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                    <Icon icon="mdi:account-group" width={48} height={48} />
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.totalUsers}
                      </Typography>
                      <Typography variant="body1">
                        Total Utilizatori
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={2} sx={{ borderRadius: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Import Întrebări" icon={<Icon icon="mdi:upload" />} iconPosition="start" />
              <Tab label="Gestionare Întrebări" icon={<Icon icon="mdi:format-list-bulleted" />} iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 4 }}>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Import Întrebări din Fișier
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Încarcă întrebări în format JSON, CSV sau Excel. Fișierul trebuie să conțină coloanele: intrebare, varianta_a, varianta_b, varianta_c, raspuns_corect
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Descarcă template:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Icon icon="mdi:code-json" />}
                        onClick={() => downloadTemplate('json')}
                      >
                        JSON
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Icon icon="mdi:file-delimited" />}
                        onClick={() => downloadTemplate('csv')}
                      >
                        CSV
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Icon icon="mdi:file-excel" />}
                        onClick={() => downloadTemplate('xlsx')}
                      >
                        Excel
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:upload" />}
                      disabled={loading}
                    >
                      {loading ? 'Se încarcă...' : 'Încarcă Fișier'}
                      <input
                        type="file"
                        hidden
                        accept=".json,.csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                      />
                    </Button>
                  </Box>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Toate Întrebările ({questions.length})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Icon icon="mdi:refresh" />}
                      onClick={fetchQuestions}
                    >
                      Reîncarcă
                    </Button>
                  </Box>

                  <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Întrebare</TableCell>
                          <TableCell>Varianta A</TableCell>
                          <TableCell>Varianta B</TableCell>
                          <TableCell>Varianta C</TableCell>
                          <TableCell>Răspuns Corect</TableCell>
                          <TableCell align="right">Acțiuni</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {questions.map((question) => (
                          <TableRow key={question.id} hover>
                            <TableCell sx={{ maxWidth: 300 }}>{question.intrebare}</TableCell>
                            <TableCell>{question.varianta_a}</TableCell>
                            <TableCell>{question.varianta_b}</TableCell>
                            <TableCell>{question.varianta_c}</TableCell>
                            <TableCell>{question.raspuns_corect?.toUpperCase()}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                color="error"
                                onClick={() => setDeleteDialog({ open: true, questionId: question.id })}
                              >
                                <Icon icon="mdi:delete" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>

      <Footer />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, questionId: null })}
      >
        <DialogTitle>Confirmă Ștergerea</DialogTitle>
        <DialogContent>
          <Typography>
            Ești sigur că vrei să ștergi această întrebare? Acțiunea este ireversibilă.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, questionId: null })}>
            Anulează
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleDeleteQuestion(deleteDialog.questionId)}
          >
            Șterge
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Admin;
