import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useUser } from '@clerk/clerk-react';
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Container,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
} from '@mui/material';
import { CircularProgress as CircularTimer } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import Question from '../components/Question';
import QuizSelection from '../components/QuizSelection';
import QuizResults from '../components/QuizResults';

const Quiz = () => {
  const { user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isQuizActive, setIsQuizActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [quizType, setQuizType] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [timer, setTimer] = useState(60);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passed, setPassed] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const [showQuizSelection, setShowQuizSelection] = useState(false);

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem('quizState'));
    if (savedState && savedState.quizType) {
      setQuestions(savedState.questions || []);
      setQuizType(savedState.quizType || '');
      setCurrentQuestionIndex(savedState.currentQuestionIndex || 0);
      setAnswers(savedState.answers || {});
      setScore(savedState.score || 0);
      setIncorrectAnswers(savedState.incorrectAnswers || 0);
      setTimer(savedState.timer || 60);
      setFinished(savedState.finished || false);
      setPassed(savedState.passed || false);
      setAnswerSubmitted(savedState.answerSubmitted || false);
      setIsQuizActive(true);
    } else {
      setShowQuizSelection(true);
    }
    setIsStateLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes, but only after state is loaded
  useEffect(() => {
    if (isStateLoaded) {
      const stateToSave = {
        questions,
        quizType,
        currentQuestionIndex,
        answers,
        score,
        incorrectAnswers,
        timer,
        finished,
        passed,
        answerSubmitted,
      };
      localStorage.setItem('quizState', JSON.stringify(stateToSave));
    }
  }, [
    questions,
    quizType,
    currentQuestionIndex,
    answers,
    score,
    incorrectAnswers,
    timer,
    finished,
    passed,
    answerSubmitted,
    isStateLoaded,
  ]);

//timer 
  useEffect(() => {
    if (timer > 0 && !answerSubmitted) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0 && !answerSubmitted) {
      handleSubmitAnswer(); 
    }
  }, [timer, answerSubmitted]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answers[currentQuestion.id] === currentQuestion.varianta_corecta;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setIncorrectAnswers((prev) => prev + 1);
    }

    setAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    setAnswerSubmitted(false);
    setTimer(60);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    setFinished(true);
    setPassed(score >= questions.length / 2);

    if (user) {
      supabase
        .from('results')
        .insert([{ user_id: user.id, quiz_type: quizType, correct_answers: score, passed }])
        .then(({ error }) => {
          if (error) console.error('Error saving results:', error);
        });
    }

    localStorage.removeItem('quizState');
  };

  const handleRestartQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setIncorrectAnswers(0);
    setFinished(false);
    setQuizType('');
    setTimer(60);
    setAnswerSubmitted(false);
    setShowQuizSelection(true);
    localStorage.removeItem('quizState');
  };

  if (!isStateLoaded) {
    return <CircularProgress />;
  }

  if (showQuizSelection) {
    return (
      <QuizSelection
        onSelect={(selectedQuizType) => {
          const savedState = JSON.parse(localStorage.getItem('quizState'));
          if (savedState && savedState.quizType === selectedQuizType) {
            setQuestions(savedState.questions || []);
            setQuizType(savedState.quizType || '');
            setCurrentQuestionIndex(savedState.currentQuestionIndex || 0);
            setAnswers(savedState.answers || {});
            setScore(savedState.score || 0);
            setIncorrectAnswers(savedState.incorrectAnswers || 0);
            setTimer(savedState.timer || 60);
            setFinished(savedState.finished || false);
            setPassed(savedState.passed || false);
            setAnswerSubmitted(savedState.answerSubmitted || false);
            setIsQuizActive(true);
            setShowQuizSelection(false);
          } else {
            setShowQuizSelection(false);
            setQuizType(selectedQuizType);
            setIsQuizActive(true);
          }
        }}
      />
    );
  }

  if (loading) return <CircularProgress />;

  if (finished) {
    return (
      <QuizResults
        score={score}
        totalQuestions={questions.length}
        incorrectAnswers={incorrectAnswers}
        onRestart={handleRestartQuiz}
        passed={passed}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Container maxWidth="md">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        <Card 
          sx={{ 
            padding: theme.spacing(4), 
            textAlign: 'center', 
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[4],
          }}
        >
          <CardContent>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 2, 
                color: theme.palette.primary.main,
                fontWeight: theme.typography.fontWeightBold 
              }}
            >
              CHESTIONARE LICENȚĂ U.R.A.
            </Typography>

            <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Grid item>
                <Paper 
                  sx={{ 
                    padding: 2, 
                    backgroundColor: theme.palette.success.light, 
                    borderRadius: theme.shape.borderRadius 
                  }}
                >
                  <Typography variant="body1">Întrebări corecte: {score}</Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper 
                  sx={{ 
                    padding: 2, 
                    backgroundColor: theme.palette.error.light, 
                    borderRadius: theme.shape.borderRadius 
                  }}
                >
                  <Typography variant="body1">Întrebări greșite: {incorrectAnswers}</Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper 
                  sx={{ 
                    padding: 2, 
                    backgroundColor: theme.palette.background.paper, 
                    borderRadius: theme.shape.borderRadius 
                  }}
                >
                  <Typography variant="body1">
                    Întrebări rămase: {questions.length - currentQuestionIndex - 1}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box mb={4}>
              <Typography variant="body2">
                Întrebarea {currentQuestionIndex + 1} din {questions.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((currentQuestionIndex + 1) / questions.length) * 100}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
              <CircularTimer
                variant="determinate"
                value={(timer / 60) * 100}
                size={80}
                thickness={5}
                sx={{ mr: 2 }}
              />
              <Typography 
                variant="h6" 
                color={timer <= 10 ? 'error' : 'text.primary'}
              >
                {timer}s
              </Typography>
            </Box>

            {currentQuestion ? (
              <Question
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id] || ''}
                handleAnswerChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                answerSubmitted={answerSubmitted}
              />
            ) : (
              <Typography variant="h6">Nu există întrebări disponibile.</Typography>
            )}

            <Box mt={4}>
              {!answerSubmitted ? (
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  sx={{ 
                    borderRadius: theme.shape.borderRadius,
                    textTransform: 'none',
                  }}
                  onClick={handleSubmitAnswer}
                  disabled={!answers[currentQuestion?.id]}
                >
                  Trimite răspuns
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  size="large"
                  color="secondary"
                  sx={{ 
                    borderRadius: theme.shape.borderRadius,
                    textTransform: 'none',
                  }}
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex < questions.length - 1
                    ? 'Întrebarea următoare'
                    : 'Finalizează testul'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Quiz;