import QuizIcon from '@mui/icons-material/Quiz';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';

import { Button, Link } from '@mui/material';
import {
  ALL_DIMENSIONS,
  BloomDimension,
  getProblemIdsForConcept,
  uriWeightToSmileyLevel,
} from '@stex-react/api';
import { PRIMARY_COL, PathToTour } from '@stex-react/utils';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { PracticeQuestions } from './PracticeQuestions';
import { SelfAssessmentDialogRow } from './SelfAssessmentDialog';
import { getLocaleObject } from './lang/utils';
import { mmtHTMLToReact } from './mmtParser';
import { ServerLinksContext } from './stex-react-renderer';

const extractLastWordAfterQuestionMark = (url: string) => {
  if (!url) return url;
  const parts = url.split('?');
  return parts[parts.length - 1];
};

export function getMMTHtml(uri: string) {
  const lastWord = extractLastWordAfterQuestionMark(uri);
  const hoverLink = `/:sTeX/fragment?${uri}`;
  const clickLink = `/:sTeX/declaration?${uri}`;
  const highlightParent = Math.random() * 1000000;
  return `<span data-overlay-link-click="${clickLink}" data-highlight-parent="${highlightParent}" data-overlay-link-hover="${hoverLink}" class="symcomp group-highlight rustex-contents">${lastWord}</span>`;
}

function QuizButton({ uri, mmtUrl }: { uri: string; mmtUrl?: string }) {
  const [problemList, setProblemList] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  useEffect(() => {
    if (!mmtUrl) return;
    getProblemIdsForConcept(mmtUrl, uri).then(setProblemList);
  }, [uri]);
  if (problemList.length === 0) {
    return null;
  }
  function handleCloseDialog() {
    setDialogOpen(false);
  }
  return (
    <>
      <QuizIcon
        sx={{
          cursor: 'pointer',
          backgroundColor: PRIMARY_COL,
          color: 'white',
          borderRadius: '50%',
          padding: '8px',
        }}
        onClick={() => setDialogOpen(true)}
      />
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth={true}
        maxWidth="md"
      >
        <DialogTitle>Practice Problems</DialogTitle>
        <DialogContent>
          <PracticeQuestions problemIds={problemList} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function CompetencyTable({
  URIs,
  competencyData,
  dimensions,
  onValueUpdate,
  showTour,
}: {
  URIs: string[];
  competencyData: any[];
  dimensions?: BloomDimension[];
  onValueUpdate?: () => void;
  showTour?: boolean;
}) {
  const t = getLocaleObject(useRouter());
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const { mmtUrl } = useContext(ServerLinksContext);
  const combinedData: { concepts: string; values: any }[] = [];
  const CONCEPT_COLUMN = 'concepts';
  for (let i = 0; i < URIs.length; i++) {
    const newObj = {
      values: competencyData[i],
      concepts: URIs[i],
    };
    combinedData.push(newObj);
  }

  if (!URIs?.length || !competencyData?.length) return <p>Loading data... </p>;

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = combinedData.slice().sort((a, b) => {
    if (orderBy === CONCEPT_COLUMN) {
      const aValue = extractLastWordAfterQuestionMark(a.concepts).toLowerCase();
      const bValue = extractLastWordAfterQuestionMark(b.concepts).toLowerCase();
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      const aValue = a.values[orderBy];
      const bValue = b.values[orderBy];

      if (order === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }
  });

  return (
    <TableContainer component={Paper}>
      <Table sx={{ textAlign: 'center' }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === CONCEPT_COLUMN}
                direction={order}
                onClick={() => handleRequestSort(CONCEPT_COLUMN)}
              >
                <b>{t.concepts}</b>
              </TableSortLabel>
            </TableCell>
            {(dimensions || ALL_DIMENSIONS).map((header) => (
              <TableCell key={header}>
                <TableSortLabel
                  active={orderBy === header}
                  direction={order}
                  onClick={() => handleRequestSort(header)}
                >
                  <b>{header}</b>
                </TableSortLabel>
              </TableCell>
            ))}
            {showTour && (
              <TableCell>
                <b>Guided Tour</b>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{mmtHTMLToReact(getMMTHtml(row.concepts))}</TableCell>
              {(dimensions || ALL_DIMENSIONS).map(
                (dimension: BloomDimension) => (
                  <TableCell key={dimension}>
                    {onValueUpdate ? (
                      <Tooltip
                        title={
                          <SelfAssessmentDialogRow
                            htmlName={extractLastWordAfterQuestionMark(
                              URIs[index]
                            )}
                            dim={dimension}
                            uri={URIs[index]}
                            dimText={false}
                            selectedLevel={uriWeightToSmileyLevel(
                              Number(row.values[dimension])
                            )}
                            onValueUpdate={onValueUpdate}
                          />
                        }
                      >
                        <span style={{ cursor: 'pointer' }}>
                          {Number(row.values[dimension]).toFixed(2)}
                        </span>
                      </Tooltip>
                    ) : (
                      <span>{Number(row.values[dimension]).toFixed(2)}</span>
                    )}
                  </TableCell>
                )
              )}
              {showTour && (
                <TableCell
                  sx={{
                    padding: '4px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Link
                    href={PathToTour(URIs[index])}
                    target="_blank"
                    sx={{ marginRight: '10px' }}
                  >
                    <Image
                      src="/guidedTour.png"
                      alt="Tour Logo"
                      width={40}
                      height={40}
                      style={{ cursor: 'pointer' }}
                      priority={true}
                    />
                  </Link>
                  <QuizButton uri={URIs[index]} mmtUrl={mmtUrl} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CompetencyTable;
