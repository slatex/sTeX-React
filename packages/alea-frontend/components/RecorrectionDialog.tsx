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
import { recorrectQuiz, FTMLProblemWithSolution } from '@stex-react/api';

interface RecorrectionChange {
  gradingId: number;
  problemId: string;
  oldPoints: number;
  newPoints: number;
  studentId?: string;
}

// For the recorrectQuiz API response
interface RecorrectionApiResponse {
  changedCount: number;
  changes: RecorrectionChange[];
  missingProblems: string[];
  problems: Record<string, { title_html: string } | FTMLProblemWithSolution>;
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
  const [titles, setTitles] = useState<Record<string, { title_html: string } | FTMLProblemWithSolution>>({});
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
      setTitles(result.problems);
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
                    <TableCell>Problem ID</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from(
                    new Set(changes.map((change) => change.problemId))
                  ).map((problemId) => {
                    const problem = titles[problemId];
                    const title =
                      'title_html' in problem && typeof problem.title_html === 'string'
                        ? problem.title_html
                        : problemId;
                    return (
                      <TableRow key={problemId}>
                        <TableCell>
                          {title}
                        </TableCell>
                        <TableCell>
                          <input
                            type="text"
                            placeholder="Enter reason/description"
                            style={{ width: '100%' }}
                            value={''}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Problem ID</TableCell>
                    <TableCell align="right">Old Points</TableCell>
                    <TableCell align="right">New Points</TableCell>
                    <TableCell align="right">Number of Entry</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from(
                    changes.reduce((acc, change) => {
                      if (!acc.has(change.problemId)) {
                      // Count number of entries for this problemId
                      const count = changes.filter(c => c.problemId === change.problemId && c.studentId).length;
                      acc.set(change.problemId, { ...change, entryCount: count });
                      }
                      return acc;
                    }, new Map<string, { entryCount: number } & RecorrectionChange>())
                    .values()
                    ).map((change) => (
                    <TableRow key={change.problemId}>
                      <TableCell>{change.problemId}</TableCell>
                      <TableCell align="right">{change.oldPoints.toFixed(2)}</TableCell>
                      <TableCell align="right">{change.newPoints.toFixed(2)}</TableCell>
                      <TableCell align="right">{change.entryCount}</TableCell>
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