import React, { useState } from 'react';
import { Container, Paper, Typography, MenuItem, Select, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';

const QuizSelection = ({ onSelect }) => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleStartQuiz = () => {
    if (selectedOption) {
      onSelect(selectedOption);
    } else {
      alert('Te rog să selectezi un tip de chestionar.');
    }
  };

  return (
    <Container maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper style={{ padding: '20px', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Selectează Tipul de Chestionar
          </Typography>
          <Select
            value={selectedOption}
            onChange={handleChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>
              Selectează
            </MenuItem>
            <MenuItem value="all">Aleatoare (45 întrebări din toate categoriile)</MenuItem>
            <MenuItem value="category1">Realizarea aplicațiilor cu baze de date MS ACCESS Teste grilă rezolvate</MenuItem>
            <MenuItem value="category2">Realizarea aplicațiilor cu baze de date MS ACCESS Teste grilă propuse spre rezolvare</MenuItem>
            <MenuItem value="category3">Realizarea aplicațiilor cu baze de date ORACLE SQL Teste grilă rezolvate</MenuItem>
            <MenuItem value="category4">Realizarea aplicațiilor cu baze de date ORACLE SQL Teste grilă propuse spre rezolvare</MenuItem>
            <MenuItem value="category5">Proiectarea sistemelor informatice Teste grilă rezolvate</MenuItem>
            <MenuItem value="category6">Proiectarea sistemelor informatice Teste grilă propuse spre rezolvare</MenuItem>
            <MenuItem value="category7">Arhitectura calculatoarelor, sisteme de operare și rețele de calculatoare Teste grilă rezolvate</MenuItem>
            <MenuItem value="category8">Arhitectura calculatoarelor, sisteme de operare și rețele de calculatoare Teste grilă propuse spre rezolvare</MenuItem>
            <MenuItem value="category9">Programare C# Teste grilă rezolvate</MenuItem>
            <MenuItem value="category10">Programare C# Teste grilă propuse spre rezolvare</MenuItem>
          </Select>
          <Box mt={4}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button variant="contained" color="primary" onClick={handleStartQuiz}>
                Începe Chestionarul
              </Button>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default QuizSelection;
