import React from 'react';
import { Typography, Box, Radio, RadioGroup, FormControlLabel, FormControl, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const Question = ({ question, handleAnswerChange, selectedAnswer, answerValidation, answerSubmitted }) => {
  const theme = useTheme();

  if (!question) {
    return null; // Prevent rendering if question is undefined
  }

  // Get correct answer - support both field names for compatibility
  const correctAnswer = question.raspuns_corect || question.varianta_corecta;

  // Background color logic
  const getColor = (option) => {
    if (!answerSubmitted) {
      return theme.palette.background.paper; // Default background before submission
    }
    if (option === correctAnswer) {
      return theme.palette.success.light; // Always highlight the correct answer in green
    }
    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      return theme.palette.error.light; // Highlight the incorrect selected answer in red
    }
    return theme.palette.background.paper; // Default for other options
  };

  // Border color logic
  const getBorderColor = (option) => {
    if (!answerSubmitted) {
      return selectedAnswer === option ? theme.palette.primary.main : theme.palette.divider;
    }
    if (option === correctAnswer) {
      return theme.palette.success.main; // Correct answer
    }
    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      return theme.palette.error.main; // Incorrect selected answer
    }
    return theme.palette.divider; // Neutral border for other options
  };

  return (
    <Box mb={4}>
      {/* Question Title */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: 3,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          backgroundClip: 'text',
          textFillColor: 'transparent',
        }}
      >
        {question.intrebare}
      </Typography>

      {/* Answer Options */}
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
          {['a', 'b', 'c', 'd'].map((option) => (
            <motion.div
              key={option}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
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
                  border: `2px solid ${getBorderColor(option)}`,
                  cursor: !answerSubmitted ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  '&:hover': !answerSubmitted && {
                    transform: 'translateX(5px)',
                    borderColor: theme.palette.primary.main,
                    backgroundColor: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                <FormControlLabel
                  value={option}
                  control={
                    <Radio
                      disabled={answerSubmitted}
                      sx={{
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body1"
                      sx={{
                        color:
                          answerSubmitted && option === correctAnswer
                            ? theme.palette.success.main // Correct answer
                            : answerSubmitted && option === selectedAnswer && selectedAnswer !== correctAnswer
                            ? theme.palette.error.main // Incorrect answer
                            : 'text.primary', // Default text color
                      }}
                    >
                      {question[`varianta_${option}`]}
                    </Typography>
                  }
                  sx={{ width: '100%' }}
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
