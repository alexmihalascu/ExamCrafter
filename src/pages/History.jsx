import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { Typography, Paper } from '@mui/material';
import PieChart from '../components/PieChart';

const History = () => {
  const { user } = useUser();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/history?userId=${user.id}`)
      .then(response => {
        setHistory(response.data);
      })
      .catch(error => {
        console.error('Error fetching history', error);
      });
  }, [user.id]);

  const correctAnswers = history.filter(entry => entry.correct).length;
  const incorrectAnswers = history.length - correctAnswers;

  return (
    <Paper style={{ padding: '20px' }}>
      <Typography variant="h4">Istoric Răspunsuri</Typography>
      <PieChart correct={correctAnswers} incorrect={incorrectAnswers} />
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
            <Typography>{entry.question}</Typography>
            <Typography>Răspunsul tău: {entry.user_answer}</Typography>
            <Typography>Răspunsul corect: {entry.correct_answer}</Typography>
          </li>
        ))}
      </ul>
    </Paper>
  );
};

export default History;
