import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Container,
  Stack
} from '@mui/material';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import CountUp from 'react-countup';
import { useTheme } from '@mui/material/styles';

const accessMap = {
  owned: 'Set personal',
  shared: 'Set partajat',
  public: 'Set public',
};

const QuizResults = ({
  score,
  totalQuestions,
  onRestart,
  passed,
  questionSetName,
  questionSetAccess,
  questionSetVisibility,
  questionBundleName,
  questionBundleAccess,
  questionBundleVisibility,
}) => {
  const theme = useTheme();
  const incorrectAnswers = totalQuestions - score;
  const accessLabel = questionSetAccess ? accessMap[questionSetAccess] || 'Set personal' : null;
  const visibilityLabel = questionSetVisibility === 'public' ? 'Vizibilitate publică' : 'Vizibilitate privată';
  const bundleAccessLabel = questionBundleAccess ? accessMap[questionBundleAccess] || 'Grilă personală' : null;
  const bundleVisibilityLabel =
    questionBundleVisibility === 'public' ? 'Vizibilitate publică' : 'Vizibilitate privată';

  const pieChartOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
    },
    labels: ['Corecte', 'Greșite'],
    colors: [theme.palette.success.main, theme.palette.error.main],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              fontSize: '14px',
              fontWeight: '600',
              color: theme.palette.text.primary,
            },
            value: {
              fontSize: '20px',
              fontWeight: '700',
              color: theme.palette.text.primary,
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '18px',
              fontWeight: '700',
              color: theme.palette.text.primary,
              formatter: () => totalQuestions,
            },
          },
        },
      },
    },
    legend: {
      position: 'bottom',
      fontSize: '14px',
      labels: {
        colors: theme.palette.text.secondary,
      },
    },
  };

  const pieChartSeries = [score, incorrectAnswers];

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              background: `linear-gradient(135deg,
                ${theme.palette.background.paper} 0%,
                ${theme.palette.background.default} 100%)`,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack spacing={4} alignItems="center">
              <Icon
                icon={passed ? 'mdi:trophy' : 'mdi:alert-circle'}
                width={64}
                height={64}
                color={passed ? theme.palette.success.main : theme.palette.error.main}
              />

              <Typography variant="h4" align="center">
                {passed ? 'Felicitări!' : 'Mai încearcă!'}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h3" color="primary.main">
                      <CountUp end={score} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Răspunsuri corecte
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h3" color="error.main">
                      <CountUp end={incorrectAnswers} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Răspunsuri greșite
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {questionBundleName && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    width: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Grilă compusă
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {questionBundleName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[bundleAccessLabel, bundleVisibilityLabel].filter(Boolean).join(' / ')}
                  </Typography>
                </Paper>
              )}

              {questionSetName && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    width: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Set utilizat
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {questionSetName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[accessLabel, visibilityLabel].filter(Boolean).join(' / ')}
                  </Typography>
                </Paper>
              )}

              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <Chart
                  options={pieChartOptions}
                  series={pieChartSeries}
                  type="donut"
                  height={300}
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={onRestart}
                startIcon={<Icon icon="mdi:refresh" />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Începe un nou test
              </Button>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default QuizResults;
