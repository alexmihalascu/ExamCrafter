import React, { useState } from 'react';
import {
  Container, Paper, Typography, MenuItem, Select, Button, Box,
  ListSubheader, useTheme, useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';

const categories = [
  {
    group: 'General',
    items: [
      { value: 'all', label: 'Aleatoare (45 întrebări din toate categoriile)', icon: 'mdi:shuffle' }
    ]
  },
  {
    group: 'MS ACCESS',
    items: [
      { value: 'category1', label: 'Teste grilă rezolvate', icon: 'mdi:database-check' },
      { value: 'category2', label: 'Teste grilă propuse spre rezolvare', icon: 'mdi:database-edit' }
    ]
  },
  {
    group: 'ORACLE SQL',
    items: [
      { value: 'category3', label: 'Teste grilă rezolvate', icon: 'mdi:database-check' },
      { value: 'category4', label: 'Teste grilă propuse spre rezolvare', icon: 'mdi:database-edit' }
    ]
  },
  {
    group: 'Sisteme Informatice',
    items: [
      { value: 'category5', label: 'Teste grilă rezolvate', icon: 'mdi:file-check' },
      { value: 'category6', label: 'Teste grilă propuse spre rezolvare', icon: 'mdi:file-edit' }
    ]
  },
  {
    group: 'Arhitectura Calculatoarelor',
    items: [
      { value: 'category7', label: 'Teste grilă rezolvate', icon: 'mdi:desktop-classic' },
      { value: 'category8', label: 'Teste grilă propuse spre rezolvare', icon: 'mdi:desktop-classic' }
    ]
  },
  {
    group: 'Programare C#',
    items: [
      { value: 'category9', label: 'Teste grilă rezolvate', icon: 'mdi:language-csharp' },
      { value: 'category10', label: 'Teste grilă propuse spre rezolvare', icon: 'mdi:language-csharp' }
    ]
  }
];

const QuizSelection = React.memo(({ onSelect }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(false); // New loading state
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStartQuiz = async () => {
    if (selectedOption) {
      setLoading(true);
      try {
        // Fetch questions based on the selected category
        let data = [];
        const questionsRef = collection(db, 'intrebari');

        if (selectedOption === 'all') {
          // Get all questions and randomly select 45
          const querySnapshot = await getDocs(questionsRef);
          const allQuestions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          data = shuffleArray(allQuestions).slice(0, 45);
        } else {
          // Get questions by category
          const categoryMap = {
            category1: 'MS ACCESS - Rezolvate',
            category2: 'MS ACCESS - Propuse',
            category3: 'ORACLE SQL - Rezolvate',
            category4: 'ORACLE SQL - Propuse',
            category5: 'Sisteme Informatice - Rezolvate',
            category6: 'Sisteme Informatice - Propuse',
            category7: 'Arhitectura Calculatoarelor - Rezolvate',
            category8: 'Arhitectura Calculatoarelor - Propuse',
            category9: 'Programare C# - Rezolvate',
            category10: 'Programare C# - Propuse',
          };

          const categoryName = categoryMap[selectedOption];
          if (categoryName) {
            const q = query(questionsRef, where('categorie', '==', categoryName));
            const querySnapshot = await getDocs(q);
            const categoryQuestions = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            data = shuffleArray(categoryQuestions).slice(0, 40);
          } else {
            // Fallback: get random questions
            const querySnapshot = await getDocs(questionsRef);
            const allQuestions = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            data = shuffleArray(allQuestions).slice(0, 40);
          }
        }

        if (data.length === 0) {
          alert('Nu există întrebări disponibile pentru această categorie. Te rog să contactezi administratorul.');
          setLoading(false);
          return;
        }

        // Save quiz state and questions to localStorage
        const initialQuizState = {
          quizType: selectedOption,
          questions: data,
          currentQuestionIndex: 0,
          answers: {},
          score: 0,
          incorrectAnswers: 0,
          timer: 60,
          finished: false,
          passed: false,
          answerSubmitted: false,
        };
        localStorage.setItem('quizState', JSON.stringify(initialQuizState));

        // Proceed to the quiz
        onSelect(selectedOption);
      } catch (error) {
        console.error('Error fetching questions:', error);
        alert('A apărut o eroare la încărcarea întrebărilor.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Te rog să selectezi un tip de chestionar.');
    }
  };

  return (
    <Container maxWidth="sm">
      <motion.div>
        <Paper 
          elevation={0}
          sx={{ 
            p: isMobile ? 10 : 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 4
            }}
          >
            Selectează Tipul de Chestionar
          </Typography>

          <Select
            value={selectedOption}
            onChange={handleChange}
            displayEmpty
            fullWidth
            sx={{
              '& .MuiSelect-select': {
                py: 1.5,
              },
              '& .MuiMenuItem-root': {
                py: 1,
                px: 2,
              }
            }}
          >
            <MenuItem value="" disabled>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Icon icon="mdi:playlist-check" width={24} height={24} />
                <Typography>Selectează categoria dorită</Typography>
              </Box>
            </MenuItem>

            {categories.map((category) => [
              <ListSubheader 
                key={category.group}
                sx={{
                  background: theme.palette.background.paper,
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}
              >
                {category.group}
              </ListSubheader>,
              category.items.map((item) => (
                <MenuItem 
                  key={item.value} 
                  value={item.value}
                  sx={{
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}15`,
                      transform: 'translateX(8px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon={item.icon} width={24} height={24} />
                    <Typography>{item.label}</Typography>
                  </Box>
                </MenuItem>
              ))
            ])}
          </Select>

          <Box mt={4}>
            <motion.div>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleStartQuiz}
                size="large"
                startIcon={<Icon icon="mdi:play" />}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
                disabled={loading} // Disable button when loading
              >
                {loading ? 'Se încarcă...' : 'Începe Chestionarul'}
              </Button>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
});

export default QuizSelection;