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
      handleFinishQuiz();
    }
  }, [timer]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/intrebari');
      if (!response.ok) {
        throw new Error('Răspunsul rețelei nu a fost OK');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Eroare la preluarea întrebărilor:', error);
    } finally {
      setLoading(false);
    }
  };

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
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    setFinished(true);
  };

  const handleRestartQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setIncorrectAnswers(0);
    setFinished(false);
    setTimer(2700);
    fetchQuestions();
  };

  if (loading) return <CircularProgress />;

  if (finished) {
    return (
      <Container maxWidth="md">
        <Paper style={{ padding: '20px', textAlign: 'center' }}>
          <Typography variant="h5">Mulțumim pentru completarea chestionarului!</Typography>
          <Typography variant="h6">Scorul tău: {score} din {questions.length}</Typography>
          <Button variant="contained" color="primary" onClick={handleRestartQuiz}>
            Începe un nou chestionar
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper style={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h4">Chestionar LICENȚĂ URA</Typography>
        <Box mb={2}>
          <Typography variant="body1">Timp rămas: {Math.floor(timer / 60)}:{timer % 60}</Typography>
        </Box>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Paper style={{ padding: '10px', backgroundColor: '#e0f7fa', borderRadius: '8px' }}>
              <Typography variant="body1">Întrebări corecte: {score}</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper style={{ padding: '10px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
              <Typography variant="body1">Întrebări greșite: {incorrectAnswers}</Typography>
            </Paper>
          </Grid>
          <Grid item>
          <Paper style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
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
