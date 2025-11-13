import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';
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
import { fetchAccessibleQuestionSets, fetchAccessibleQuizBundles } from '../services/questionSets';
import { normalizeStoredQuestion } from '../utils/questionUtils';

const shuffleArray = (items) => {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

const Quiz = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [questionSets, setQuestionSets] = useState([]);
  const [setsLoading, setSetsLoading] = useState(true);
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
  const [activeSetMeta, setActiveSetMeta] = useState(null);
  const [quizBundles, setQuizBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [activeBundleMeta, setActiveBundleMeta] = useState(null);

useEffect(() => {
  const loadSets = async () => {
    if (!currentUser) return;
    setSetsLoading(true);
    try {
      const sets = await fetchAccessibleQuestionSets(currentUser);
      setQuestionSets(sets);
    } catch (error) {
      console.error('Failed to fetch accessible sets:', error);
    } finally {
      setSetsLoading(false);
    }
  };

  loadSets();
}, [currentUser]);

useEffect(() => {
  const loadBundles = async () => {
    if (!currentUser) return;
    setBundlesLoading(true);
    try {
      const bundles = await fetchAccessibleQuizBundles(currentUser);
      setQuizBundles(bundles);
    } catch (error) {
      console.error('Failed to fetch quiz bundles:', error);
    } finally {
      setBundlesLoading(false);
    }
  };

  loadBundles();
}, [currentUser]);

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem('quizState'));
    if (savedState && savedState.quizType) {
      setQuestions((savedState.questions || []).map((question) => normalizeStoredQuestion(question)));
      setQuizType(savedState.quizType || '');
      setCurrentQuestionIndex(savedState.currentQuestionIndex || 0);
      setAnswers(savedState.answers || {});
      setScore(savedState.score || 0);
      setIncorrectAnswers(savedState.incorrectAnswers || 0);
      setTimer(savedState.timer || 60);
      setFinished(savedState.finished || false);
      setPassed(savedState.passed || false);
      setAnswerSubmitted(savedState.answerSubmitted || false);
      setActiveSetMeta(savedState.activeSetMeta || null);
      setActiveBundleMeta(savedState.activeBundleMeta || null);
      setIsQuizActive(true);
    } else {
      setShowQuizSelection(true);
    }
    setIsStateLoaded(true);
  }, []);

  useEffect(() => {
    if (!isStateLoaded) return;

    if (!isQuizActive) {
      localStorage.removeItem('quizState');
      return;
    }

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
    activeSetMeta,
    activeBundleMeta,
  };

    localStorage.setItem('quizState', JSON.stringify(stateToSave));
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
    activeSetMeta,
    activeBundleMeta,
    isStateLoaded,
    isQuizActive,
  ]);

  useEffect(() => {
    if (timer > 0 && !answerSubmitted && isQuizActive) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0 && !answerSubmitted && isQuizActive) {
      handleSubmitAnswer();
    }
    return undefined;
  }, [timer, answerSubmitted, isQuizActive]);

  const handleQuestionAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const expectedAnswers = (currentQuestion.correctAnswers?.length
      ? currentQuestion.correctAnswers
      : currentQuestion.raspuns_corect
      ? currentQuestion.raspuns_corect.split(',').map((item) => item.trim().toLowerCase())
      : []
    ).sort();

    const userAnswerRaw = answers[currentQuestion.id];
    const userAnswers = Array.isArray(userAnswerRaw)
      ? userAnswerRaw
      : userAnswerRaw
      ? [userAnswerRaw]
      : [];
    const normalizedUserAnswers = userAnswers.map((ans) => ans.toLowerCase()).sort();

    const isCorrect =
      normalizedUserAnswers.length > 0 &&
      normalizedUserAnswers.length === expectedAnswers.length &&
      normalizedUserAnswers.every((ans, index) => ans === expectedAnswers[index]);

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

  const startQuizFromSet = async ({ setId, questionCount, randomize }) => {
    const selectedSet = questionSets.find((set) => set.id === setId);
    if (!selectedSet) {
      alert('Setul selectat nu mai este disponibil.');
      return;
    }

    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'questionSets', setId, 'questions'));
      let fetchedQuestions = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      if (randomize) {
        fetchedQuestions = shuffleArray(fetchedQuestions);
      }

      const normalizedQuestions = fetchedQuestions.map((question) => normalizeStoredQuestion(question));
      const limitedQuestions = normalizedQuestions.slice(0, Math.min(questionCount, normalizedQuestions.length));

      if (!limitedQuestions.length) {
        alert('Acest set nu contine inca intrebari.');
        setLoading(false);
        return;
      }

      const meta = {
        id: selectedSet.id,
        name: selectedSet.name,
        visibility: selectedSet.visibility,
        access: selectedSet.access,
      };

      const initialState = {
        questions: limitedQuestions,
        quizType: selectedSet.name,
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        incorrectAnswers: 0,
        timer: 60,
        finished: false,
        passed: false,
        answerSubmitted: false,
        activeSetMeta: meta,
        activeBundleMeta: null,
      };

      setQuestions(limitedQuestions);
      setQuizType(selectedSet.name);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setScore(0);
      setIncorrectAnswers(0);
      setFinished(false);
      setPassed(false);
      setTimer(60);
      setAnswerSubmitted(false);
      setActiveBundleMeta(null);
      setActiveSetMeta(meta);
      setIsQuizActive(true);
      setShowQuizSelection(false);
      localStorage.setItem('quizState', JSON.stringify(initialState));
    } catch (error) {
      console.error('Failed to start quiz from set:', error);
      alert('Nu s-au putut incarca intrebarile pentru acest set.');
    } finally {
      setLoading(false);
    }
  };

  const startQuizFromBundle = async ({ bundle, questionCount, randomize }) => {
    if (!bundle?.setIds?.length) {
      alert('Aceasta grila nu contine dataset-uri selectate.');
      return;
    }

    setLoading(true);
    try {
      const snapshots = await Promise.all(
        bundle.setIds.map((setId) => getDocs(collection(db, 'questionSets', setId, 'questions')))
      );

      let combinedQuestions = [];
      snapshots.forEach((snapshot, index) => {
        const setId = bundle.setIds[index];
        const extracted = snapshot.docs.map((docSnap) => ({
          id: `${setId}-${docSnap.id}`,
          ...docSnap.data(),
        }));
        combinedQuestions = combinedQuestions.concat(extracted);
      });

      let normalized = combinedQuestions.map((question) => normalizeStoredQuestion(question));
      if (!normalized.length) {
        alert('Seturile din aceasta grila nu contin inca intrebari.');
        setLoading(false);
        return;
      }

      if (randomize) {
        normalized = shuffleArray(normalized);
      }

      const limitedQuestions = normalized.slice(0, Math.min(questionCount, normalized.length));

      const meta = {
        id: bundle.id,
        name: bundle.name,
        visibility: bundle.visibility,
        access: bundle.access,
      };

      const initialState = {
        questions: limitedQuestions,
        quizType: bundle.name,
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        incorrectAnswers: 0,
        timer: 60,
        finished: false,
        passed: false,
        answerSubmitted: false,
        activeSetMeta: null,
        activeBundleMeta: meta,
      };

      setQuestions(limitedQuestions);
      setQuizType(bundle.name);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setScore(0);
      setIncorrectAnswers(0);
      setFinished(false);
      setPassed(false);
      setTimer(60);
      setAnswerSubmitted(false);
      setActiveSetMeta(null);
      setActiveBundleMeta(meta);
      setIsQuizActive(true);
      setShowQuizSelection(false);

      localStorage.setItem('quizState', JSON.stringify(initialState));
    } catch (error) {
      console.error('Failed to start quiz from bundle:', error);
      alert('Nu s-au putut incarca intrebarile pentru aceasta grila.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishQuiz = async () => {
    const isPassed = score >= questions.length / 2;
    setFinished(true);
    setPassed(isPassed);

    if (currentUser) {
      try {
        await addDoc(collection(db, 'results'), {
          user_id: currentUser.uid,
          quiz_type: quizType,
          question_set_id: activeSetMeta?.id || null,
          question_set_name: activeSetMeta?.name || '',
          question_set_visibility: activeSetMeta?.visibility || 'private',
          question_set_access: activeSetMeta?.access || 'owned',
          question_bundle_id: activeBundleMeta?.id || null,
          question_bundle_name: activeBundleMeta?.name || '',
          question_bundle_visibility: activeBundleMeta?.visibility || 'private',
          question_bundle_access: activeBundleMeta?.access || 'owned',
          correct_answers: score,
          total_questions: questions.length,
          passed: isPassed,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving results:', error);
      }
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
    setActiveSetMeta(null);
    setActiveBundleMeta(null);
    setIsQuizActive(false);
    setShowQuizSelection(true);
    localStorage.removeItem('quizState');
  };

  if (!isStateLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (showQuizSelection) {
    return (
      <QuizSelection
        questionSets={questionSets}
        quizBundles={quizBundles}
        loading={setsLoading}
        bundlesLoading={bundlesLoading}
        onStart={startQuizFromSet}
        onStartBundle={startQuizFromBundle}
        onManageSets={() => navigate('/sets')}
      />
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (finished) {
    return (
      <QuizResults
        score={score}
        totalQuestions={questions.length}
        incorrectAnswers={incorrectAnswers}
        onRestart={handleRestartQuiz}
        passed={passed}
        questionSetName={activeSetMeta?.name}
        questionSetAccess={activeSetMeta?.access}
        questionSetVisibility={activeSetMeta?.visibility}
        questionBundleName={activeBundleMeta?.name}
        questionBundleAccess={activeBundleMeta?.access}
        questionBundleVisibility={activeBundleMeta?.visibility}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const quizTitle = activeBundleMeta?.name || activeSetMeta?.name || 'Chestionar personalizat';
  const accessLabel = activeBundleMeta
    ? activeBundleMeta.access === 'public'
      ? 'Grila publica'
      : activeBundleMeta.access === 'shared'
      ? 'Grila partajata'
      : 'Grila personala'
    : activeSetMeta
    ? activeSetMeta.access === 'public'
      ? 'Set public'
      : activeSetMeta.access === 'shared'
      ? 'Set partajat'
      : 'Set personal'
    : 'Chestionar selectat';

  const currentSelection = answers[currentQuestion?.id] || null;
  const hasSelection = Array.isArray(currentSelection) ? currentSelection.length > 0 : Boolean(currentSelection);

  return (
    <Container maxWidth="md">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card
          sx={{
            p: theme.spacing(isMobile ? 2.5 : 5),
            textAlign: 'center',
            borderRadius: 5,
            border: '1px solid rgba(255,255,255,0.12)',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(145deg, rgba(10,12,26,0.95), rgba(8,10,23,0.9))'
              : 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(234,240,255,0.9))',
            boxShadow: '0 35px 75px rgba(3,4,12,0.55)',
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: theme.typography.fontWeightBold,
              }}
            >
              {quizTitle}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
              {accessLabel}
            </Typography>

            <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Grid item>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: 'rgba(50,215,75,0.12)',
                    border: '1px solid rgba(50,215,75,0.3)',
                  }}
                >
                  <Typography variant="body1" color="text.primary">
                    Intrebari corecte: {score}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: 'rgba(255,69,58,0.12)',
                    border: '1px solid rgba(255,69,58,0.3)',
                  }}
                >
                  <Typography variant="body1" color="text.primary">
                    Intrebari gresite: {incorrectAnswers}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Typography variant="body1">
                    Intrebari ramase: {questions.length - currentQuestionIndex - 1}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box mb={4}>
              <Typography variant="body2">
                Intrebarea {currentQuestionIndex + 1} din {questions.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={questions.length ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0}
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
              <Typography variant="h6" color={timer <= 10 ? 'error' : 'text.primary'}>
                {timer}s
              </Typography>
            </Box>

            {currentQuestion ? (
              <Question
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id]}
                onAnswerChange={handleQuestionAnswerChange}
                answerSubmitted={answerSubmitted}
              />
            ) : (
              <Typography variant="h6">Nu exista intrebari disponibile.</Typography>
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
                  disabled={!hasSelection}
                >
                  Trimite raspuns
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
                  {currentQuestionIndex < questions.length - 1 ? 'Intrebarea urmatoare' : 'Finalizeaza testul'}
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
