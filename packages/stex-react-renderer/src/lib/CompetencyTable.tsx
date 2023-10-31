import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ALL_DIMENSIONS } from '@stex-react/api';
import { useRouter } from 'next/router';
import ConceptInfoDisplay from './ConceptInfoDisplay';
import { getLocaleObject } from './lang/utils';

export function CompetencyTable({
  URIs,
  competencyData,
}: {
  URIs: string[];
  competencyData: any[];
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
            {ALL_DIMENSIONS.map((header) => (
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
              {ALL_DIMENSIONS.map((dimension: string) => (
                <TableCell key={dimension}>
                  {Number(row[dimension]).toFixed(2)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CompetencyTable;
