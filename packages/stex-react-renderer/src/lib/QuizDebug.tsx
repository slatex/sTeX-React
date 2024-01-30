import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { FillInAnswerClass, FillInAnswerClassType, Option, QuadState } from '@stex-react/api';
import { mmtHTMLToReact } from './mmtParser';

const getQuadStateColor = (shouldSelect: QuadState) => {
    switch (shouldSelect) {
      case QuadState.TRUE:
        return 'green';
  
      case QuadState.FALSE:
        return 'red';
  
      case QuadState.UNKNOWN:
        return 'gray';
  
      default:
        return 'orange';
    }
  };

function getParameters(type: FillInAnswerClassType, input: FillInAnswerClass) {
    switch (type) {
      case FillInAnswerClassType.numrange:
        return `${input.startNum} - ${input.endNum}`;
      case FillInAnswerClassType.regex:
        return input.regex || '';
      case FillInAnswerClassType.exact:
        return input.exactMatch || '';
      default:
        return 'Unhandled Case';
    }
  }
export function AnswerClassesTable({
    fillInAnswerClass,
  }: {
    fillInAnswerClass: FillInAnswerClass[];
  }) {
    const tableRows = fillInAnswerClass.map(
      (input: FillInAnswerClass, index: number) => (
        <TableRow key={index}>
          <TableCell>{input?.type}</TableCell>
          <TableCell>{getParameters(input?.type, input)}</TableCell>
          <TableCell>{mmtHTMLToReact(input?.feedbackHtml || '')}</TableCell>
          <TableCell>{input?.verdict?.toString()}</TableCell>
        </TableRow>
      )
    );
    const tHeadStyle = { minWidth: '60px', fontWeight: 'bold' };
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tHeadStyle}>Match Type</TableCell>
              <TableCell sx={tHeadStyle}>Parameter</TableCell>
              <TableCell sx={tHeadStyle}>Feedback</TableCell>
              <TableCell sx={tHeadStyle}>Verdict</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{tableRows}</TableBody>
        </Table>
      </TableContainer>
    );
  }
  export function DebugMCQandSCQ({
    feedbackHtml,
    shouldSelect,
  }: {
    feedbackHtml: string;
    shouldSelect: QuadState;
  }) {
    const textColor = getQuadStateColor(shouldSelect);
    return (
      <Box
        sx={{
          color: textColor,
          border: `2px solid ${textColor}`,
          margin: '-10px 10px 10px 10px',
          p: '10px',
          borderRadius: '5px',
        }}
      >
        {mmtHTMLToReact(feedbackHtml)}
      </Box>
    );
  }
  export function InlineScqTable({ options }: { options: Option[] }) {
    const tableRows = options.map(({ value, feedbackHtml, shouldSelect }) => (
      <TableRow>
        <TableCell>{mmtHTMLToReact(value.outerHTML)}</TableCell>
        <TableCell sx={{ color: getQuadStateColor(shouldSelect) }}>
          {mmtHTMLToReact(feedbackHtml)}
        </TableCell>
      </TableRow>
    ));
    const tHeadStyle = { minWidth: '60px', fontWeight: 'bold' };
    return (
      <TableContainer component={Paper} sx={{ marginBottom: '10px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} align="center" sx={{ fontWeight: 'bold' }}>
                For inline SCC
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={tHeadStyle}>Options</TableCell>
              <TableCell sx={tHeadStyle}>Feedback</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{tableRows}</TableBody>
        </Table>
      </TableContainer>
    );
  }