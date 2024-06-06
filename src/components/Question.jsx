import React from 'react';
import { Typography, Box, Radio, RadioGroup, FormControlLabel, FormControl, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Question = ({ question, handleAnswerChange, selectedAnswer, answerValidation, answerSubmitted }) => {
  const theme = useTheme();

  const getColor = (option) => {
    if (!answerSubmitted) {
      return theme.palette.background.paper; // Background color from theme
    }
    if (selectedAnswer === option) {
      return answerValidation === true
        ? theme.palette.success.light // Green for correct
        : theme.palette.error.light; // Red for incorrect
    }
    if (answerValidation === false && question.varianta_corecta === option) {
      return theme.palette.success.light; // Green for correct answer
    }
    return theme.palette.background.paper; // Background color from theme
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
