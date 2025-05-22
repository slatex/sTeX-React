import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { FTMLProblemWithSolution, recorrectQuiz } from '@stex-react/api';
import React, { useEffect, useState } from 'react';

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
  const [titles, setTitles] = useState<
    Record<string, { title_html: string } | FTMLProblemWithSolution>
  >({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [changedCount, setChangedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      const result = await recorrectQuiz(quizId, courseId, courseTerm, true, reasons);
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
      const result = await recorrectQuiz(quizId, courseId, courseTerm, false, reasons);
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
                    <TableCell>Reason For Recorrection</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from(new Set(changes.map((change) => change.problemId))).map(
                    (problemId) => {
                      const problem = titles[problemId];
                      const title =
                        'title_html' in problem && typeof problem.title_html === 'string'
                          ? problem.title_html
                          : problemId;
                      return (
                        <TableRow key={problemId}>
                          <TableCell>
                            {title}: {problemId}{' '}
                          </TableCell>
                          <TableCell>
                            <input
                              type="text"
                              placeholder="Enter reason for recorrection"
                              style={{ width: '100%' }}
                              value={reasons[problemId] || ''}
                              onChange={(e) => {
                                setReasons((prev) => ({
                                  ...prev,
                                  [problemId]: e.target.value,
                                }));
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
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
                    changes
                      .reduce((acc, change) => {
                        if (!acc.has(change.problemId)) {
                          const count = changes.filter(
                            (c) => c.problemId === change.problemId && c.studentId
                          ).length;
                          acc.set(change.problemId, { ...change, entryCount: count });
                        }
                        return acc;
                      }, new Map<string, { entryCount: number } & RecorrectionChange>())
                      .values()
                  ).map((change) => (
                    <TableRow key={change.problemId}>
                      <TableCell>
                        {(() => {
                          const problem = titles[change.problemId];
                          const title =
                            problem &&
                            'title_html' in problem &&
                            typeof problem.title_html === 'string'
                              ? problem.title_html
                              : change.problemId;
                          return (
                            <>
                              {title}: {change.problemId}
                            </>
                          );
                        })()}
                      </TableCell>
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
          <DialogContentText>Loading preview of changes...</DialogContentText>
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
