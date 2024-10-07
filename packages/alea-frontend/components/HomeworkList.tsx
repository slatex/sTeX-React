import React from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';

const HomeworkList = ({ homeworks, t, setView, handleEdit, confirmDelete }) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          mb: 2,
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          {t.homeworks}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setView('create')}
          sx={{
            borderRadius: '25px',
            marginLeft: '5px',
          }}
        >
          {t.createHomework}{' '}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: '500px', overflowY: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }}>{t.homeworkName}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{t.homeworkGivenDate}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{t.answerReleaseDate}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{t.archive}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{t.filePath}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{t.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {homeworks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="h6" sx={{ textAlign: 'center' }}>
                    {t.noHomeworkAvailable}{' '}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {homeworks.map((homework) => {
              const formattedGivenDate = dayjs(homework.homeworkGivenDate).format('YYYY-MM-DD');
              const formattedReleaseDate = dayjs(homework.answerReleaseDate).format('YYYY-MM-DD');

              return (
                <TableRow key={homework.homeworkId}>
                  <TableCell>{homework.homeworkName}</TableCell>
                  <TableCell>{formattedGivenDate}</TableCell>
                  <TableCell>{formattedReleaseDate}</TableCell>
                  <TableCell>{homework.archive}</TableCell>
                  <TableCell
                    style={{
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '300px',
                    }}
                  >
                    {homework.filepath}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(homework)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => confirmDelete(homework.homeworkId)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default HomeworkList;
