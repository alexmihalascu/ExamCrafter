import { useMemo } from 'react';
import {
  Typography,
  Box,
  Paper,
  Checkbox,
  Radio,
  FormControlLabel,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { OPTION_KEYS } from '../utils/questionUtils';
import type { NormalizedQuestion, QuestionOption } from '../types';

type AnswerValue = string | string[];

interface QuestionProps {
  question: NormalizedQuestion;
  onAnswerChange: (questionId: string, value: AnswerValue) => void;
  selectedAnswer?: AnswerValue;
  answerSubmitted: boolean;
}

const normalizeOptions = (question: NormalizedQuestion): QuestionOption[] => {
  if (Array.isArray(question?.options) && question.options.length) {
    return question.options.map((opt, index) => ({
      id: opt.id || OPTION_KEYS[index] || `opt${index}`,
      text: opt.text ?? '',
    }));
  }

  return OPTION_KEYS.map((key) => {
    const variant = question?.[`varianta_${key}`];
    return variant ? { id: key, text: String(variant) } : null;
  }).filter((opt): opt is QuestionOption => Boolean(opt));
};

const Question = ({ question, onAnswerChange, selectedAnswer, answerSubmitted }: QuestionProps) => {
  const theme = useTheme();
  const options = useMemo(() => normalizeOptions(question), [question]);
  const allowMultiple = question?.allowMultiple || (question?.correctAnswers?.length || 0) > 1;

  const normalizedSelected = useMemo<string[]>(() => {
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer;
    }
    if (typeof selectedAnswer === 'string' && selectedAnswer) {
      return [selectedAnswer];
    }
    return [];
  }, [selectedAnswer]);

  const correctAnswers = useMemo<string[]>(() => {
    if (Array.isArray(question?.correctAnswers) && question.correctAnswers.length) {
      return question.correctAnswers.map((ans) => ans.toLowerCase());
    }
    const fallback = question?.raspuns_corect
      ? question.raspuns_corect.split(',').map((ans) => ans.trim().toLowerCase())
      : [];
    return fallback.length ? fallback : [question?.varianta_corecta || 'a'];
  }, [question]);

  const getColors = (optionId: string) => {
    if (!answerSubmitted) {
      return {
        border: normalizedSelected.includes(optionId) ? theme.palette.primary.main : theme.palette.divider,
        background: theme.palette.background.paper,
        text: theme.palette.text.primary,
      };
    }

    if (correctAnswers.includes(optionId.toLowerCase())) {
      return {
        border: theme.palette.success.main,
        background: `${theme.palette.success.main}22`,
        text: theme.palette.success.main,
      };
    }

    if (normalizedSelected.includes(optionId)) {
      return {
        border: theme.palette.error.main,
        background: `${theme.palette.error.main}15`,
        text: theme.palette.error.main,
      };
    }

    return {
      border: theme.palette.divider,
      background: theme.palette.background.paper,
      text: theme.palette.text.primary,
    };
  };

  const handleSelect = (optionId: string) => {
    if (answerSubmitted) return;

    const questionId = question.id as string;
    if (allowMultiple) {
      const nextSelection = normalizedSelected.includes(optionId)
        ? normalizedSelected.filter((id) => id !== optionId)
        : [...normalizedSelected, optionId];
      onAnswerChange(questionId, nextSelection);
    } else {
      onAnswerChange(questionId, optionId);
    }
  };

  return (
    <Box mb={4}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: 3,
          color: 'text.primary',
          textAlign: 'left',
          textWrap: 'balance',
        }}
      >
        {question.intrebare}
      </Typography>

      {allowMultiple && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Selecteaza toate raspunsurile corecte
        </Typography>
      )}

      <Stack spacing={2}>
        {options.map((option) => {
          const palette = getColors(option.id);
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Paper
                onClick={() => handleSelect(option.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3,
                  cursor: answerSubmitted ? 'default' : 'pointer',
                  backgroundColor: palette.background,
                  border: `1px solid ${palette.border}`,
                  transition: 'all 0.2s ease',
                  '&:hover': !answerSubmitted
                    ? {
                        borderColor: theme.palette.primary.main,
                        transform: 'translateX(4px)',
                      }
                    : {},
                }}
              >
                <FormControlLabel
                  value={option.id}
                  control={
                    allowMultiple ? (
                      <Checkbox
                        checked={normalizedSelected.includes(option.id)}
                        disabled={answerSubmitted}
                        onChange={() => handleSelect(option.id)}
                      />
                    ) : (
                      <Radio
                        checked={normalizedSelected.includes(option.id)}
                        disabled={answerSubmitted}
                        onChange={() => handleSelect(option.id)}
                      />
                    )
                  }
                  label={
                    <Typography variant="body1" sx={{ color: palette.text }}>
                      <strong style={{ textTransform: 'uppercase', marginRight: 6 }}>{option.id}.</strong>
                      {option.text}
                    </Typography>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>
            </motion.div>
          );
        })}
      </Stack>
    </Box>
  );
};

export default Question;
