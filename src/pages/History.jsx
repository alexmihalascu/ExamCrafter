import React, { useState, useEffect } from 'react';
import {
  Container, Box, Paper, Typography, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  CircularProgress, Alert, useTheme, Pagination, Select, MenuItem,
  IconButton, Tooltip, Stack, LinearProgress, Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import Chart from 'react-apexcharts';
import CountUp from 'react-countup';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Quiz type mapping object
const quizTypeMap = {
  all: 'Aleatoare (45 întrebări din toate categoriile)',
  category1: 'Realizarea aplicațiilor cu baze de date MS ACCESS Teste grilă rezolvate',
  category2: 'Realizarea aplicațiilor cu baze de date MS ACCESS Teste grilă propuse spre rezolvare',
  category3: 'Realizarea aplicațiilor cu baze de date ORACLE SQL Teste grilă rezolvate',
  category4: 'Realizarea aplicațiilor cu baze de date ORACLE SQL Teste grilă propuse spre rezolvare',
  category5: 'Proiectarea sistemelor informatice Teste grilă rezolvate',
  category6: 'Proiectarea sistemelor informatice Teste grilă propuse spre rezolvare',
  category7: 'Arhitectura calculatoarelor, sisteme de operare și rețele de calculatoare Teste grilă rezolvate',
  category8: 'Arhitectura calculatoarelor, sisteme de operare și rețele de calculatoare Teste grilă propuse spre rezolvare',
  category9: 'Programare C# Teste grilă rezolvate',
  category10: 'Programare C# Teste grilă propuse spre rezolvare',
};

const StatCard = ({ title, value, subtitle, color }) => {
  const theme = useTheme();
  const showDecimals = title === "Medie Răspunsuri";
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: '160px',
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          border: `1px solid ${color}20`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h4" sx={{ color, fontWeight: 700, mb: 1 }}>
          <CountUp 
            end={value} 
            duration={2} 
            decimals={showDecimals ? 2 : 0}
          />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
            {subtitle}
          </Typography>
        )}
      </Paper>
    </motion.div>
  );
};

// Chart Card Component
const ChartCard = ({ title, children }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {children}
    </Paper>
  );
};

const History = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);
        const resultsRef = collection(db, 'results');
        const q = query(
          resultsRef,
          where('user_id', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().timestamp || doc.data().created_at // Support both field names
        }));

        // Sort by timestamp/created_at in descending order
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setHistory(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  const stats = {
    totalTests: history.length,
    passedTests: history.filter(test => test.passed).length,
    correctAnswers: history.reduce((acc, test) => acc + (test.correct_answers || 0), 0),
    totalQuestions: history.reduce((acc, test) => acc + (test.total_questions || (test.quiz_type === 'all' ? 45 : 40)), 0)
  };

  stats.passRate = stats.totalTests ? (stats.passedTests / stats.totalTests) * 100 : 0;
  stats.averageScore = stats.totalTests ? stats.correctAnswers / stats.totalTests : 0;

  const getSortedAndPaginatedHistory = () => {
    const sorted = [...history].sort((a, b) => {
      if (sortConfig.key === 'timestamp' || sortConfig.key === 'created_at') {
        return sortConfig.direction === 'desc'
          ? new Date(b.created_at) - new Date(a.created_at)
          : new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortConfig.key === 'correct_answers') {
        return sortConfig.direction === 'desc'
          ? (b.correct_answers || 0) - (a.correct_answers || 0)
          : (a.correct_answers || 0) - (b.correct_answers || 0);
      }
      return 0;
    });

    return sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  };
  // Chart configurations
  const chartConfigs = {
    pieChart: {
      options: {
        chart: {
          background: 'transparent',
        },
        colors: [theme.palette.primary.main, theme.palette.error.main],
        labels: ['Răspunsuri Corecte', 'Răspunsuri Greșite'],
        theme: { mode: theme.palette.mode },
        stroke: { width: 0 },
        legend: {
          position: 'bottom',
          labels: { colors: theme.palette.text.primary }
        }
      },
      series: [stats.correctAnswers, stats.totalQuestions - stats.correctAnswers]
    },
    barChart: {
      options: {
        chart: {
          background: 'transparent',
          toolbar: { show: false }
        },
        colors: [theme.palette.primary.main],
        xaxis: {
          categories: ['Total Teste', 'Teste Promovate'],
          labels: { style: { colors: theme.palette.text.primary } }
        },
        yaxis: {
          labels: { style: { colors: theme.palette.text.primary } }
        },
        grid: {
          borderColor: theme.palette.divider
        }
      },
      series: [{
        name: 'Teste',
        data: [stats.totalTests, stats.passedTests]
      }]
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 4
            }}
          >
            Istoric Teste
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Teste"
                value={stats.totalTests}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Teste Promovate"
                value={stats.passedTests}
                subtitle={`${stats.passRate.toFixed(1)}% rată de promovare`}
                color={theme.palette.success.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Răspunsuri Corecte"
                value={stats.correctAnswers}
                subtitle={`din ${stats.totalQuestions} întrebări`}
                color={theme.palette.info.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Medie Răspunsuri"
                value={stats.averageScore}
                subtitle="răspunsuri corecte per test"
                color={theme.palette.warning.main}
              />
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <ChartCard title="Distribuție Răspunsuri">
                <Chart
                  options={chartConfigs.pieChart.options}
                  series={chartConfigs.pieChart.series}
                  type="donut"
                  height={300}
                />
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard title="Performanță Teste">
                <Chart
                  options={chartConfigs.barChart.options}
                  series={chartConfigs.barChart.series}
                  type="bar"
                  height={300}
                />
              </ChartCard>
            </Grid>
          </Grid>
          

          <Box sx={{ mt: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="h5">Istoric Detaliat</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
  <Select
    value={rowsPerPage}
    onChange={(e) => {
      setRowsPerPage(parseInt(e.target.value));
      setPage(1);
    }}
    size="small"
    sx={{ minWidth: 120 }}
  >
    <MenuItem value={5}>5 pe pagină</MenuItem>
    <MenuItem value={10}>10 pe pagină</MenuItem>
    <MenuItem value={25}>25 pe pagină</MenuItem>
  </Select>
  
  <Tooltip title="Sortare după dată">
  <IconButton
    onClick={() => setSortConfig({
      key: 'timestamp',
      direction: (sortConfig.key === 'timestamp' || sortConfig.key === 'created_at') && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    })}
    sx={{
      color: (sortConfig.key === 'timestamp' || sortConfig.key === 'created_at') ? 'primary.main' : 'text.secondary'
    }}
  >
    <Icon
      icon={(sortConfig.key === 'timestamp' || sortConfig.key === 'created_at')
        ? (sortConfig.direction === 'desc'
          ? 'mdi:sort-calendar-descending'
          : 'mdi:sort-calendar-ascending')
        : 'mdi:calendar'
      }
      width="24"
      height="24"
    />
  </IconButton>
</Tooltip>

  <Tooltip title="Sortare după scor">
    <IconButton
      onClick={() => setSortConfig({
        key: 'correct_answers',
        direction: sortConfig.key === 'correct_answers' && sortConfig.direction === 'desc' ? 'asc' : 'desc'
      })}
      sx={{
        color: sortConfig.key === 'correct_answers' ? 'primary.main' : 'text.secondary'
      }}
    >
      <Icon 
        icon={`mdi:sort-numeric${sortConfig.key === 'correct_answers' ? 
          (sortConfig.direction === 'desc' ? '-descending' : '-ascending') : ''}`}
        width="24"
        height="24"
      />
    </IconButton>
  </Tooltip>
</Stack>
            </Box>

            <Grid container spacing={2}>
              <AnimatePresence>
                {getSortedAndPaginatedHistory().map((entry, index) => (
                  <Grid item xs={12} key={entry.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                  >
                     <Card
                      onClick={() => setSelectedEntry(entry)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                        <CardContent>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" gutterBottom>
                                {quizTypeMap[entry.quiz_type]}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(entry.created_at).toLocaleDateString('ro-RO', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Typography variant="h5" align="center">
                                {entry.correct_answers}/{entry.total_questions || (entry.quiz_type === 'all' ? 45 : 40)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" align="center">
                                Răspunsuri Corecte
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  textAlign: 'center',
                                  bgcolor: entry.passed ? 'success.main' : 'error.main',
                                  color: 'white'
                                }}
                              >
                                {entry.passed ? 'PROMOVAT' : 'NEPROMOVAT'}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(history.length / rowsPerPage)}
                page={page}
                onChange={(event, newPage) => setPage(newPage)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          </Box>
        </motion.div>
      </Box>

      <Dialog
  open={Boolean(selectedEntry)}
  onClose={() => setSelectedEntry(null)}
  maxWidth="md"
  fullWidth
  PaperProps={{
    elevation: 0,
    sx: { 
      borderRadius: 2,
      background: `linear-gradient(135deg, 
        ${theme.palette.background.paper} 0%, 
        ${theme.palette.background.default} 100%)`
    }
  }}
>
  <DialogTitle>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Icon 
        icon={selectedEntry?.passed ? "mdi:trophy" : "mdi:alert-circle"}
        width={32}
        height={32}
        color={selectedEntry?.passed ? theme.palette.success.main : theme.palette.error.main}
      />
      <Box>
        <Typography variant="h5" gutterBottom={false}>Detalii Test</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(selectedEntry?.created_at).toLocaleDateString('ro-RO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
      </Box>
    </Stack>
  </DialogTitle>
  <Divider />
  <DialogContent>
    {selectedEntry && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 2,
                bgcolor: selectedEntry.passed ? 'success.main' : 'error.main',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Icon 
                  icon={selectedEntry.passed ? "mdi:check-decagram" : "mdi:close-circle"} 
                  width={24} 
                  height={24}
                />
                <Typography variant="h6">
                  {selectedEntry.passed ? 'Test Promovat' : 'Test Nepromovat'}
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Categorie Test
            </Typography>
            <Typography variant="body1" paragraph>
              {quizTypeMap[selectedEntry.quiz_type]}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Statistici Test
                </Typography>
                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Total Întrebări</Typography>
                      <Typography variant="h6">
                        {selectedEntry.total_questions || (selectedEntry.quiz_type === 'all' ? 45 : 40)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Răspunsuri Corecte</Typography>
                      <Typography variant="h6" color="primary.main">
                        <CountUp end={selectedEntry.correct_answers} duration={1} />
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Data și Ora
      </Typography>
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Data Test</Typography>
            <Typography variant="h6">
              {new Date(selectedEntry.created_at).toLocaleDateString('ro-RO', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Ora Test</Typography>
            <Typography variant="h6" color="text.primary">
              {new Date(selectedEntry.created_at).toLocaleTimeString('ro-RO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Progres și Performanță
            </Typography>
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2 }}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Rată de Succes
                    </Typography>
                    <Typography variant="h6" color={selectedEntry.passed ? 'success.main' : 'error.main'}>
                      <CountUp
                        end={(selectedEntry.correct_answers / (selectedEntry.total_questions || (selectedEntry.quiz_type === 'all' ? 45 : 40))) * 100}
                        duration={1.5}
                        decimals={1}
                        suffix="%"
                      />
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(selectedEntry.correct_answers / (selectedEntry.total_questions || (selectedEntry.quiz_type === 'all' ? 45 : 40))) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: selectedEntry.passed ? 'success.main' : 'error.main'
                      }
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Răspunsuri Incorecte
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    <CountUp
                      end={(selectedEntry.total_questions || (selectedEntry.quiz_type === 'all' ? 45 : 40)) - selectedEntry.correct_answers}
                      duration={1}
                    />
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    )}
  </DialogContent>
  <DialogActions sx={{ p: 2.5 }}>
    <Button 
      onClick={() => setSelectedEntry(null)}
      variant="contained"
      startIcon={<Icon icon="mdi:close" />}
      sx={{ 
        borderRadius: 2,
        textTransform: 'none',
        px: 3
      }}
    >
      Închide
    </Button>
  </DialogActions>
</Dialog>
    </Container>
  );
};

export default History;