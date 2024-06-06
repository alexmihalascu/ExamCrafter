import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useUser } from '@clerk/clerk-react';
import { Typography, Paper, Card, CardContent, Grid, Container, Box } from '@mui/material';
import Chart from 'react-apexcharts';

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
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user && user.id) {
        try {
          const { data, error } = await supabase
            .from('results')
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            throw error;
          }
          setHistory(data);
        } catch (error) {
          console.error('Error fetching history:', error);
        }
      }
    };

    fetchHistory();
  }, [user]);

  const correctAnswers = history.reduce((acc, entry) => acc + entry.correct_answers, 0);
  const totalQuestions = history.length * 45; // Asumând că fiecare chestionar are 45 de întrebări
  const incorrectAnswers = totalQuestions - correctAnswers;
  const passedTests = history.filter(entry => entry.passed).length;
  const totalTests = history.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const averageCorrectAnswers = totalTests > 0 ? (correctAnswers / totalTests) : 0;

  const pieChartOptions = {
    chart: {
      type: 'pie',
    },
    labels: ['Corecte', 'Greșite'],
  };

  const pieChartSeries = [correctAnswers, incorrectAnswers];

  const barChartOptions = {
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['Număr Teste', 'Rata de Promovare'],
    },
  };

  const barChartSeries = [{
    name: 'Valori',
    data: [totalTests, passRate],
  }];

  const averageChartOptions = {
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['Media Răspunsurilor Corecte'],
    },
  };

  const averageChartSeries = [{
    name: 'Media',
    data: [averageCorrectAnswers],
  }];

  const passedChartOptions = {
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['Numărul de Teste Trecute'],
    },
  };

  const passedChartSeries = [{
    name: 'Trecute',
    data: [passedTests],
  }];

  return (
    <Container maxWidth="md">
      <Paper style={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Istoric Răspunsuri</Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Chart options={pieChartOptions} series={pieChartSeries} type="pie" width="100%" />
            <Typography variant="body1" align="center">Procentajul de răspunsuri corecte și greșite</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Chart options={barChartOptions} series={barChartSeries} type="bar" width="100%" />
            <Typography variant="body1" align="center">Numărul total de teste efectuate și rata de promovare</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Chart options={averageChartOptions} series={averageChartSeries} type="bar" width="100%" />
            <Typography variant="body1" align="center">Media răspunsurilor corecte</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Chart options={passedChartOptions} series={passedChartSeries} type="bar" width="100%" />
            <Typography variant="body1" align="center">Numărul de teste trecute</Typography>
          </Grid>
        </Grid>
        <Box mt={4}>
          <Grid container spacing={3}>
            {history.map((entry, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Tip Grilă: {quizTypeMap[entry.quiz_type]}</Typography>
                    <Typography>Răspunsuri corecte: {entry.correct_answers}</Typography>
                    <Typography>Admis: {entry.passed ? 'Da' : 'Nu'}</Typography>
                    <Typography>Data: {new Date(entry.created_at).toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default History;
