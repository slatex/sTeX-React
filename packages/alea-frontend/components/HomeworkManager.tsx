import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Alert,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CURRENT_TERM, PRIMARY_COL } from '@stex-react/utils';
import {
  HomeworkInfo,
  getHomeworkList,
  createHomework,
  updateHomework,
  deleteHomework,
} from '@stex-react/api';
import Link from 'next/link';
import { getLocaleObject } from '../lang/utils';
import { useRouter } from 'next/router';

const HomeworkManager = ({ courseId }) => {
  const [homeworks, setHomeworks] = useState<HomeworkInfo[]>([]);
  const [homeworkId, setHomeworkId] = useState<number | null>(null);
  const [homeworkName, setHomeworkName] = useState<string>('');
  const [homeworkDate, setHomeworkDate] = useState<string>('');
  const [archive, setArchive] = useState<string>('');
  const [filepath, setFilepath] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<number | null>(null);
  const { homeworkManager: t } = getLocaleObject(useRouter());

  const getHomeworks = async () => {
    try {
      const homeworkList = await getHomeworkList(courseId);
      setHomeworks(homeworkList);
    } catch (error) {
      console.error('An unexpected error occurred', error);
      setMessage('An error occured');
    }
    setOpenSnackbar(true);
  };

  useEffect(() => {
    if (view === 'list') {
      getHomeworks();
    }
  }, [view, courseId]);

  const handleSave = async () => {
    const body = {
      homeworkName,
      homeworkDate,
      archive,
      filepath,
      ...(homeworkId ? { homeworkId } : {}),
      courseId,
      courseInstance: CURRENT_TERM,
    };

    try {
      let response;
      if (homeworkId) {
        response = await updateHomework(body);
      } else {
        response = await createHomework(body);
      }
      console.log('resDD', response);
      setMessage(response.data.message);
      setOpenSnackbar(true);
      resetForm(false);
      getHomeworks();
    } catch (error) {
      console.error('Error details:', error);
      setMessage(error.response?.data?.message || 'An error occurred');
      setOpenSnackbar(true);
    }
  };

  const handleEdit = (homework: HomeworkInfo) => {
    setHomeworkId(homework.homeworkId);
    setHomeworkName(homework.homeworkName);
    const localDate = new Date(homework.homeworkDate);
    const formattedDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(localDate.getDate()).padStart(2, '0')}`;
    setHomeworkDate(formattedDate);
    setArchive(homework.archive);
    setFilepath(homework.filepath);
    setView('edit');
  };
  const handleDelete = async () => {
    if (selectedHomeworkId) {
      try {
        const response = await deleteHomework(selectedHomeworkId);
        setMessage(response.message);
        setOpenSnackbar(true);
        getHomeworks();
      } catch (error) {
        setMessage(error?.response?.data?.message || 'An error occurred');
        setOpenSnackbar(true);
      }
    }
    setDeleteDialogOpen(false);
  };

  const confirmDelete = (homeworkId: number) => {
    setSelectedHomeworkId(homeworkId);
    setDeleteDialogOpen(true);
  };

  const resetForm = (isCancelled = true) => {
    setHomeworkId(null);
    setHomeworkName('');
    setHomeworkDate('');
    setArchive('');
    setFilepath('');
    setView('list');
    if (isCancelled) {
      if (homeworkId) {
        setMessage('Homework updation cancelled');
      } else {
        setMessage('Homework creation cancelled');
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setMessage('');
  };
  const sourcePath = filepath.replace('xhtml', 'tex');

  return (
    <Box
      maxWidth="900px"
      sx={{
        margin: '0 auto',
        padding: '0 16px',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        {t.homeworkManagement}{' '}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 3,
          px: 3,
          py: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
        }}
      >
        {view === 'list' && (
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
                    <TableCell style={{ fontWeight: 'bold' }}>{t.date}</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>{t.archive}</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>{t.filePath}</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>{t.actions}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {homeworks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                          {t.noHomeworkAvailable}{' '}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {homeworks.map((homework) => {
                    const localDate = new Date(homework.homeworkDate);
                    const formattedDate = `${localDate.getFullYear()}-${String(
                      localDate.getMonth() + 1
                    ).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
                    return (
                      <TableRow key={homework.homeworkId}>
                        <TableCell>{homework.homeworkName}</TableCell>
                        <TableCell>{formattedDate}</TableCell>
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
                          <IconButton
                            color="error"
                            onClick={() => confirmDelete(homework.homeworkId)}
                          >
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
        )}

        {(view === 'create' || view === 'edit') && (
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            sx={{ width: '100%', mt: 3 }}
          >
            <TextField
              label={t.homeworkName}
              variant="outlined"
              fullWidth
              margin="normal"
              value={homeworkName}
              onChange={(e) => setHomeworkName(e.target.value)}
              required
            />
            <TextField
              label={t.date}
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={homeworkDate}
              onChange={(e) => setHomeworkDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t.archive}
                variant="outlined"
                fullWidth
                value={archive}
                onChange={(e) => setArchive(e.target.value)}
              />
              <TextField
                label={t.filePath}
                variant="outlined"
                fullWidth
                value={filepath}
                onChange={(e) => setFilepath(e.target.value)}
              />
              <Link
                href={`https://gl.mathhub.info/${archive}/-/blob/main/source/${sourcePath}`}
                target="_blank"
              >
                <OpenInNewIcon style={{ color: PRIMARY_COL }} />
              </Link>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                {homeworkId ? t.updateHomework : t.saveHomework}
              </Button>
              <Button variant="contained" color="secondary" onClick={() => resetForm()}>
                {t.cancel}
              </Button>
            </Box>
          </Box>
        )}

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-confirmation-dialog"
        >
          <DialogTitle id="delete-confirmation-dialog">Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this homework?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default HomeworkManager;
