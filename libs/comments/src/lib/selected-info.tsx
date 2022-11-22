import { Box, Tooltip } from '@mui/material';

export function getTruncated(text: string) {
  if (text.length < 60) return text;
  return text.substring(0, 40) + '…' + text.slice(-15);
}
export function SelectedInfo({ text }: { text?: string }) {
  if (!text) return null;
  const truncated = getTruncated(text);
  return (
    <Tooltip title={text}>
      <Box>
        <span
          style={{
            borderRadius: '5px',
            marginBottom: '-2px',
            padding: '2px 5px ',
            color: 'gray',
            background: '#EEE',
            display: 'inline',
            userSelect: 'none'
          }}
        >
          {truncated}
        </span>
      </Box>
    </Tooltip>
  );
}
