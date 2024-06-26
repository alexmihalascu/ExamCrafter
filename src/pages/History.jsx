import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useUser } from '@clerk/clerk-react';
import {
  Typography, Paper, Card, CardContent, Grid, Container, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

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

const History = () => {
  const { user } = useUser();
  const theme = useTheme();
  const [history, setHistory] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryStats, setCategoryStats] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user && user.id) {
        try {
          const { data, error } = await supabase
            .from('results')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }
          setHistory(data);
          setAnimationKey(prevKey => prevKey + 1); // Update the key to trigger re-animation
        } catch (error) {
          console.error('Error fetching history:', error);
        }
      }
    };

    fetchHistory();
  }, [user]);

  const getTotalQuestions = (quizType) => {
    return quizType === 'all' ? 45 : 40;
  };

  const correctAnswers = history.reduce((acc, entry) => acc + entry.correct_answers, 0);
  const totalQuestions = history.reduce((acc, entry) => acc + getTotalQuestions(entry.quiz_type), 0);
  const incorrectAnswers = totalQuestions - correctAnswers;
  const passedTests = history.filter(entry => entry.passed).length;
  const totalTests = history.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const averageCorrectAnswers = totalTests > 0 ? (correctAnswers / totalTests) : 0;

  const categoriesCount = Object.keys(quizTypeMap).reduce((acc, key) => {
    acc[key] = history.filter(entry => entry.quiz_type === key).length;
    return acc;
  }, {});

  const textColor = theme.palette.mode === 'dark' ? '#ffffff' : '#000000';
  const backgroundColor = theme.palette.background.paper;

  const categoriesChartOptions = {
    chart: {
      type: 'pie',
      background: 'transparent',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const categoryKey = Object.keys(quizTypeMap)[config.dataPointIndex];
          setSelectedCategory(categoryKey);
          calculateCategoryStats(categoryKey);
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
    },
    labels: Object.keys(categoriesCount).map(key => quizTypeMap[key]),
    legend: {
      show: false
    },
    theme: {
      mode: theme.palette.mode
    },
    dataLabels: {
      style: {
        colors: [textColor]
      }
    }
  };

  const categoriesChartSeries = Object.values(categoriesCount);

  const pieChartOptions = {
    chart: {
      type: 'pie',
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    labels: ['Corecte', 'Greșite'],
    theme: {
      mode: theme.palette.mode
    },
    dataLabels: {
      style: {
        colors: [textColor]
      }
    }
  };

  const pieChartSeries = [correctAnswers, incorrectAnswers];

  const barChartOptions = {
    chart: {
      type: 'bar',
      background: backgroundColor,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    xaxis: {
      categories: ['Număr Teste', 'Teste Promovate'],
      labels: {
        style: {
          colors: [textColor]
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: [textColor]
        }
      }
    },
    theme: {
      mode: theme.palette.mode
    },
    dataLabels: {
      style: {
        colors: [textColor]
      }
    }
  };

  const barChartSeries = [{
    name: 'Valori',
    data: [totalTests, passedTests],
  }];

  const averageChartOptions = {
    chart: {
      type: 'bar',
      background: backgroundColor,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    xaxis: {
      categories: ['Media Răspunsurilor Corecte'],
      labels: {
        style: {
          colors: [textColor]
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: [textColor]
        }
      }
    },
    theme: {
      mode: theme.palette.mode
    },
    dataLabels: {
      style: {
        colors: [textColor]
      }
    }
  };

  const averageChartSeries = [{
    name: 'Media',
    data: [averageCorrectAnswers],
  }];

  const handleCardClick = (entry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDialog = () => {
    setSelectedEntry(null);
  };

  const calculateCategoryStats = (categoryKey) => {
    const categoryHistory = history.filter(entry => entry.quiz_type === categoryKey);
    const correctAnswersCategory = categoryHistory.reduce((acc, entry) => acc + entry.correct_answers, 0);
    const totalTestsCategory = categoryHistory.length;
    const passedTestsCategory = categoryHistory.filter(entry => entry.passed).length;
    const passRateCategory = totalTestsCategory > 0 ? (passedTestsCategory / totalTestsCategory) * 100 : 0;

    setCategoryStats({
      correctAnswers: correctAnswersCategory,
      totalTests: totalTestsCategory,
      passedTests: passedTestsCategory,
      passRate: passRateCategory,
    });
  };

  useEffect(() => {
    if (selectedCategory) {
      calculateCategoryStats(selectedCategory);
    }
  }, [selectedCategory, history]);

  return (
    <Container maxWidth="md">
      <Paper style={{ padding: '20px', textAlign: 'center', backgroundColor: backgroundColor }}>
        <Typography variant="h4" gutterBottom>Istoric Răspunsuri</Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={6}>
            <motion.div key={`pieChart-${animationKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <Chart options={pieChartOptions} series={pieChartSeries} type="pie" width="100%" />
            </motion.div>
            <Typography variant="body1" align="center">Procentajul de răspunsuri corecte și greșite</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div key={`categoriesChart-${animationKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <Chart options={categoriesChartOptions} series={categoriesChartSeries} type="pie" width="85%" />
            </motion.div>
            <Typography variant="body1" align="center">Categorii de teste efectuate</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div key={`barChart-${animationKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <Chart options={barChartOptions} series={barChartSeries} type="bar" width="100%" />
            </motion.div>
            <Typography variant="body1" align="center">Numărul total de teste efectuate și teste promovate</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div key={`averageChart-${animationKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <Chart options={averageChartOptions} series={averageChartSeries} type="bar" width="100%" />
            </motion.div>
            <Typography variant="body1" align="center">Media răspunsurilor corecte</Typography>
          </Grid>
        </Grid>
        <Box mt={4}>
          <Grid container spacing={3}>
            {history.map((entry, index) => (
              <Grid item xs={12} key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card onClick={() => handleCardClick(entry)} style={{ cursor: 'pointer' }}>
                    <CardContent>
                      <Typography variant="h6">Tip Grilă: {quizTypeMap[entry.quiz_type]}</Typography>
                      <Typography>Răspunsuri corecte: {entry.correct_answers}</Typography>
                      <Typography>Admis: {entry.passed ? 'Da' : 'Nu'}</Typography>
                      <Typography>Data: {new Date(entry.created_at).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
      <Dialog open={Boolean(selectedEntry)} onClose={handleCloseDialog}>
        <DialogTitle>Detalii Test</DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <>
              <DialogContentText>Tip Grilă: {quizTypeMap[selectedEntry.quiz_type]}</DialogContentText>
              <DialogContentText>Răspunsuri corecte: {selectedEntry.correct_answers}</DialogContentText>
              <DialogContentText>Admis: {selectedEntry.passed ? 'Da' : 'Nu'}</DialogContentText>
              <DialogContentText>Data: {new Date(selectedEntry.created_at).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</DialogContentText>
              <Chart
                options={{
                  chart: { type: 'bar', background: backgroundColor },
                  xaxis: { categories: ['Întrebări', 'Răspunsuri Corecte'], labels: { style: { colors: [textColor] } } },
                  yaxis: { labels: { style: { colors: [textColor] } } },
                  theme: { mode: theme.palette.mode },
                  dataLabels: { style: { colors: [textColor] } }
                }}
                series={[{
                  name: 'Număr',
                  data: [getTotalQuestions(selectedEntry.quiz_type), selectedEntry.correct_answers],
                }]}
                type="bar"
                width="100%"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Închide</Button>
        </DialogActions>
      </Dialog>
      {selectedCategory && categoryStats && (
        <Dialog open={Boolean(selectedCategory)} onClose={() => setSelectedCategory('')}>
          <DialogTitle>Detalii Categorie</DialogTitle>
          <DialogContent>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <DialogContentText>{quizTypeMap[selectedCategory]}</DialogContentText>
              <DialogContentText>Total teste: <CountUp end={categoryStats.totalTests} duration={2} /></DialogContentText>
              <DialogContentText>Teste promovate: <CountUp end={categoryStats.passedTests} duration={2} /></DialogContentText>
              <DialogContentText>Rata de promovare: <CountUp end={categoryStats.passRate} duration={2} decimals={2} />%</DialogContentText>
              <DialogContentText>Total răspunsuri corecte: <CountUp end={categoryStats.correctAnswers} duration={2} /></DialogContentText>
            </motion.div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedCategory('')} color="primary">Închide</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default History;
