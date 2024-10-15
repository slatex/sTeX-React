import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Alert,
} from '@mui/material';

import dayjs from 'dayjs';
import { CURRENT_TERM } from '@stex-react/utils';
import {
  HomeworkInfo,
  getHomeworkList,
  createHomework,
  updateHomework,
  deleteHomework,
  UpdateHomeworkRequest,
  CreateHomeworkRequest,
} from '@stex-react/api';
import { getLocaleObject } from '../lang/utils';
import { useRouter } from 'next/router';
import HomeworkForm from './HomeworkForm';
import HomeworkList from './HomeworkList';

const HomeworkManager = ({ courseId }) => {
  const [homeworks, setHomeworks] = useState<HomeworkInfo[]>([]);
  const [homeworkId, setHomeworkId] = useState<number | null>(null);
  const [homeworkName, setHomeworkName] = useState('');
  const [homeworkGivenDate, setHomeworkGivenDate] = useState('');
  const [answerReleaseDate, setAnswerReleaseDate] = useState('');
  const [archive, setArchive] = useState('');
  const [filepath, setFilepath] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
      homeworkGivenDate,
      answerReleaseDate,
      archive,
      filepath,
      ...(homeworkId ? { homeworkId } : {}),
      courseId,
      courseInstance: CURRENT_TERM,
    };

    try {
      let response;
      if (homeworkId) {
        response = await updateHomework(body as UpdateHomeworkRequest);
      } else {
        response = await createHomework(body as CreateHomeworkRequest);
      }
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
    const formattedGivenDate = dayjs(homework.homeworkGivenDate).format('YYYY-MM-DD');
    setHomeworkGivenDate(formattedGivenDate);
    const formattedReleaseDate = dayjs(homework.answerReleaseDate).format('YYYY-MM-DD');
    setAnswerReleaseDate(formattedReleaseDate);
    setArchive(homework.archive);
    setFilepath(homework.filepath);
    setView('edit');
  };
  const handleDelete = async () => {
    if (selectedHomeworkId) {
      try {
        const response = await deleteHomework(selectedHomeworkId, courseId);
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
    setHomeworkGivenDate('');
    setAnswerReleaseDate('');
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
          <HomeworkList
            homeworks={homeworks}
            t={t}
            handleEdit={handleEdit}
            confirmDelete={confirmDelete}
            setView={setView}
          />
        )}
        {view === 'create' || view === 'edit' ? (
          <HomeworkForm
            homeworkName={homeworkName}
            homeworkId={homeworkId}
            setHomeworkName={setHomeworkName}
            homeworkGivenDate={homeworkGivenDate}
            setHomeworkGivenDate={setHomeworkGivenDate}
            answerReleaseDate={answerReleaseDate}
            setAnswerReleaseDate={setAnswerReleaseDate}
            archive={archive}
            setArchive={setArchive}
            filepath={filepath}
            setFilepath={setFilepath}
            handleSave={handleSave}
            resetForm={resetForm}
            view={view}
            t={t}
          />
        ) : null}

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
