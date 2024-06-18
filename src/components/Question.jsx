import React from 'react';
import { Typography, Box, Radio, RadioGroup, FormControlLabel, FormControl, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const Question = ({ question, handleAnswerChange, selectedAnswer, answerValidation, answerSubmitted }) => {
  const theme = useTheme();

  // Function to determine the color of the Paper based on the answer status
  const getColor = (option) => {
    if (!answerSubmitted) {
      return theme.palette.background.paper; // Default background color before answer is submitted
    }
    if (selectedAnswer === option) {
      return answerValidation === true
        ? theme.palette.success.light // Correct answer
        : theme.palette.error.light; // Incorrect answer
    }
    if (answerValidation === false && question.varianta_corecta === option) {
      return theme.palette.success.light; // Highlight correct answer if selected answer is wrong
    }
    return theme.palette.background.paper; // Default background color
  };

  const flickerEffect = {
    initial: { opacity: 1 },
    flicker: {
      opacity: [1, 0.5, 1, 0.5, 1],
      transition: { times: [0, 0.25, 0.5, 0.75, 1], duration: 1.5 }
    },
    static: { opacity: 1 },
  };

  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        {question.intrebare}
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
          {['a', 'b', 'c', 'd'].map((option) => (
            <motion.div
              key={option}
              initial="initial"
              animate={answerSubmitted && option === selectedAnswer ? 'flicker' : 'initial'}
              variants={flickerEffect}
              onAnimationComplete={() => answerSubmitted && option === selectedAnswer ? 'static' : 'initial'}
            >
              <Paper
                elevation={3}
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
            </motion.div>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default Question;
