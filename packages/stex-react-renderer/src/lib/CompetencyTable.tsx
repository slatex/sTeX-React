import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import TableSortLabel from '@mui/material/TableSortLabel';

import {
  ALL_DIMENSIONS,
  BloomDimension,
  uriWeightToSmileyLevel,
} from '@stex-react/api';
import { useRouter } from 'next/router';
import { SelfAssessmentDialogRow } from './SelfAssessmentDialog';
import { getLocaleObject } from './lang/utils';
import { mmtHTMLToReact } from './mmtParser';
import { useState } from 'react';

const extractLastWordAfterQuestionMark = (url: string) => {
  if (!url) return url;
  const parts = url.split('?');
  return parts[parts.length - 1];
};

function getMMTHtml(uri: string) {
  const lastWord = extractLastWordAfterQuestionMark(uri);
  const hoverLink = `/:sTeX/fragment?${uri}`;
  const clickLink = `/:sTeX/declaration?${uri}`;
  const highlightParent = Math.random() * 1000000;
  return `<span data-overlay-link-click="${clickLink}" data-highlight-parent="${highlightParent}" data-overlay-link-hover="${hoverLink}" class="symcomp group-highlight rustex-contents">${lastWord}</span>`;
}

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
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const combinedData: { concepts: string; values: any }[] = [];
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
    if (orderBy === 'concepts') {
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
                active={orderBy === 'concepts'}
                direction={order}
                onClick={() => handleRequestSort('concepts')}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CompetencyTable;
