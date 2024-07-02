import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  BloomDimension,
  ConceptHistory,
  getConceptHistory,
} from '@stex-react/api';
import { useEffect, useState } from 'react';
import { getMMTHtml } from './CompetencyTable';
import { mmtHTMLToReact } from './mmtParser';

function ConceptHistoryTable({
  open,
  onClose,
  concept,
}: {
  open: boolean;
  onClose: () => void;
  concept: string;
}) {
  const [conceptHistoryData, setConceptHistoryData] =
    useState<ConceptHistory>();

  useEffect(() => {
    getConceptHistory(concept).then(setConceptHistoryData);
  }, [concept]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="lg">
      <DialogTitle>{mmtHTMLToReact(getMMTHtml(concept))}</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>EventType</TableCell>
              <TableCell>{BloomDimension.Remember}</TableCell>
              <TableCell>{BloomDimension.Understand}</TableCell>
              <TableCell>{BloomDimension.Apply}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conceptHistoryData?.history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" fontWeight="bold">
                    There is no history associated with this concept.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              conceptHistoryData?.history.map((data, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {(data.event.time as string).split(' ')[0]}
                  </TableCell>
                  <TableCell>{data.event.type}</TableCell>
                  <TableCell>{data['new-values'].Remember}</TableCell>
                  <TableCell>{data['new-values'].Understand}</TableCell>
                  <TableCell>{data['new-values'].Apply}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '10px',
          }}
        >
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ConceptHistoryTable;
