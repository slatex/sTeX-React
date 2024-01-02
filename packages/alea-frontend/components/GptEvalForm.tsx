import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import {
  ProblemEval as ProblemEval,
  CompletionEval,
  Tristate,
} from '@stex-react/api';
import { Fragment, useEffect, useState } from 'react';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const TriStateCheckbox = ({
  value,
  label,
  onChange,
}: {
  value?: Tristate;
  label: string;
  onChange: (value: Tristate) => void;
}) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={value === Tristate.TRUE}
          indeterminate={!value || value === Tristate.UNKNOWN}
          checkedIcon={<CheckBoxIcon htmlColor="green" />}
          icon={<CancelRoundedIcon htmlColor="red" />}
          onChange={() => {
            switch (value) {
              case Tristate.TRUE:
                onChange(Tristate.FALSE);
                break;
              case Tristate.FALSE:
                onChange(Tristate.UNKNOWN);
                break;
              case Tristate.UNKNOWN:
              default:
                onChange(Tristate.TRUE);
                break;
            }
          }}
        />
      }
      label={label}
    />
  );
};

function ProblemEvalForm({
  problemEval,
  onChange,
}: {
  problemEval: ProblemEval;
  onChange: (pEval: ProblemEval) => void;
}) {
  return (
    <Box mb={2}>
      <TextField
        label="Problem Descriptive Evaluation"
        value={problemEval.textDescription || ''}
        onChange={({ target }) =>
          onChange({ ...problemEval, textDescription: target.value })
        }
        name="textDescription"
        fullWidth
      />
      <br />
      <TriStateCheckbox
        value={problemEval?.isUsable}
        label="Is Usable"
        onChange={(value) => onChange({ ...problemEval, isUsable: value })}
      />
      <TriStateCheckbox
        value={problemEval?.doesCompile}
        label="Does compile"
        onChange={(value) => onChange({ ...problemEval, doesCompile: value })}
      />
      <TriStateCheckbox
        value={problemEval?.hasCorrectImports}
        label="Has Correct Imports"
        onChange={(value) =>
          onChange({ ...problemEval, hasCorrectImports: value })
        }
      />
      <br />
      <TextField
        label="Num Content Errors"
        type="number"
        value={problemEval.numContentErrors || ''}
        onChange={({ target }) =>
          onChange({ ...problemEval, numContentErrors: +target.value })
        }
        name="numContentErrors"
        sx={{ mb: 2 }}
      />
      <br />
      <TextField
        label="Num Missed Annotations"
        type="number"
        value={problemEval.numMissedAnnotations || ''}
        onChange={({ target }) =>
          onChange({ ...problemEval, numMissedAnnotations: +target.value })
        }
        name="numMissedAnnotations"
        sx={{ mr: 2 }}
      />

      <TextField
        label="Num Wrong Annotations"
        type="number"
        value={problemEval.numWrongAnnotations || ''}
        onChange={({ target }) =>
          onChange({ ...problemEval, numWrongAnnotations: +target.value })
        }
        name="numWrongAnnotations"
      />
      <TextField
        label="Corrected Problem"
        type="number"
        value={problemEval.fixedProblem || ''}
        onChange={({ target }) =>
          onChange({ ...problemEval, fixedProblem: target.value })
        }
        name="fixedProblem"
        sx={{ mt: 2 }}
        fullWidth
        multiline
      />
    </Box>
  );
}

function CompletionEvalForm({
  runId,
  completionIdx,
  initial,
  onSubmit,
}: {
  runId: string;
  completionIdx: number;
  initial: CompletionEval;
  onSubmit: (completionEval: CompletionEval) => void;
}) {
  const [numProblems, setNumProblems] = useState(1);
  const [textDescription, setTextDescription] = useState('');
  const [problemEvals, setProblemEvals] = useState<ProblemEval[]>([]);

  useEffect(() => {
    setTextDescription(initial?.textDescription ?? '');
    setNumProblems(initial?.problemEvals?.length ?? 1);
    setProblemEvals(initial?.problemEvals ?? [{}]);
  }, [initial]);

  useEffect(() => {
    setProblemEvals((existingQ) => {
      const toAdd = numProblems - existingQ.length;
      if (toAdd > 0) {
        return [...existingQ, ...Array.from({ length: toAdd }, () => ({}))];
      } else if (toAdd < 0) {
        return existingQ.slice(0, numProblems);
      }
      return existingQ;
    });
  }, [numProblems]);

  const handleQEvalChange = (index: number, problem: ProblemEval) => {
    const newEvals = [...problemEvals];
    newEvals[index] = problem;
    setProblemEvals(newEvals);
  };

  return (
    <Box>
      <Typography
        variant="h5"
        mt={2}
        mb={1}
        sx={{ textDecoration: 'underline' }}
      >
        Evaluation
      </Typography>
      <Box mb={2}>
        <TextField
          label="Overall descriptive evaluation"
          value={textDescription}
          onChange={(e) => setTextDescription(e.target.value)}
          fullWidth
        />
      </Box>
      <Box mb={2}>
        <TextField
          label="Number of Questions"
          type="number"
          value={numProblems}
          onChange={(e) => setNumProblems(parseInt(e.target.value) ?? 1)}
        />
      </Box>
      {problemEvals.map((problemEval, index) => (
        <Fragment key={index}>
          <Typography variant="h6" mb={2}>
            Evaluation for problem {index + 1}
          </Typography>
          <ProblemEvalForm
            problemEval={problemEval}
            onChange={(newEval) => handleQEvalChange(index, newEval)}
          />
        </Fragment>
      ))}
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          const completionEval: CompletionEval = {
            runId,
            completionIdx,
            textDescription,
            problemEvals,
            version: 'unused',
            evaluator: 'unused',
            updateTime: 'unused',
          };
          onSubmit(completionEval);
        }}
      >
        Submit
      </Button>
    </Box>
  );
}

export default CompletionEvalForm;
