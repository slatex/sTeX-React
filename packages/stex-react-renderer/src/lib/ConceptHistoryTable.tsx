import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const eventTypeMapping: { [key: string]: string } = {
  'course-init': 'Previous Course Data',
  'self-assessment': 'Self Assessment',
  'self-assessment-5StepLikertSmileys': 'Self Assessment (Smileys)',
  purge: 'Purge',
  'i-know': 'I Know',
  'problem-answer': 'Problem Answered',
};

function getProblemUrl(url: string): string {
  const parts = url.split('/');
  const startIndex = 3;
  let endIndex = parts.indexOf('problems') + 1;

  if (endIndex === 0) {
    endIndex = startIndex + 2;
  }

  const archive = parts.slice(startIndex, endIndex).join('/');
  const filepath = parts.slice(endIndex).join('/').split('?')[0];

  return `https://stexmmt.mathhub.info/:sTeX/browser/fulldocument?archive=${archive}&filepath=${filepath.replace(
    '.omdoc',
    '.xhtml'
  )}`;
}

function computeCompetenciesByDate(conceptHistoryData: ConceptHistory) {
  let previousRemember = 0;
  let previousUnderstand = 0;
  let previousApply = 0;

  const competenciesByDate = new Map<string, [number, number, number]>();

  conceptHistoryData.history.forEach((data) => {
    const date = (data.event.time as string).split(' ')[0];
    const remember = data['new-values'].Remember ?? previousRemember;
    const understand = data['new-values'].Understand ?? previousUnderstand;
    const apply = data['new-values'].Apply ?? previousApply;

    previousRemember = remember;
    previousUnderstand = understand;
    previousApply = apply;

    competenciesByDate.set(date, [remember, understand, apply]);
  });

  return competenciesByDate;
}

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

  const competenciesByDate = conceptHistoryData
    ? computeCompetenciesByDate(conceptHistoryData)
    : new Map<string, [number, number, number]>();

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
                    <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                      {eventTypeMapping[data.event.type]}
                      {data.event.type === 'problem-answer' ? (
                        <Link
                          href={getProblemUrl(data.event.uri)}
                          target="_blank"
                        >
                          <OpenInNewIcon />
                        </Link>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {data['new-values'].Remember?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {data['new-values'].Understand?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {data['new-values'].Apply?.toFixed(2)}
                    </TableCell>
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
