import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button, Box, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import { createExcused, deleteExcused, getExcused } from '@stex-react/api'; // adjust path as needed

export function ExcusedAccordion({ quizId, courseId, courseInstance }) {
  const [excusedList, setExcusedList] = useState([]);
  const [newUserId, setNewUserId] = useState('');

  async function fetchExcused() {
    const data = await getExcused(quizId, courseId, courseInstance);
    setExcusedList(Array.isArray(data) ? data : [data]);
  }

  useEffect(() => {
    if (quizId !== 'New') fetchExcused();
  }, [quizId]);

  async function handleCreate() {
    if (!newUserId.trim()) return;
    await createExcused(newUserId.trim(), quizId, courseId, courseInstance);
    setNewUserId('');
    fetchExcused();
  }

  async function handleDelete(userId) {
    await deleteExcused({ userId, quizId, courseId, courseInstance });
    fetchExcused();
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Excused Students for this Quiz</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" gap={1} mb={2}>
          <TextField
            label="Student User ID"
            size="small"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
          />
          <Button variant="contained" onClick={handleCreate}>
            Add Excused
          </Button>
        </Box>
        <ul>
          {excusedList.map((e) => (
            <li key={e.userId}>
              {e.userId}
              <IconButton onClick={() => handleDelete(e.userId)} size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </li>
          ))}
        </ul>
      </AccordionDetails>
    </Accordion>
  );
}
