import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  IconButton,
  Grid,
  Card,
  CardContent,
  TableCell,
  TableBody,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const HomeworkManager = () => {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [homeworkId, setHomeworkId] = useState<number | null>(null);
  const [homeworkName, setHomeworkName] = useState('');
  const [homeworkDate, setHomeworkDate] = useState('');
  const [archive, setArchive] = useState('');
  const [filepath, setFilepath] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<number | null>(null);

  const getHomework = () => [
    {
      homeworkId: 1,
      homeworkName: 'Math Assignment',
      homeworkDate: '2024-09-30',
      archive: 'no',
      filepath: '/homework/math.pdf',
    },
    {
      homeworkId: 2,
      homeworkName: 'Science Project',
      homeworkDate: '2024-10-01',
      archive: 'no',
      filepath: '/homework/science.pdf/',
    },
  ];

  useEffect(() => {
    if (view === 'list') {
      const fetchedHomeworks = getHomework();
      setHomeworks(fetchedHomeworks);
    }
  }, [view]);

  const handleSave = () => {
    if (homeworkId) {
      const updatedHomeworks = homeworks.map((hw) =>
        hw.homeworkId === homeworkId
          ? { homeworkId, homeworkName, homeworkDate, archive, filepath }
          : hw
      );
      setHomeworks(updatedHomeworks);
      setMessage('Homework updated successfully!');
    } else {
      const newHomework = {
        homeworkId: Date.now(),
        homeworkName,
        homeworkDate,
        archive,
        filepath,
      };
      setHomeworks([...homeworks, newHomework]);
      setMessage('Homework created successfully!');
    }
    setOpenSnackbar(true);
    resetForm();
  };

  const handleEdit = (homework: any) => {
    setHomeworkId(homework.homeworkId);
    setHomeworkName(homework.homeworkName);
    setHomeworkDate(homework.homeworkDate);
    setArchive(homework.archive);
    setFilepath(homework.filepath);
    setView('edit');
  };

  const handleDelete = () => {
    if (selectedHomeworkId) {
      const updatedHomeworks = homeworks.filter((hw) => hw.homeworkId !== selectedHomeworkId);
      setHomeworks(updatedHomeworks);
      setMessage('Homework deleted successfully!');
      setOpenSnackbar(true);
    }
    setDeleteDialogOpen(false);
  };

  const confirmDelete = (homeworkId: number) => {
    setSelectedHomeworkId(homeworkId);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setHomeworkId(null);
    setHomeworkName('');
    setHomeworkDate('');
    setArchive('');
    setFilepath('');
    setView('list');
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setMessage('');
  };

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '70%' }, // Full width on small screens, 70% on larger
        margin: '0 auto', // Center the box horizontally
        padding: '0 16px', // Optional: Add padding to prevent content from touching screen edges
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        // sx={{
        //   whiteSpace: 'normal', // Allows text to wrap
        //   wordBreak: 'break-word', // Breaks long words
        //   textAlign: 'center', // Centers text on small screens
        //   // fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, // Adjust font size based on screen width
        // }}
      >
        Homework Management
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
          // maxWidth: 100,
          minWidth: '300px',
          margin: 'auto',
          // mx: 'auto',
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
                Homeworks
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
                Create Homework
              </Button>
            </Box>
            {/* <Box sx={{ overflowX: 'auto', width: '100%' }}> */}
            {/* <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>Homework Name</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Archive</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>File Path</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {homeworks.map((homework) => (
                    <TableRow key={homework.homeworkId}>
                      <TableCell>{homework.homeworkName}</TableCell>
                      <TableCell>{homework.homeworkDate}</TableCell>
                      <TableCell>{homework.archive}</TableCell>
                      <TableCell style={{ wordBreak: 'break-word', maxWidth: '300px' }}>
                        {homework.filepath}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> */}
            {/* </Box> */}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>Homework Name</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Archive</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>File Path</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {homeworks.map((homework) => (
                    <TableRow key={homework.homeworkId}>
                      <TableCell>{homework.homeworkName}</TableCell>
                      <TableCell>{homework.homeworkDate}</TableCell>
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
                  ))}
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
              label="Homework Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={homeworkName}
              onChange={(e) => setHomeworkName(e.target.value)}
              required
            />
            <TextField
              label="Homework Date"
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
                label="Archive"
                variant="outlined"
                fullWidth
                value={archive}
                onChange={(e) => setArchive(e.target.value)}
              />
              <TextField
                label="Filepath"
                variant="outlined"
                fullWidth
                value={filepath}
                onChange={(e) => setFilepath(e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                {homeworkId ? 'Update Homework' : 'Save Homework'}
              </Button>
              <Button variant="outlined" color="secondary" onClick={resetForm}>
                Cancel
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
            <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default HomeworkManager;
