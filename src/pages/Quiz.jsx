import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useUser } from '@clerk/clerk-react';
import Question from '../components/Question';
import { Button, CircularProgress, Typography, Box, Paper, Grid, Container, LinearProgress } from '@mui/material';
import QuizSelection from '../components/QuizSelection';

const Quiz = () => {
  const { user } = useUser();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(2700); // 45 minutes
  const [quizType, setQuizType] = useState('');
  const [answerValidation, setAnswerValidation] = useState({});
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  useEffect(() => {
    if (quizType) {
      fetchQuestions();
    }
  }, [quizType]);

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
      let data;
      let error;
      if (quizType === 'all') {
        ({ data, error } = await supabase.rpc('get_random_questions'));
      } else {
        const categoryMap = {
          'category1': { start_id: 1000, end_id: 2000 },
          'category2': { start_id: 2000, end_id: 3000 },
          'category3': { start_id: 3000, end_id: 4000 },
          'category4': { start_id: 4000, end_id: 5000 },
          'category5': { start_id: 5000, end_id: 6000 },
          'category6': { start_id: 6000, end_id: 7000 },
          'category7': { start_id: 7000, end_id: 8000 },
          'category8': { start_id: 8000, end_id: 9000 },
          'category9': { start_id: 9000, end_id: 10000 },
          'category10': { start_id: 10000, end_id: 11000 }
        };
        const { start_id, end_id } = categoryMap[quizType];
        ({ data, error } = await supabase.rpc('get_random_questions_by_category', { start_id, end_id, limit_count: 45 }));
      }
      if (error) {
        throw error;
      }
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
    if (user) {
      try {
        const totalQuestions = questions.length;
        const passed = score >= totalQuestions / 2;

        console.log('Salvarea rezultatelor pentru utilizator:', user.id);
        console.log('Tip grilă:', quizType);
        console.log('Răspunsuri corecte:', score);
        console.log('Admis:', passed);

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
    setTimer(2700);
    setQuizType('');
    setAnswerValidation({});
    setAnswerSubmitted(false);
  };

  const calculateProgress = () => {
    const totalTime = 2700; // 45 minutes in seconds
    return ((totalTime - timer) / totalTime) * 100;
  };

  if (quizType === '') {
    return <QuizSelection onSelect={(type) => setQuizType(type)} />;
  }

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
        <LinearProgress variant="determinate" value={calculateProgress()} />
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
    </Container>
  );
};

export default Quiz;
