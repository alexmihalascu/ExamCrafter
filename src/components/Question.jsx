import React from 'react';
import { Typography, Box, Radio, RadioGroup, FormControlLabel, FormControl, Paper } from '@mui/material';

const Question = ({ question, handleAnswerChange, selectedAnswer }) => {
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
              }}
            >
              <FormControlLabel
                value={option}
                control={<Radio />}
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
