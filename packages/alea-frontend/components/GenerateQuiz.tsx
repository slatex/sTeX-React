import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  TextField,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ListStepper } from '@stex-react/stex-react-renderer';
import { generateQuizProblems } from '@stex-react/api';

const Problem = ({
  question,
  chosenOption,
  setChosenOption,
  submitted,
  onSubmit,
  showSolution,
}: {
  question: QuizQuestion;
  chosenOption: string | string[];
  setChosenOption: (value: string | string[]) => void;
  submitted: boolean;
  onSubmit: () => void;
  showSolution: boolean;
}) => {
  const isCorrect = () => {
    if (question.questionType === 'msq') {
      return (
        JSON.stringify([...chosenOption].sort()) ===
        JSON.stringify([...question.correctAnswer].sort())
      );
    }
    return chosenOption === question.correctAnswer;
  };

  return (
    <Box my={2}>
      <Typography variant="h6" mb={2}>
        {question.question}
      </Typography>

      {question.questionType === 'mcq' && (
        <RadioGroup value={chosenOption} onChange={(e) => setChosenOption(e.target.value)}>
          {question.options.map((opt, idx) => (
            <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
          ))}
        </RadioGroup>
      )}

      {question.questionType === 'msq' && (
        <Box>
          {question.options.map((opt, idx) => (
            <FormControlLabel
              key={idx}
              control={
                <Checkbox
                  checked={Array.isArray(chosenOption) && chosenOption.includes(opt)}
                  onChange={(e) => {
                    if (!Array.isArray(chosenOption)) return;

                    const newSelection = e.target.checked
                      ? [...chosenOption, opt]
                      : chosenOption.filter((item) => item !== opt);
                    setChosenOption(newSelection);
                  }}
                />
              }
              label={opt}
            />
          ))}
        </Box>
      )}

      {question.questionType === 'fill' && (
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={chosenOption}
          onChange={(e) => setChosenOption(e.target.value)}
          placeholder="Type your answer here"
        />
      )}

      {!submitted ? (
        <Button onClick={onSubmit} variant="contained" sx={{ mt: 2 }}>
          Submit
        </Button>
      ) : (
        <Box mt={2}>
          <Typography variant="subtitle1" color={isCorrect() ? 'green' : 'red'}>
            {isCorrect() ? 'Correct!' : 'Incorrect.'}
          </Typography>
          {showSolution && (
            <Box mt={1}>
              <Typography>
                <strong>Correct Answer:</strong>{' '}
                {Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join(', ')
                  : question.correctAnswer}
              </Typography>
              <Typography mt={1}>
                <strong>Feedback:</strong> {question.explanation}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export type QuizQuestionType = 'mcq' | 'msq' | 'fill';
export interface QuizQuestion {
  question: string;
  options?: string[];
  questionType: QuizQuestionType;
  correctAnswer?: string | string[];
  explanation?: string;
}
interface QuestionResponse {
  chosenOption: string | string[];
  submitted: boolean;
}

const QuizComponent = ({
  courseId,
  sectionId,
  sectionUri,
}: {
  courseId: string;
  sectionId: string;
  sectionUri: string;
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionResponses, setQuestionResponses] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const handleGenerate = async (e) => {
    e.stopPropagation();
    setLoading(true);

    try {
      const response = await generateQuizProblems(courseId, sectionId, sectionUri);
      const quiz = response.quiz || [];
      const formatted = quiz.map((q) => ({
        ...q,
        options: q.options || [],
        questionType: q.questionType,
      }));

      setQuestions(formatted);

      setQuestionResponses(
        formatted.map((q) => ({
          chosenOption: q.questionType === 'msq' ? [] : '',
          submitted: false,
        }))
      );

      setShowQuiz(true);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (value) => {
    const updated = [...questionResponses];
    updated[currentIdx].chosenOption = value;
    setQuestionResponses(updated);
  };

  const handleSubmit = () => {
    const updated = [...questionResponses];
    updated[currentIdx].submitted = true;
    setQuestionResponses(updated);
  };

  const currentQuestion = questions[currentIdx];
  const { chosenOption, submitted } = questionResponses[currentIdx] || {};

  return (
    <Accordion expanded={showQuiz} onChange={() => setShowQuiz(!showQuiz)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" flexGrow={1}>
          Generate Quiz Questions
        </Typography>
        {!showQuiz && (
          <Button onClick={handleGenerate} variant="contained" size="small" disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        )}
      </AccordionSummary>

      <AccordionDetails>
        {questions.length > 0 && (
          <Paper sx={{ borderRadius: 3, p: 1.5, boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.25)' }}>
            <Typography variant="h5" mb={1}>
              Quiz - Question {currentIdx + 1} of {questions.length}
            </Typography>

            <ListStepper
              idx={currentIdx}
              listSize={questions.length}
              onChange={(idx) => setCurrentIdx(idx)}
            />

            <Problem
              question={currentQuestion}
              chosenOption={chosenOption}
              setChosenOption={handleOptionChange}
              submitted={submitted}
              onSubmit={handleSubmit}
              showSolution
            />
          </Paper>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default QuizComponent;
