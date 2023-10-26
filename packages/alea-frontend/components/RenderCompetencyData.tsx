import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ConceptDataDisplay from './ConceptDataDisplay';
import { ALL_DIMENSIONS } from '@stex-react/api';

function RenderCompetencyData({
  URIs,
  competencyData,
}: {
  URIs: string[];
  competencyData: any[];
}) {
  if (!URIs?.length || !competencyData?.length) return <p>Loading data...</p>;

  return (
    <TableContainer component={Paper}>
      <Table style={{ textAlign: 'center' }}>
        <TableHead>
          <TableRow sx={{ fontWeight: 'bold' }}>
            <TableCell>Concepts</TableCell>
            {ALL_DIMENSIONS.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {competencyData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <ConceptDataDisplay uri={URIs[index]} />
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

export default RenderCompetencyData;
