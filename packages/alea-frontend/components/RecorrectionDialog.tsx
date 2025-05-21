//RecorrectionDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { recorrectQuiz } from '@stex-react/api';

interface RecorrectionChange {
  gradingId: number;
  problemId: string;
  oldPoints: number;
  newPoints: number;
  studentId?: string;
}

interface RecorrectionDialogProps {
  open: boolean;
  onClose: () => void;
  quizId: string;
  courseId: string;
  courseTerm: string;
}

export const RecorrectionDialog: React.FC<RecorrectionDialogProps> = ({
  open,
  onClose,
  quizId,
  courseId,
  courseTerm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [changes, setChanges] = useState<RecorrectionChange[]>([]);
  const [changedCount, setChangedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load preview automatically when dialog opens
  useEffect(() => {
    if (open) {
      handlePreview();
    }
  }, [open]);

  const handlePreview = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await recorrectQuiz(quizId, courseId, courseTerm, true);
      setChanges(result.changes);
      setChangedCount(result.changedCount);
      setIsDryRun(true);
    } catch (err) {
      setError('Failed to preview recorrection: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await recorrectQuiz(quizId, courseId, courseTerm, false);
      setChanges(result.changes);
      setChangedCount(result.changedCount);
      setIsDryRun(false);
      setSuccess(true);
    } catch (err) {
      setError('Failed to apply recorrection: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (success) {
      // Reload page to reflect changes
      window.location.reload();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Quiz Recorrection</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <DialogContentText color="error">{error}</DialogContentText>
        ) : success ? (
          <DialogContentText sx={{ color: 'green' }}>
            Recorrection successfully applied! {changedCount} submissions were updated.
          </DialogContentText>
        ) : changes.length > 0 ? (
          <>
            <DialogContentText>
              <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                Preview of Recorrection Changes
              </Typography>
              {isDryRun
                ? `${changedCount} submissions will be updated if you apply this recorrection:`
                : `${changedCount} submissions have been updated:`}
            </DialogContentText>
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Problem ID</TableCell>
                    <TableCell align="right">Old Points</TableCell>
                    <TableCell align="right">New Points</TableCell>
                    <TableCell align="right">Difference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {changes.map((change) => (
                    <TableRow key={change.gradingId}>
                      <TableCell>{change.studentId || 'Unknown'}</TableCell>
                      <TableCell>{change.problemId}</TableCell>
                      <TableCell align="right">{change.oldPoints.toFixed(2)}</TableCell>
                      <TableCell align="right">{change.newPoints.toFixed(2)}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{
                          color: change.newPoints > change.oldPoints ? 'green' : 'red',
                          fontWeight: 'bold'
                        }}
                      >
                        {(change.newPoints - change.oldPoints).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : changes.length === 0 && changedCount === 0 ? (
          <DialogContentText>
            No submissions need correction. All points are already correct.
          </DialogContentText>
        ) : (
          <DialogContentText>
            Loading preview of changes...
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && changes.length > 0 && isDryRun && (
          <Button onClick={handleApply} color="primary" variant="contained" disabled={isLoading}>
            Apply Recorrection
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};