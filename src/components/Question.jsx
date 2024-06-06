import React from 'react';
import { Typography, Box, Radio, RadioGroup, FormControlLabel, FormControl, Paper } from '@mui/material';

const Question = ({ question, handleAnswerChange, selectedAnswer, answerValidation, answerSubmitted }) => {
  const getColor = (option) => {
    if (!answerSubmitted) {
      return '#fff'; // Default white background if answer is not submitted yet
    }
    if (selectedAnswer === option) {
      return answerValidation === true
        ? '#c8e6c9' // Green for correct
        : '#ffcdd2'; // Red for incorrect
    }
    if (answerValidation === false && question.varianta_corecta === option) {
      return '#c8e6c9'; // Green for correct answer
    }
    return '#fff'; // Default white background
  };

  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        {question.intrebare}
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
          {['a', 'b', 'c', 'd'].map((option) => (
            <Paper
              key={option}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: getColor(option),
              }}
            >
              <FormControlLabel
                value={option}
                control={<Radio disabled={answerSubmitted} />}
                label={
                  <Typography variant="body1">
                    {question[`varianta_${option}`]}
                  </Typography>
                }
                sx={{
                  width: '100%',
                }}
              />
            </Paper>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default Question;
