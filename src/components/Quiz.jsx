import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import Question from '../components/Question';
import { Button, CircularProgress, Typography, Box, Paper, Grid, Container } from '@mui/material';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(2700); // 45 minutes

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/intrebari');
        if (!response.ok) {
          throw new Error('Răspunsul rețelei nu a fost OK');
        }
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      alert('Timpul a expirat!');
      handleSubmitQuiz();
    }
  }, [timer]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!answers[currentQuestion.id]) {
      alert('Te rog să selectezi un răspuns înainte de a continua.');
      return;
    }
    if (answers[currentQuestion.id] === currentQuestion.varianta_corecta) {
      setScore(prevScore => prevScore + 1);
    } else {
      setIncorrectAnswers(prevIncorrect => prevIncorrect + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setFinished(true);
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    alert(`Chestionarul a fost finalizat! Scorul tău este ${score} din ${questions.length}`);
  };

  const handleRestartQuiz = () => {
    setAnswers({});
    setScore(0);
    setIncorrectAnswers(0);
    setFinished(false);
    setCurrentQuestionIndex(0);
    setTimer(2700); // Reset timer
  };

  if (loading) return <CircularProgress />;

  if (finished) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ padding: 3, textAlign: 'center', borderRadius: 2, marginTop: 3 }}>
          <Typography variant="h5">Mulțumim pentru completarea chestionarului!</Typography>
          <Typography variant="h6">Scorul tău: {score} din {questions.length}</Typography>
          <Button variant="contained" color="primary" onClick={handleRestartQuiz} sx={{ marginTop: 2 }}>
            Începe o grilă nouă
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ padding: 3, textAlign: 'center', marginTop: 3, borderRadius: 2 }}>
        <Typography variant="h4">Chestionar LICENȚĂ URA</Typography>
        <Box mb={2}>
          <Typography variant="body1">Timp rămas: {Math.floor(timer / 60)}:{timer % 60}</Typography>
        </Box>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Paper sx={{ padding: 2, backgroundColor: '#d4edda', borderColor: '#c3e6cb' }}>
              <Typography variant="body1">Întrebări corecte: {score}</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper sx={{ padding: 2, backgroundColor: '#f8d7da', borderColor: '#f5c6cb' }}>
              <Typography variant="body1">Întrebări greșite: {incorrectAnswers}</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper sx={{ padding: 2, backgroundColor: '#fff3cd', borderColor: '#ffeeba' }}>
              <Typography variant="body1">Întrebări rămase: {questions.length - currentQuestionIndex - 1}</Typography>
            </Paper>
          </Grid>
        </Grid>
        {questions.length > 0 ? (
          <div>
            <Typography variant="h6">Întrebarea {currentQuestionIndex + 1} din {questions.length}</Typography>
            <Question
              question={questions[currentQuestionIndex]}
              selectedAnswer={answers[questions[currentQuestionIndex].id] || ''}
              handleAnswerChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
            />
            <Box mt={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextQuestion}
                disabled={!answers[questions[currentQuestionIndex].id]}
              >
                {currentQuestionIndex < questions.length - 1 ? 'Următoarea' : 'Finalizează'}
              </Button>
            </Box>
          </div>
        ) : (
          <Typography variant="h6">Nu există întrebări disponibile.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Quiz;
