import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

import {
  ALL_DIMENSIONS,
  BloomDimension,
  uriWeightToSmileyLevel,
} from '@stex-react/api';
import { useRouter } from 'next/router';
import ConceptInfoDisplay, {
  extractLastWordAfterQuestionMark,
} from './ConceptInfoDisplay';
import { getLocaleObject } from './lang/utils';
import { SelfAssessmentDialogRow } from './SelfAssessmentDialog';

export function CompetencyTable({
  URIs,
  competencyData,
  dimensions,
  onValueUpdate,
}: {
  URIs: string[];
  competencyData: any[];
  dimensions?: BloomDimension[];
  onValueUpdate?: () => void;
}) {
  const t = getLocaleObject(useRouter());
  if (!URIs?.length || !competencyData?.length) return <p>Loading data... </p>;
  return (
    <TableContainer component={Paper}>
      <Table sx={{ textAlign: 'center' }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>{t.concepts}</b>
            </TableCell>
            {dimensions
              ? dimensions.map((header) => (
                  <TableCell key={header}>
                    <b>{header}</b>
                  </TableCell>
                ))
              : ALL_DIMENSIONS.map((header) => (
                  <TableCell key={header}>
                    <b>{header}</b>
                  </TableCell>
                ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {competencyData.map((row, index) => (
            <TableRow key={index}>
              <TableCell sx={{ cursor: 'pointer' }}>
                <ConceptInfoDisplay uri={URIs[index]} />
              </TableCell>
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
                              Number(row[dimension])
                            )}
                            onValueUpdate={onValueUpdate}
                          />
                        }
                        placement="right-start"
                      >
                        <span style={{ cursor: 'pointer' }}>
                          {Number(row[dimension]).toFixed(2)}
                        </span>
                      </Tooltip>
                    ) : (
                      <span>{Number(row[dimension]).toFixed(2)}</span>
                    )}
                  </TableCell>
                )
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CompetencyTable;
