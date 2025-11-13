import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Slider,
  Stack,
  Switch,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const DEFAULT_QUESTION_COUNT = 20;

const QuizSelection = ({
  questionSets,
  quizBundles = [],
  loading,
  bundlesLoading = false,
  onStart,
  onStartBundle,
  onManageSets,
}) => {
  const [view, setView] = useState('bundles');
  const [selectedSetId, setSelectedSetId] = useState('');
  const [selectedBundleId, setSelectedBundleId] = useState('');
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [bundleQuestionCount, setBundleQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [randomize, setRandomize] = useState(true);
  const userViewChangedRef = useRef(false);

  const categorizedSets = useMemo(
    () => ({
      owned: questionSets.filter((set) => set.access === 'owned'),
      shared: questionSets.filter((set) => set.access === 'shared'),
      public: questionSets.filter((set) => set.access === 'public'),
    }),
    [questionSets]
  );

  useEffect(() => {
    if (!selectedSetId && questionSets.length) {
      setSelectedSetId(questionSets[0].id);
    }
  }, [questionSets, selectedSetId]);

  useEffect(() => {
    if (userViewChangedRef.current) return;
    if (quizBundles.length) {
      setView('bundles');
    } else if (!quizBundles.length && questionSets.length) {
      setView('sets');
    }
  }, [quizBundles.length, questionSets.length]);

  useEffect(() => {
    if (!selectedBundleId && quizBundles.length) {
      const firstBundle = quizBundles[0];
      setSelectedBundleId(firstBundle.id);
      const cap = Math.max(
        1,
        firstBundle.totalAvailableQuestions || firstBundle.questionCount || DEFAULT_QUESTION_COUNT
      );
      setBundleQuestionCount(Math.min(firstBundle.questionCount || DEFAULT_QUESTION_COUNT, cap));
    }
  }, [quizBundles, selectedBundleId]);

  const selectedSet = useMemo(
    () => questionSets.find((set) => set.id === selectedSetId),
    [questionSets, selectedSetId]
  );

  const selectedBundle = useMemo(
    () => quizBundles.find((bundle) => bundle.id === selectedBundleId),
    [quizBundles, selectedBundleId]
  );

  useEffect(() => {
    if (selectedSet) {
      const cap = Math.max(1, selectedSet.questionCount || DEFAULT_QUESTION_COUNT);
      setQuestionCount((prev) => Math.min(prev || DEFAULT_QUESTION_COUNT, cap));
    }
  }, [selectedSet]);

  useEffect(() => {
    if (selectedBundle) {
      const cap = Math.max(
        1,
        selectedBundle.totalAvailableQuestions || selectedBundle.questionCount || DEFAULT_QUESTION_COUNT
      );
      setBundleQuestionCount((prev) => Math.min(prev || DEFAULT_QUESTION_COUNT, cap));
    }
  }, [selectedBundle]);

  const canStartSet = !!selectedSet && (selectedSet.questionCount || 0) > 0;
  const bundleCap = selectedBundle
    ? Math.max(
        1,
        selectedBundle.totalAvailableQuestions || selectedBundle.questionCount || DEFAULT_QUESTION_COUNT
      )
    : 0;
  const canStartBundle = !!selectedBundle && bundleCap > 0;

  const handleStartSet = () => {
    if (!selectedSet || !onStart) return;
    const cap = Math.max(1, selectedSet.questionCount || DEFAULT_QUESTION_COUNT);
    onStart({
      setId: selectedSet.id,
      questionCount: Math.min(questionCount, cap),
      randomize,
    });
  };

  const handleStartBundle = () => {
    if (!selectedBundle || !onStartBundle) return;
    const cap = bundleCap || DEFAULT_QUESTION_COUNT;
    onStartBundle({
      bundle: selectedBundle,
      questionCount: Math.min(bundleQuestionCount, cap),
      randomize,
    });
  };

  const renderSetCard = (set) => {
    const isSelected = selectedSetId === set.id;
    return (
      <Grid item xs={12} md={6} key={set.id}>
        <Card
          component={motion.div}
          whileHover={{ scale: 1.01 }}
          onClick={() => setSelectedSetId(set.id)}
          sx={{
            cursor: 'pointer',
            borderRadius: 3,
            border: isSelected ? `2px solid` : '1px solid',
            borderColor: isSelected ? 'primary.main' : 'divider',
            boxShadow: isSelected ? 6 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={600}>
                  {set.name}
                </Typography>
                <Chip
                  label={
                    set.access === 'owned'
                      ? 'Set personal'
                      : set.access === 'shared'
                      ? 'Partajat'
                      : 'Public'
                  }
                  size="small"
                  color={set.access === 'public' ? 'success' : 'default'}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {set.description || 'Fara descriere'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip icon={<Icon icon="mdi:playlist-check" />} label={`${set.questionCount || 0} intrebari`} />
                {set.tags?.slice(0, 3).map((tag) => (
                  <Chip key={tag} label={tag} variant="outlined" size="small" />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderBundleCard = (bundle) => {
    const isSelected = selectedBundleId === bundle.id;
    return (
      <Grid item xs={12} md={6} key={bundle.id}>
        <Card
          component={motion.div}
          whileHover={{ scale: 1.01 }}
          onClick={() => setSelectedBundleId(bundle.id)}
          sx={{
            cursor: 'pointer',
            borderRadius: 3,
            border: isSelected ? `2px solid` : '1px solid',
            borderColor: isSelected ? 'primary.main' : 'divider',
            boxShadow: isSelected ? 6 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={600}>
                  {bundle.name}
                </Typography>
                <Chip
                  label={bundle.visibility === 'public' ? 'Public' : 'Privat'}
                  size="small"
                  color={bundle.visibility === 'public' ? 'success' : 'default'}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {bundle.description || 'Fara descriere'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip icon={<Icon icon="mdi:playlist-check" />} label={`${bundle.questionCount || 0} intrebari`} />
                <Chip icon={<Icon icon="mdi:folder-table" />} label={`${bundle.setIds?.length || 0} dataset-uri`} />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(bundle.setSummaries || []).slice(0, 4).map((set) => (
                  <Chip key={set.id} label={set.name} size="small" variant="outlined" />
                ))}
                {(bundle.setSummaries || []).length > 4 && (
                  <Chip label={`+${bundle.setSummaries.length - 4}`} size="small" variant="outlined" />
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderSetsView = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (!questionSets.length) {
      return (
        <Alert severity="info">
          Nu ai inca acces la dataset-uri. Creeaza-le sau solicita acces din zona de seturi.
        </Alert>
      );
    }

    const maxQuestions = Math.max(1, selectedSet?.questionCount || DEFAULT_QUESTION_COUNT);

    return (
      <>
        <Grid container spacing={3}>
          {questionSets.map(renderSetCard)}
        </Grid>
        {selectedSet && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Selecteaza cate intrebari sa contina chestionarul (maxim {maxQuestions})
            </Typography>
            <Slider
              value={Math.min(questionCount, maxQuestions)}
              onChange={(_, value) => setQuestionCount(value)}
              min={1}
              max={maxQuestions}
              step={1}
              valueLabelDisplay="auto"
              sx={{ mt: 2 }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mt={2}>
              <FormControlLabel
                control={<Switch checked={randomize} onChange={(e) => setRandomize(e.target.checked)} />}
                label="Amesteca ordinea intrebarilor"
              />
              <Box flexGrow={1} />
              <Button
                variant="contained"
                size="large"
                onClick={handleStartSet}
                disabled={!canStartSet}
              >
                Incepe testul
              </Button>
            </Stack>
          </Box>
        )}
      </>
    );
  };

  const renderBundlesView = () => {
    if (bundlesLoading) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (!quizBundles.length) {
      return (
        <Alert severity="info">
          Nu exista inca grile compuse. Creeaza-le din zona de seturi si revin-o aici.
        </Alert>
      );
    }

    const max = Math.max(1, bundleCap || DEFAULT_QUESTION_COUNT);

    return (
      <>
        <Grid container spacing={3}>
          {quizBundles.map(renderBundleCard)}
        </Grid>
        {selectedBundle && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Selecteaza cate intrebari sa folosesti din totalul disponibil ({max})
            </Typography>
            <Slider
              value={Math.min(bundleQuestionCount, max)}
              onChange={(_, value) => setBundleQuestionCount(value)}
              min={1}
              max={max}
              step={1}
              valueLabelDisplay="auto"
              sx={{ mt: 2 }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mt={2}>
              <FormControlLabel
                control={<Switch checked={randomize} onChange={(e) => setRandomize(e.target.checked)} />}
                label="Amesteca ordinea intrebarilor"
              />
              <Box flexGrow={1} />
              <Button
                variant="contained"
                size="large"
                onClick={handleStartBundle}
                disabled={!canStartBundle}
              >
                Incepe grila
              </Button>
            </Stack>
          </Box>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="lg">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: `1px solid`,
            borderColor: 'divider',
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Selecteaza sursa chestionarului
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Poti folosi dataset-uri individuale sau combinatii salvate (grile compuse).
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Chip label={`Seturile mele (${categorizedSets.owned.length})`} />
              <Chip label={`Partajate (${categorizedSets.shared.length})`} />
              <Chip label={`Publice (${categorizedSets.public.length})`} />
              <Box flexGrow={1} />
              <Button variant="outlined" onClick={onManageSets} startIcon={<Icon icon="mdi:open-in-new" />}>
                Gestioneaza seturi
              </Button>
            </Stack>

            <Tabs
              value={view}
              onChange={(_, value) => {
                userViewChangedRef.current = true;
                setView(value);
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Dataset-uri" value="sets" />
              <Tab label="Grile compuse" value="bundles" />
            </Tabs>

            <Divider />

            {view === 'sets' ? renderSetsView() : renderBundlesView()}
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default React.memo(QuizSelection);
