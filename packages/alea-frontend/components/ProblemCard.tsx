import { Box, Typography, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material';
import { Problem } from '@stex-react/api';

const ProblemCard: React.FC<{
  problem: Problem | null;
  selectedOption: string | null;
  onOptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ problem, selectedOption, onOptionChange }) => {
  return (
    <Box
      sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, mb: 2, backgroundColor: '#f9f9f9' }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {problem?.question}
      </Typography>
      <RadioGroup value={selectedOption || ''} onChange={(event) => onOptionChange(event)}>
        {problem?.options?.map((option, index) => (
          <Box
            key={index}
            sx={{
              border: '1px solid #ddd',
              borderRadius: 2,
              p: 1,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              '&:hover': {
                borderColor: 'rgb(32, 51, 96)',
              },
            }}
          >
            <FormControlLabel
              value={option}
              control={<Radio />}
              label={<Typography variant="body1">{option}</Typography>}
              sx={{ width: '100%' }}
            />
          </Box>
        ))}
      </RadioGroup>
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" sx={{ mb: 1 }}>
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default ProblemCard;
