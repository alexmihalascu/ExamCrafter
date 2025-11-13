import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Slider,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import ListItemText from '@mui/material/ListItemText';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { db } from '../firebase/firebaseConfig';
import { fetchAccessibleQuestionSets, fetchAccessibleQuizBundles } from '../services/questionSets';
import { normalizeRawQuestion, normalizeStoredQuestion, OPTION_KEYS, formatTemplateSample } from '../utils/questionUtils';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query as firestoreQuery,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

const visibilityOptions = [
  { value: 'private', label: 'Privat', icon: 'mdi:lock' },
  { value: 'public', label: 'Public', icon: 'mdi:earth' },
];

const MIN_MANUAL_OPTIONS = 2;
const MAX_MANUAL_OPTIONS = 6;

const QuestionSets = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [questionSets, setQuestionSets] = useState([]);
  const [activeFilter, setActiveFilter] = useState('owned');
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSetForm, setNewSetForm] = useState({ name: '', description: '', tags: '', visibility: 'private' });

  const ensureAtLeastOneCorrect = (options) => {
    if (options.some((option) => option.isCorrect)) {
      return options;
    }
    return options.map((option, index) => ({
      ...option,
      isCorrect: index === 0,
    }));
  };

  const createManualQuestionState = () => ({
    intrebare: '',
    allowMultiple: false,
    options: OPTION_KEYS.slice(0, MIN_MANUAL_OPTIONS).map((id, index) => ({
      id,
      text: '',
      isCorrect: index === 0,
    })),
  });

  const [manualQuestion, setManualQuestion] = useState(createManualQuestionState());
  const [shareEmail, setShareEmail] = useState('');
  const [importing, setImporting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [quizBundles, setQuizBundles] = useState([]);
  const [bundleDialogOpen, setBundleDialogOpen] = useState(false);
  const [bundleForm, setBundleForm] = useState({
    name: '',
    description: '',
    questionCount: 40,
    visibility: 'private',
    selectedSets: [],
  });
  const [bundlesLoading, setBundlesLoading] = useState(true);

  const isOwner = selectedSet && currentUser?.uid === selectedSet.ownerId;

  const resetManualQuestion = () => {
    setManualQuestion(createManualQuestionState());
  };

  const updateManualOption = (optionId, updates) => {
    setManualQuestion((prev) => {
      const nextOptions = prev.options.map((option) =>
        option.id === optionId ? { ...option, ...updates } : option
      );
      return {
        ...prev,
        options: nextOptions,
      };
    });
  };

  const addManualOption = () => {
    setManualQuestion((prev) => {
      if (prev.options.length >= MAX_MANUAL_OPTIONS) {
        return prev;
      }
      const nextKey = OPTION_KEYS.find((key) => !prev.options.some((opt) => opt.id === key));
      if (!nextKey) return prev;
      return {
        ...prev,
        options: [
          ...prev.options,
          {
            id: nextKey,
            text: '',
            isCorrect: false,
          },
        ],
      };
    });
  };

  const removeManualOption = (optionId) => {
    setManualQuestion((prev) => {
      if (prev.options.length <= MIN_MANUAL_OPTIONS) {
        return prev;
      }
      const filtered = prev.options.filter((option) => option.id !== optionId);
      return {
        ...prev,
        options: ensureAtLeastOneCorrect(filtered),
      };
    });
  };

  const handleSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const fetchQuestionSets = useCallback(async () => {
    if (!currentUser) return;

    setLoadingSets(true);
    try {
      const sets = await fetchAccessibleQuestionSets(currentUser);
      setQuestionSets(sets);
    } catch (error) {
      console.error('Failed to fetch question sets:', error);
      handleSnackbar('Nu s-au putut incarca seturile de intrebari.', 'error');
    } finally {
      setLoadingSets(false);
    }
  }, [currentUser, handleSnackbar]);

  useEffect(() => {
    fetchQuestionSets();
  }, [fetchQuestionSets]);

  useEffect(() => {
    if (!questionSets.length) {
      setSelectedSet(null);
      setSelectedSetId(null);
      setQuestions([]);
      return;
    }

    if (selectedSetId) {
      const matching = questionSets.find((set) => set.id === selectedSetId);
      if (matching) {
        setSelectedSet(matching);
        return;
      }
    }

    const fallback = questionSets[0];
    setSelectedSet(fallback);
    setSelectedSetId(fallback?.id ?? null);
  }, [questionSets, selectedSetId]);

  const categorizedSets = useMemo(() => {
    return {
      owned: questionSets.filter((set) => set.access === 'owned'),
      shared: questionSets.filter((set) => set.access === 'shared'),
      public: questionSets.filter((set) => set.access === 'public'),
    };
  }, [questionSets]);

  const activeSets = categorizedSets[activeFilter] || [];

  const selectedBundleSets = useMemo(
    () => questionSets.filter((set) => bundleForm.selectedSets.includes(set.id)),
    [questionSets, bundleForm.selectedSets]
  );

  const maxBundleQuestions = selectedBundleSets.reduce(
    (acc, set) => acc + (set.questionCount || 0),
    0
  ) || 0;

  useEffect(() => {
    if (!bundleForm.selectedSets.length) {
      return;
    }
    if (maxBundleQuestions && bundleForm.questionCount > maxBundleQuestions) {
      setBundleForm((prev) => ({ ...prev, questionCount: maxBundleQuestions }));
    }
  }, [bundleForm.selectedSets, bundleForm.questionCount, maxBundleQuestions]);

  const fetchQuizBundles = useCallback(async () => {
    if (!currentUser) return;

    setBundlesLoading(true);
    try {
      const bundles = await fetchAccessibleQuizBundles(currentUser);
      setQuizBundles(bundles);
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
      handleSnackbar('Nu s-au putut incarca grilele compuse.', 'error');
    } finally {
      setBundlesLoading(false);
    }
  }, [currentUser, handleSnackbar]);

  useEffect(() => {
    fetchQuizBundles();
  }, [fetchQuizBundles]);

  const loadQuestions = useCallback(
    async (set) => {
      if (!set) return;
      setLoadingQuestions(true);
      try {
        const questionsRef = collection(db, 'questionSets', set.id, 'questions');
        const q = firestoreQuery(questionsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const parsed = snapshot.docs.map((docSnap) => {
          const data = normalizeStoredQuestion(docSnap.data());
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          };
        });

        setQuestions(parsed);
      } catch (error) {
        console.error('Failed to load questions:', error);
        handleSnackbar('Nu s-au putut incarca intrebarile setului.', 'error');
      } finally {
        setLoadingQuestions(false);
      }
    },
    [handleSnackbar]
  );

  useEffect(() => {
    if (selectedSet) {
      loadQuestions(selectedSet);
    } else {
      setQuestions([]);
    }
  }, [selectedSet, loadQuestions]);

  const handleSetSelection = (set) => {
    setSelectedSetId(set.id);
    setSelectedSet(set);
  };

  const handleCreateSet = async (event) => {
    event.preventDefault();
    if (!currentUser) return;

    if (!newSetForm.name.trim()) {
      handleSnackbar('Completeaza numele setului.', 'error');
      return;
    }

    try {
      const now = Timestamp.now();
      const tags = newSetForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 5);

      const docRef = await addDoc(collection(db, 'questionSets'), {
        name: newSetForm.name.trim(),
        description: newSetForm.description.trim(),
        tags,
        visibility: newSetForm.visibility,
        sharedWith: [],
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || currentUser.email,
        ownerEmail: currentUser.email,
        questionCount: 0,
        createdAt: now,
        updatedAt: now,
      });

      handleSnackbar('Set creat cu succes.');
      setCreateDialogOpen(false);
      setNewSetForm({ name: '', description: '', tags: '', visibility: 'private' });
      await fetchQuestionSets();
      setSelectedSetId(docRef.id);
    } catch (error) {
      console.error('Failed to create question set:', error);
      handleSnackbar('Crearea setului a esuat.', 'error');
    }
  };

  const handleManualQuestionAdd = async (event) => {
    event.preventDefault();
    if (!selectedSet || !currentUser) return;

    const trimmedQuestion = manualQuestion.intrebare.trim();
    if (!trimmedQuestion) {
      handleSnackbar('Adauga textul intrebarii.', 'error');
      return;
    }

    const trimmedOptions = manualQuestion.options
      .map((option) => ({
        ...option,
        text: option.text.trim(),
      }))
      .filter((option) => option.text);

    if (trimmedOptions.length < MIN_MANUAL_OPTIONS) {
      handleSnackbar(`Adauga cel putin ${MIN_MANUAL_OPTIONS} variante de raspuns.`, 'error');
      return;
    }

    const correctAnswers = trimmedOptions.filter((opt) => opt.isCorrect).map((opt) => opt.id);
    if (!correctAnswers.length) {
      handleSnackbar('Selecteaza cel putin un raspuns corect.', 'error');
      return;
    }

    if (!manualQuestion.allowMultiple && correctAnswers.length > 1) {
      handleSnackbar('Activeaza raspunsuri multiple sau lasa un singur raspuns corect.', 'warning');
      return;
    }

    const allowMultiple = manualQuestion.allowMultiple || correctAnswers.length > 1;

    try {
      const payload = {
        intrebare: trimmedQuestion,
        options: trimmedOptions.map(({ isCorrect, ...option }) => option),
        correctAnswers,
        allowMultiple,
        raspuns_corect: correctAnswers.join(','),
        createdAt: Timestamp.now(),
        createdBy: currentUser.uid,
      };

      trimmedOptions.forEach((option) => {
        payload[`varianta_${option.id}`] = option.text;
      });

      await addDoc(collection(db, 'questionSets', selectedSet.id, 'questions'), payload);

      await updateDoc(doc(db, 'questionSets', selectedSet.id), {
        questionCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      handleSnackbar('Intrebare adaugata.');
      resetManualQuestion();
      await loadQuestions(selectedSet);
      await fetchQuestionSets();
    } catch (error) {
      console.error('Failed to add question:', error);
      handleSnackbar('Nu s-a putut salva intrebarea.', 'error');
    }
  };

  const handleCreateBundle = async (event) => {
    event.preventDefault();
    if (!currentUser) return;

    if (!bundleForm.name.trim()) {
      handleSnackbar('Completeaza numele grilei.', 'error');
      return;
    }

    if (!bundleForm.selectedSets.length) {
      handleSnackbar('Selecteaza cel putin un dataset pentru grila.', 'warning');
      return;
    }

    const selectedSetsData = questionSets.filter((set) => bundleForm.selectedSets.includes(set.id));
    const totalAvailable = selectedSetsData.reduce((acc, set) => acc + (set.questionCount || 0), 0);

    if (!totalAvailable) {
      handleSnackbar('Dataset-urile alese nu contin intrebari.', 'warning');
      return;
    }

    const questionCount = Math.min(
      Math.max(bundleForm.questionCount || 10, 1),
      totalAvailable
    );

    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'quizBundles'), {
        name: bundleForm.name.trim(),
        description: bundleForm.description.trim(),
        questionCount,
        totalAvailableQuestions: totalAvailable,
        setIds: bundleForm.selectedSets,
        setSummaries: selectedSetsData.map((set) => ({
          id: set.id,
          name: set.name,
          questionCount: set.questionCount || 0,
        })),
        visibility: bundleForm.visibility,
        sharedWith: [],
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || currentUser.email,
        ownerEmail: currentUser.email,
        createdAt: now,
        updatedAt: now,
      });

      handleSnackbar('Grila compusa creata.');
      setBundleDialogOpen(false);
      setBundleForm({
        name: '',
        description: '',
        questionCount: 40,
        visibility: 'private',
        selectedSets: [],
      });
      await fetchQuizBundles();
    } catch (error) {
      console.error('Failed to create bundle:', error);
      handleSnackbar('Nu s-a putut salva grila.', 'error');
    }
  };

const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSet) {
      return;
    }

    setImporting(true);
    const resetInput = () => {
      event.target.value = '';
      setImporting(false);
    };

    const persistQuestions = async (normalizedQuestions) => {
      if (!normalizedQuestions.length) {
        handleSnackbar('Fisierul nu contine intrebari valide.', 'warning');
        return;
      }

      const batch = writeBatch(db);
      normalizedQuestions.forEach((question) => {
        const questionRef = doc(collection(db, 'questionSets', selectedSet.id, 'questions'));
        batch.set(questionRef, {
          ...question,
          createdAt: Timestamp.now(),
          createdBy: currentUser.uid,
        });
      });

      await batch.commit();
      await updateDoc(doc(db, 'questionSets', selectedSet.id), {
        questionCount: increment(normalizedQuestions.length),
        updatedAt: serverTimestamp(),
      });

      handleSnackbar(`Au fost importate ${normalizedQuestions.length} intrebari.`);
      await loadQuestions(selectedSet);
      await fetchQuestionSets();
    };

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const raw = JSON.parse(text);
        const normalized = raw.map(normalizeRawQuestion).filter(Boolean);
        await persistQuestions(normalized);
        resetInput();
        return;
      }

      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            try {
              const normalized = results.data.map(normalizeRawQuestion).filter(Boolean);
              await persistQuestions(normalized);
            } catch (error) {
              console.error('Error parsing CSV:', error);
              handleSnackbar('Nu s-a putut parsa fisierul CSV.', 'error');
            } finally {
              resetInput();
            }
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            handleSnackbar('Nu s-a putut parsa fisierul CSV.', 'error');
            resetInput();
          }
        });
        return;
      }

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);
        const normalized = rows.map(normalizeRawQuestion).filter(Boolean);
        await persistQuestions(normalized);
        resetInput();
        return;
      }

      handleSnackbar('Formatul fisierului nu este suportat.', 'error');
      resetInput();
    } catch (error) {
      console.error('Import failed:', error);
      handleSnackbar('Importul a esuat.', 'error');
      resetInput();
    }
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = (format) => {
    const template = formatTemplateSample();
    const baseRow = {
      intrebare: template.intrebare,
      allowMultiple: template.allowMultiple ? 'true' : 'false',
    };
    OPTION_KEYS.forEach((key) => {
      const match = template.options.find((opt) => opt.id === key);
      baseRow[`varianta_${key}`] = match ? match.text : '';
    });
    baseRow.raspuns_corect = template.correctAnswers.join(',');

    if (format === 'json') {
      const blob = new Blob([JSON.stringify([template], null, 2)], { type: 'application/json' });
      triggerDownload(blob, 'examcrafter-template.json');
      return;
    }

    if (format === 'csv') {
      const headers = ['intrebare', 'allowMultiple', ...OPTION_KEYS.map((key) => `varianta_${key}`), 'raspuns_corect'];
      const values = headers.map((header) => {
        const value = baseRow[header] ?? '';
        const sanitized = value.toString().replace(/"/g, '""');
        return `"${sanitized}"`;
      });
      const csv = `${headers.join(',')}\n${values.join(',')}`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      triggerDownload(blob, 'examcrafter-template.csv');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet([baseRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerDownload(blob, 'examcrafter-template.xlsx');
  };

  const handleShareAdd = async () => {
    if (!selectedSet || !shareEmail.trim()) return;
    const email = shareEmail.trim().toLowerCase();

    try {
      await updateDoc(doc(db, 'questionSets', selectedSet.id), {
        sharedWith: arrayUnion(email),
        updatedAt: serverTimestamp(),
      });
      setShareEmail('');
      handleSnackbar(`Acces oferit catre ${email}.`);
      await fetchQuestionSets();
    } catch (error) {
      console.error('Failed to share set:', error);
      handleSnackbar('Nu s-a putut actualiza lista de acces.', 'error');
    }
  };

  const handleShareRemove = async (email) => {
    if (!selectedSet) return;

    try {
      await updateDoc(doc(db, 'questionSets', selectedSet.id), {
        sharedWith: arrayRemove(email),
        updatedAt: serverTimestamp(),
      });
      handleSnackbar(`Acces revocat pentru ${email}.`);
      await fetchQuestionSets();
    } catch (error) {
      console.error('Failed to remove shared user:', error);
      handleSnackbar('Nu s-a putut revoca accesul.', 'error');
    }
  };

  const handleQuestionDelete = async (questionId) => {
    if (!selectedSet || !questionId) return;
    try {
      await deleteDoc(doc(db, 'questionSets', selectedSet.id, 'questions', questionId));
      await updateDoc(doc(db, 'questionSets', selectedSet.id), {
        questionCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
      handleSnackbar('Intrebare stearsa.');
      await loadQuestions(selectedSet);
      await fetchQuestionSets();
    } catch (error) {
      console.error('Failed to delete question:', error);
      handleSnackbar('Nu s-a putut sterge intrebarea.', 'error');
    }
  };

  const renderSetCard = (set) => (
    <Grid item xs={12} md={6} key={set.id}>
      <Card
        variant={selectedSet?.id === set.id ? 'outlined' : 'elevation'}
        sx={{
          borderRadius: 3,
          borderColor: selectedSet?.id === set.id ? theme.palette.primary.main : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
          },
        }}
        onClick={() => handleSetSelection(set)}
      >
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                {set.name}
              </Typography>
              <Chip
                icon={<Icon icon={set.visibility === 'public' ? 'mdi:earth' : 'mdi:lock'} width={18} height={18} />}
                label={set.visibility === 'public' ? 'Public' : 'Acces controlat'}
                size="small"
                color={set.visibility === 'public' ? 'success' : 'default'}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {set.description || 'Fara descriere'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label={`${set.questionCount || 0} intrebari`} />
              <Chip size="small" label={set.access === 'owned' ? 'Creat de tine' : set.access === 'shared' ? 'Partajat' : 'Public'} />
              {(set.tags || []).map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
      <Container maxWidth="xl" sx={{ flex: 1, py: 6 }}>
        <Stack spacing={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Seturi de intrebari
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Creeaza, importa si partajeaza colectii private sau publice.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={() => setCreateDialogOpen(true)}>
              Set nou
            </Button>
          </Box>

          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Tabs
              value={activeFilter}
              onChange={(_, value) => setActiveFilter(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab value="owned" label={`Seturile mele (${categorizedSets.owned.length})`} />
              <Tab value="shared" label={`Partajate cu mine (${categorizedSets.shared.length})`} />
              <Tab value="public" label={`Publice (${categorizedSets.public.length})`} />
            </Tabs>

            <Divider sx={{ my: 3 }} />

            {loadingSets ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : activeSets.length ? (
              <Grid container spacing={3}>
                {activeSets.map(renderSetCard)}
              </Grid>
            ) : (
              <Box textAlign="center" py={6}>
                <Typography variant="body1" color="text.secondary">
                  Nu exista seturi in aceasta categorie.
                </Typography>
              </Box>
            )}
          </Paper>

          {selectedSet && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Icon icon="mdi:folder-information" width={24} height={24} color={theme.palette.primary.main} />
                      <Typography variant="h6">Detalii set</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={600}>
                      {selectedSet.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSet.description || 'Fara descriere'}
                    </Typography>
                    <Divider />
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Creat de {selectedSet.ownerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedSet.questionCount || 0} intrebari
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vizibilitate: {selectedSet.visibility === 'public' ? 'Public' : 'Doar cu acces'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" spacing={1}>
                      {(selectedSet.tags || []).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Stack spacing={1.5} mb={2}>
                      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
                        <Typography variant="h6">Gestionare intrebari</Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={!isOwner || importing}
                          startIcon={<Icon icon="mdi:file-upload" />}
                        >
                          {importing ? 'Se importa...' : 'Importa fisier'}
                          <input
                            type="file"
                            hidden
                            accept=".json,.csv,.xlsx,.xls"
                            onChange={handleFileImport}
                            disabled={!isOwner}
                          />
                        </Button>
                      </Stack>
                      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          Accepta JSON, CSV sau Excel cu pana la {OPTION_KEYS.length} variante (A-H) si raspunsuri multiple.
                        </Typography>
                        <ButtonGroup variant="outlined" size="small">
                          <Button onClick={() => downloadTemplate('json')}>Template JSON</Button>
                          <Button onClick={() => downloadTemplate('csv')}>Template CSV</Button>
                          <Button onClick={() => downloadTemplate('xlsx')}>Template Excel</Button>
                        </ButtonGroup>
                      </Stack>
                    </Stack>
                    {!isOwner && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Doar proprietarul setului poate adauga sau importa intrebari.
                      </Alert>
                    )}
                    <Stack
                      spacing={2}
                      component="form"
                      onSubmit={handleManualQuestionAdd}
                      sx={{ opacity: isOwner ? 1 : 0.5, pointerEvents: isOwner ? 'auto' : 'none' }}
                    >
                      <TextField
                        label="Intrebare"
                        multiline
                        minRows={2}
                        value={manualQuestion.intrebare}
                        onChange={(e) => setManualQuestion((prev) => ({ ...prev, intrebare: e.target.value }))}
                        required
                      />
                      <Grid container spacing={2}>
                        {manualQuestion.options.map((option) => (
                          <Grid item xs={12} sm={6} key={option.id}>
                            <Stack spacing={1.2}>
                              <Stack direction="row" spacing={1} alignItems="flex-start">
                                <TextField
                                  label={`Varianta ${option.id.toUpperCase()}`}
                                  value={option.text}
                                  onChange={(e) => updateManualOption(option.id, { text: e.target.value })}
                                  required
                                  fullWidth
                                />
                                {manualQuestion.options.length > MIN_MANUAL_OPTIONS && (
                                  <Tooltip title="Sterge varianta">
                                    <IconButton
                                      size="small"
                                      onClick={() => removeManualOption(option.id)}
                                      sx={{ mt: 0.5 }}
                                    >
                                      <Icon icon="mdi:close" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={option.isCorrect}
                                    onChange={(e) => updateManualOption(option.id, { isCorrect: e.target.checked })}
                                  />
                                }
                                label="Raspuns corect"
                              />
                            </Stack>
                          </Grid>
                        ))}
                      </Grid>
                      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                        <Button
                          variant="text"
                          onClick={addManualOption}
                          disabled={manualQuestion.options.length >= MAX_MANUAL_OPTIONS}
                        >
                          Adauga varianta
                        </Button>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={manualQuestion.allowMultiple}
                              onChange={(e) =>
                                setManualQuestion((prev) => ({ ...prev, allowMultiple: e.target.checked }))
                              }
                            />
                          }
                          label="Permite raspunsuri multiple"
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {`Varianta curente: ${manualQuestion.options.length}/${MAX_MANUAL_OPTIONS} (minim ${MIN_MANUAL_OPTIONS})`}
                      </Typography>
                      <Button type="submit" variant="contained" disabled={!isOwner}>
                        Adauga intrebare
                      </Button>
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Stack spacing={2}>
                      <Typography variant="h6">Lista intrebari</Typography>
                      {loadingQuestions ? (
                        <Box display="flex" justifyContent="center" py={4}>
                          <CircularProgress size={32} />
                        </Box>
                      ) : questions.length ? (
                        <Stack spacing={2}>
                          {questions.map((question) => {
                            const optionList =
                              question.options && question.options.length
                                ? question.options
                                : OPTION_KEYS.map((key) => {
                                    const text = question[`varianta_${key}`];
                                    return text
                                      ? {
                                          id: key,
                                          text,
                                        }
                                      : null;
                                  }).filter(Boolean);
                            const correctAnswers = question.correctAnswers && question.correctAnswers.length
                              ? question.correctAnswers
                              : (question.raspuns_corect || '')
                                  .split(',')
                                  .map((ans) => ans.trim())
                                  .filter(Boolean);
                            const allowMultiple = question.allowMultiple || correctAnswers.length > 1;
                            return (
                              <Paper
                                key={question.id}
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 2, position: 'relative' }}
                              >
                              <Stack spacing={1.5}>
                                <Typography fontWeight={600}>{question.intrebare}</Typography>
                                <Grid container spacing={1}>
                                  {optionList.map((option) => {
                                    const isCorrect = correctAnswers.map((ans) => ans.toLowerCase()).includes(option.id.toLowerCase());
                                    return (
                                      <Grid item xs={12} sm={6} key={option.id}>
                                        <Box
                                          sx={{
                                            p: 1,
                                            borderRadius: 1,
                                            bgcolor: isCorrect
                                              ? `${theme.palette.success.main}22`
                                              : theme.palette.background.default,
                                            border: `1px solid ${
                                              isCorrect ? theme.palette.success.main : theme.palette.divider
                                            }`,
                                          }}
                                        >
                                          <Typography variant="caption" fontWeight={700} sx={{ mr: 0.5 }}>
                                            {option.id.toUpperCase()}.
                                          </Typography>
                                          <Typography variant="body2" component="span">
                                            {option.text}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    );
                                  })}
                                </Grid>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  {correctAnswers.map((answer) => (
                                    <Chip key={answer} label={answer.toUpperCase()} size="small" color="success" />
                                  ))}
                                  <Chip
                                    label={allowMultiple ? 'Multiple' : 'Unic'}
                                    size="small"
                                    color={allowMultiple ? 'warning' : 'default'}
                                  />
                                </Stack>
                              </Stack>
                              {isOwner && (
                                <Tooltip title="Sterge intrebarea">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleQuestionDelete(question.id)}
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                  >
                                    <Icon icon="mdi:delete" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Paper>
                          );
                        })}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Inca nu exista intrebari in acest set.
                        </Typography>
                      )}
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      spacing={2}
                      mb={2}
                    >
                      <Typography variant="h6">Grile compuse</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<Icon icon="mdi:refresh" />} onClick={fetchQuizBundles}>
                          Reincarca
                        </Button>
                        <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={() => setBundleDialogOpen(true)}>
                          Noua grila
                        </Button>
                      </Stack>
                    </Stack>
                    {bundlesLoading ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress size={32} />
                      </Box>
                    ) : quizBundles.length ? (
                      <Stack spacing={2}>
                        {quizBundles.map((bundle) => (
                          <Paper key={bundle.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                            <Stack spacing={1.5}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {bundle.name}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  <Chip label={`${bundle.questionCount || 0} intrebari`} size="small" />
                                  <Chip label={`${bundle.setIds?.length || 0} dataset-uri`} size="small" variant="outlined" />
                                  <Chip
                                    label={bundle.visibility === 'public' ? 'Public' : 'Privat'}
                                    size="small"
                                    color={bundle.visibility === 'public' ? 'success' : 'default'}
                                  />
                                </Stack>
                              </Stack>
                              {bundle.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {bundle.description}
                                </Typography>
                              )}
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {(bundle.setSummaries || []).map((summary) => (
                                  <Chip key={summary.id} label={summary.name} size="small" variant="outlined" />
                                ))}
                              </Stack>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nu exista inca grile compuse. Creaza una noua selectand dataset-urile dorite.
                      </Typography>
                    )}
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Stack spacing={2}>
                      <Typography variant="h6">Acces & partajare</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Adauga colegi dupa email pentru a le permite sa foloseasca acest set in chestionare.
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="Email utilizator"
                          type="email"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                          sx={{ flex: 1 }}
                          disabled={!isOwner}
                        />
                        <Button
                          variant="contained"
                          onClick={handleShareAdd}
                          disabled={!isOwner || !shareEmail.trim()}
                          startIcon={<Icon icon="mdi:account-plus" />}
                        >
                          Adauga
                        </Button>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {(selectedSet.sharedWith || []).length ? (
                          selectedSet.sharedWith.map((email) => (
                            <Chip
                              key={email}
                              label={email}
                              onDelete={isOwner ? () => handleShareRemove(email) : undefined}
                              deleteIcon={isOwner ? <Icon icon="mdi:close" /> : undefined}
                              sx={{ mb: 1 }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nu exista utilizatori partajati.
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Stack>
      </Container>

      <Footer />

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set nou de intrebari</DialogTitle>
        <Box component="form" onSubmit={handleCreateSet}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Nume"
                value={newSetForm.name}
                onChange={(e) => setNewSetForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                autoFocus
              />
              <TextField
                label="Descriere"
                value={newSetForm.description}
                onChange={(e) => setNewSetForm((prev) => ({ ...prev, description: e.target.value }))}
                multiline
                minRows={2}
              />
              <TextField
                label="Tag-uri (separate prin virgula)"
                value={newSetForm.tags}
                onChange={(e) => setNewSetForm((prev) => ({ ...prev, tags: e.target.value }))}
              />
              <TextField
                select
                label="Vizibilitate"
                value={newSetForm.visibility}
                onChange={(e) => setNewSetForm((prev) => ({ ...prev, visibility: e.target.value }))}
              >
                {visibilityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Icon icon={option.icon} />
                      <Typography>{option.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Anuleaza</Button>
            <Button type="submit" variant="contained">
              Creeaza
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={bundleDialogOpen} onClose={() => setBundleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Grila compusa noua</DialogTitle>
        <Box component="form" onSubmit={handleCreateBundle}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Nume grila"
                value={bundleForm.name}
                onChange={(e) => setBundleForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                autoFocus
              />
              <TextField
                label="Descriere"
                value={bundleForm.description}
                onChange={(e) => setBundleForm((prev) => ({ ...prev, description: e.target.value }))}
                multiline
                minRows={2}
              />
              <TextField
                select
                label="Vizibilitate"
                value={bundleForm.visibility}
                onChange={(e) => setBundleForm((prev) => ({ ...prev, visibility: e.target.value }))}
              >
                {visibilityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Icon icon={option.icon} />
                      <Typography>{option.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Dataset-uri incluse"
                value={bundleForm.selectedSets}
                onChange={(e) =>
                  setBundleForm((prev) => ({
                    ...prev,
                    selectedSets: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
                  }))
                }
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => {
                    const labels = questionSets
                      .filter((set) => selected.includes(set.id))
                      .map((set) => set.name);
                    return labels.length ? labels.join(', ') : 'Neselectat';
                  },
                }}
                helperText="Alege unul sau mai multe dataset-uri pentru aceasta grila."
              >
                {questionSets.map((set) => (
                  <MenuItem key={set.id} value={set.id}>
                    <Checkbox checked={bundleForm.selectedSets.includes(set.id)} />
                    <ListItemText primary={set.name} secondary={`${set.questionCount || 0} intrebari`} />
                  </MenuItem>
                ))}
              </TextField>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Numar intrebari</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {bundleForm.selectedSets.length
                      ? `Maxim ${maxBundleQuestions || 0}`
                      : 'Selecteaza dataset-uri pentru a seta limita'}
                  </Typography>
                </Stack>
                <Slider
                  value={bundleForm.questionCount}
                  onChange={(_, value) => setBundleForm((prev) => ({ ...prev, questionCount: value }))}
                  min={1}
                  max={Math.max(1, maxBundleQuestions || 40)}
                  step={1}
                  disabled={!bundleForm.selectedSets.length || !maxBundleQuestions}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBundleDialogOpen(false)}>Anuleaza</Button>
            <Button type="submit" variant="contained" disabled={!bundleForm.selectedSets.length}>
              Salveaza grila
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuestionSets;

