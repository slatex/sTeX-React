import {
  Box,
  Button,
  CircularProgress,
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
import { Chart } from 'react-google-charts';
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
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setConceptHistoryData(undefined);
    setLoading(true);
    function fetchConceptHistory() {
      getConceptHistory(concept)
        .then(setConceptHistoryData)
        .finally(() => setLoading(false));
    }
    fetchConceptHistory();
  }, [concept]);

  let previousRemember = 0;
  let previousUnderstand = 0;
  let previousApply = 0;

  const competenciesByDate = new Map<string, [number, number, number]>();

  conceptHistoryData?.history?.forEach((data) => {
    const date = (data.event.time as string).split(' ')[0];
    const remember = data['new-values'].Remember ?? previousRemember;
    const understand = data['new-values'].Understand ?? previousUnderstand;
    const apply = data['new-values'].Apply ?? previousApply;

    previousRemember = remember;
    previousUnderstand = understand;
    previousApply = apply;

    competenciesByDate.set(date, [remember, understand, apply]);
  });

  const chartData = Array.from(competenciesByDate.entries()).map(
    ([date, values]) => [date, ...values]
  );

  const formattedChartData = [
    ['Time', 'Remember', 'Understand', 'Apply'],
    ...chartData,
  ];

  const options = {
    hAxis: {
      title: 'Time',
    },
    vAxis: {
      title: 'Competency',
      viewWindow: { min: 0, max: 1 },
    },
    series: {
      0: { curveType: 'function' },
      1: { curveType: 'function' },
      2: { curveType: 'function' },
    },
  };

  const hasData = (conceptHistoryData?.history?.length ?? 0) > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="lg">
      <DialogTitle>{mmtHTMLToReact(getMMTHtml(concept))}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
            }}
          >
            <CircularProgress />
            <Typography
              variant="body1"
              fontWeight="bold"
              align="center"
              sx={{ ml: 2 }}
            >
              Data is on its way, just a moment...
            </Typography>
          </Box>
        ) : hasData ? (
          <>
            <Chart
              chartType="LineChart"
              width="100%"
              height="400px"
              data={formattedChartData}
              options={options}
            />
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
                {conceptHistoryData?.history.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {(data.event.time as string).split(' ')[0]}
                    </TableCell>
                    <TableCell>
                      {data.event.type === 'self-assessment-5StepLikertSmileys'
                        ? 'Likert Smileys Evaluation'
                        : data.event.type}
                    </TableCell>
                    <TableCell>{data['new-values'].Remember}</TableCell>
                    <TableCell>{data['new-values'].Understand}</TableCell>
                    <TableCell>{data['new-values'].Apply}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <Typography variant="body1" fontWeight="bold" align="center">
            Sorry, we do not have any history associated with this concept.
          </Typography>
        )}
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
