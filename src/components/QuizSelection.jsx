import React, { useState } from 'react';
import { 
  Container, Paper, Typography, MenuItem, Select, Button, Box,
  ListSubheader, useTheme, useMediaQuery 
} from '@mui/material';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { supabase } from '../supabase/supabaseClient';

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

  const handleStartQuiz = async () => {
    if (selectedOption) {
      setLoading(true);
      try {
        // Fetch questions based on the selected category
        let data;
        if (selectedOption === 'all') {
          const response = await supabase.rpc('get_random_questions');
          data = response.data;
        } else {
          const categoryMap = {
            category1: { start_id: 1000, end_id: 1040 },
            category2: { start_id: 2000, end_id: 2040 },
            category3: { start_id: 3000, end_id: 3040 },
            category4: { start_id: 4000, end_id: 4040 },
            category5: { start_id: 5000, end_id: 5040 },
            category6: { start_id: 6000, end_id: 6040 },
            category7: { start_id: 7000, end_id: 7040 },
            category8: { start_id: 8000, end_id: 8040 },
            category9: { start_id: 9000, end_id: 9040 },
            category10: { start_id: 10000, end_id: 10040 },
          };
          const { start_id, end_id } = categoryMap[selectedOption];
          const response = await supabase.rpc('get_random_questions_by_category', {
            start_id,
            end_id,
            limit_count: 40,
          });
          data = response.data;
        }

        // Save quiz state and questions to localStorage
        const initialQuizState = {
          quizType: selectedOption,
          questions: data || [],
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