import React, { useState, useEffect } from 'react';
import {
  Container, Box, Paper, Typography, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  CircularProgress, Alert, useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Chart from 'react-apexcharts';
import CountUp from 'react-countup';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../supabase/supabaseClient';

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

// Stat Card Component
const StatCard = ({ title, value, subtitle, color }) => {
  const theme = useTheme();
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: '100%',
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          border: `1px solid ${color}20`,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" sx={{ color, fontWeight: 700, mb: 1 }}>
          <CountUp end={value} duration={2} decimals={2} />
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
  const { user } = useUser();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryStats, setCategoryStats] = useState(null);

  // Fetch history data
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Calculate statistics
  const stats = {
    totalTests: history.length,
    passedTests: history.filter(test => test.passed).length,
    correctAnswers: history.reduce((acc, test) => acc + test.correct_answers, 0),
    totalQuestions: history.reduce((acc, test) => acc + (test.quiz_type === 'all' ? 45 : 40), 0)
  };

  stats.passRate = stats.totalTests ? (stats.passedTests / stats.totalTests) * 100 : 0;
  stats.averageScore = stats.totalTests ? stats.correctAnswers / stats.totalTests : 0;

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
            <Typography variant="h5" gutterBottom>Istoric Detaliat</Typography>
            <Grid container spacing={2}>
              <AnimatePresence>
                {history.map((entry, index) => (
                  <Grid item xs={12} key={entry.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[4],
                            borderColor: theme.palette.primary.main
                          }
                        }}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <CardContent>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" gutterBottom>
                                {quizTypeMap[entry.quiz_type]}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(entry.created_at).toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Typography variant="h5" align="center">
                                {entry.correct_answers}/
                                {entry.quiz_type === 'all' ? 45 : 40}
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
          </Box>
        </motion.div>
      </Box>

      <Dialog
        open={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Detalii Test
        </DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {quizTypeMap[selectedEntry.quiz_type]}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Data: {new Date(selectedEntry.created_at).toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Răspunsuri corecte: {selectedEntry.correct_answers}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Status: {selectedEntry.passed ? 'Promovat' : 'Nepromovat'}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Chart
                  options={{
                    ...chartConfigs.barChart.options,
                    xaxis: {
                      categories: ['Total Întrebări', 'Răspunsuri Corecte']
                    }
                  }}
                  series={[{
                    name: 'Rezultat',
                    data: [
                      selectedEntry.quiz_type === 'all' ? 45 : 40,
                      selectedEntry.correct_answers
                    ]
                  }]}
                  type="bar"
                  height={200}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEntry(null)}>
            Închide
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default History;