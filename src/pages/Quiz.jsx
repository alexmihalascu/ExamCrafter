import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useUser } from '@clerk/clerk-react';
import Question from '../components/Question';
import {
  Button, CircularProgress, Typography, Box, Paper, Grid, Container, LinearProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import QuizSelection from '../components/QuizSelection';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';

const Quiz = () => {
  const { user } = useUser();
  const theme = useTheme();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [quizType, setQuizType] = useState('');
  const [answerValidation, setAnswerValidation] = useState({});
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('quizState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setQuestions(state.questions);
      setCurrentQuestionIndex(state.currentQuestionIndex);
      setAnswers(state.answers);
      setScore(state.score);
      setIncorrectAnswers(state.incorrectAnswers);
      setTimer(state.timer);
      setQuizType(state.quizType);
      setAnswerValidation(state.answerValidation);
      setAnswerSubmitted(state.answerSubmitted);
      setFinished(state.finished);
      setPassed(state.passed);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (quizType) {
      fetchQuestions();
    }
  }, [quizType]);

  useEffect(() => {
    if (questions.length > 0) {
      if (timer === 0) {
        setTimer(questions.length * 60); // 60 seconds per question
      }
      const countdown = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [questions, timer]);

  useEffect(() => {
    if (timer === 0 && questions.length > 0) {
      alert('Timpul a expirat!');
      handleFinishQuiz();
    }
  }, [timer]);

  useEffect(() => {
    if (!loading) {
      const state = {
        questions,
        currentQuestionIndex,
        answers,
        score,
        incorrectAnswers,
        timer,
        quizType,
        answerValidation,
        answerSubmitted,
        finished,
        passed,
      };
      localStorage.setItem('quizState', JSON.stringify(state));
    }
  }, [questions, currentQuestionIndex, answers, score, incorrectAnswers, timer, quizType, answerValidation, answerSubmitted, finished, passed, loading]);

  const fetchQuestions = async () => {
    try {
      let data;
      let error;
      if (quizType === 'all') {
        ({ data, error } = await supabase.rpc('get_random_questions'));
      } else {
        const categoryMap = {
          'category1': { start_id: 1000, end_id: 1040 },
          'category2': { start_id: 2000, end_id: 2040 },
          'category3': { start_id: 3000, end_id: 3040 },
          'category4': { start_id: 4000, end_id: 4040 },
          'category5': { start_id: 5000, end_id: 5040 },
          'category6': { start_id: 6000, end_id: 6040 },
          'category7': { start_id: 7000, end_id: 7040 },
          'category8': { start_id: 8000, end_id: 8040 },
          'category9': { start_id: 9000, end_id: 9040 },
          'category10': { start_id: 10000, end_id: 10040 }
        };
        const { start_id, end_id } = categoryMap[quizType];
        ({ data, error } = await supabase.rpc('get_random_questions_by_category', { start_id, end_id, limit_count: 40 }));
      }
      if (error) {
        throw error;
      }
      setQuestions(data);
      setLoading(false);
    } catch (error) {
      console.error('Eroare la preluarea întrebărilor:', error);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answers[currentQuestion.id] === currentQuestion.varianta_corecta;
    setAnswerValidation({ ...answerValidation, [currentQuestion.id]: isCorrect });
    setAnswerSubmitted(true);

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    } else {
      setIncorrectAnswers(prevIncorrect => prevIncorrect + 1);
    }
  };

  const handleNextQuestion = () => {
    setAnswerSubmitted(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    setFinished(true);
    localStorage.removeItem('quizState');
    const totalQuestions = questions.length;
    const passed = score >= totalQuestions / 2;
    setPassed(passed);
    if (user) {
      try {
        const { data, error } = await supabase
          .from('results')
          .insert([
            { user_id: user.id, quiz_type: quizType, correct_answers: score, passed: passed }
          ]);

        if (error) {
          console.error('Eroare la inserarea în tabelul results:', error);
        } else {
          console.log('Rezultate salvate cu succes:', data);
        }
      } catch (error) {
        console.error('Eroare la salvarea rezultatelor:', error);
      }
    } else {
      console.error('Utilizatorul nu este autentificat');
    }
  };

  const handleRestartQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setIncorrectAnswers(0);
    setFinished(false);
    setTimer(0);
    setQuizType('');
    setAnswerValidation({});
    setAnswerSubmitted(false);
    localStorage.removeItem('quizState');
  };

  const handleStartNewQuiz = (type) => {
    if (questions.length > 0 && currentQuestionIndex < questions.length - 1) {
      setShowDialog(true);
    } else {
      setQuizType(type);
    }
  };

  const handleConfirmNewQuiz = (type) => {
    setShowDialog(false);
    handleRestartQuiz();
    setQuizType(type);
  };

  const calculateProgress = () => {
    const totalTime = questions.length * 60; // 60 seconds per question
    return ((totalTime - timer) / totalTime) * 100;
  };

  const calculateQuestionProgress = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const textColor = theme.palette.mode === 'dark' ? '#ffffff' : '#000000';
  const backgroundColor = theme.palette.background.paper;

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

  const pieChartSeries = [score, incorrectAnswers];

  if (loading) return <CircularProgress />;

  if (quizType === '' && questions.length === 0) {
    return <QuizSelection onSelect={handleStartNewQuiz} />;
  }

  if (finished) {
    return (
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h5">
              Mulțumim pentru completarea chestionarului!
            </Typography>
            <Typography variant="h6">
              Scorul tău: <CountUp end={score} duration={2} /> din {questions.length}
            </Typography>
            <Typography variant="h6">
              {passed ? 'Felicitări, ai trecut testul!' : 'Îmi pare rău, nu ai trecut testul.'}
            </Typography>
            <Box display="flex" justifyContent="center">
              <Chart options={pieChartOptions} series={pieChartSeries} type="pie" width="380" />
            </Box>
            <Button variant="contained" color="primary" onClick={handleRestartQuiz}>
              Începe un nou chestionar
            </Button>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ padding: 3, textAlign: 'center' }}>
          <Typography variant="h4">Chestionar LICENȚĂ URA</Typography>
          <Box mb={2} display="flex" flexDirection="column" alignItems="center">
            <Typography variant="caption" component="div" color="textSecondary" sx={{ mt: 1 }}>
              Timp rămas: {formatTime(timer)}
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body1">Progres întrebări:</Typography>
            <LinearProgress variant="determinate" value={calculateQuestionProgress()} />
          </Box>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Paper sx={{ padding: 1, backgroundColor: 'success.light', borderRadius: 1 }}>
                <Typography variant="body1">Întrebări corecte: {score}</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ padding: 1, backgroundColor: 'error.light', borderRadius: 1 }}>
                <Typography variant="body1">Întrebări greșite: {incorrectAnswers}</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ padding: 1, backgroundColor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body1">Întrebări rămase: {questions.length - currentQuestionIndex - 1}</Typography>
              </Paper>
            </Grid>
          </Grid>
          {questions.length > 0 ? (
            <div>
              <Typography variant="h6">Grila {currentQuestionIndex + 1}: {questions[currentQuestionIndex].id}</Typography>
              <Question
                question={questions[currentQuestionIndex]}
                selectedAnswer={answers[questions[currentQuestionIndex].id] || ''}
                handleAnswerChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                answerValidation={answerValidation[questions[currentQuestionIndex].id]}
                answerSubmitted={answerSubmitted}
              />
              <Box mt={4}>
                {!answerSubmitted ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitAnswer}
                    disabled={!answers[questions[currentQuestionIndex].id]}
                  >
                    Trimite răspuns
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Următoarea' : 'Finalizează'}
                  </Button>
                )}
              </Box>
            </div>
          ) : (
            <Typography variant="h6">Nu există întrebări disponibile.</Typography>
          )}
        </Paper>
      </motion.div>
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Avertisment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ești deja într-un test. Vrei să continui testul curent sau să începi un nou test?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="primary">
            Continuă testul curent
          </Button>
          <Button onClick={() => handleConfirmNewQuiz(quizType)} color="primary" autoFocus>
            Începe un nou test
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Quiz;
