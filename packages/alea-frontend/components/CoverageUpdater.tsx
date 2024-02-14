import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { CoverageSnap } from '@stex-react/utils';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface FormWithListProps {
  snaps: CoverageSnap[];
  setSnaps: React.Dispatch<React.SetStateAction<CoverageSnap[]>>;
  sectionNames: string[];
}
function findDuplicates(arr: string[]): string[] {
  const duplicates: string[] = [];
  const seen: { [key: string]: boolean } = {};

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];

    if (seen[item]) {
      duplicates.push(item);
    } else {
      seen[item] = true;
    }
  }

  return duplicates;
}

export function CoverageUpdater({
  snaps,
  setSnaps,
  sectionNames,
}: FormWithListProps) {
  const [sectionName, setSectionName] = useState('');
  const [clipId, setClipId] = useState('');
  const [selectedTimestamp, setSelectedTimestamp] = useState(Date.now());
  useEffect(() => {
    setSectionName(snaps[snaps.length - 1]?.sectionName);
  }, [snaps]);

  const duplicateNames: string[] = findDuplicates(
    sectionNames.map((option) => option.trim())
  );

  function setNoonDefaultTime(timestamp: number) {
    return new Date(timestamp).setHours(12, 0, 0, 0);
  }
  const handleAddItem = () => {
    if (!sectionName?.length) return;
    const newItem = {
      timestamp_ms: selectedTimestamp,
      sectionName,
      clipId,
    };
    setSnaps([...snaps, newItem]);
    setSectionName('');
    setSelectedTimestamp(Date.now());
  };
  return (
    <Box mt="10px">
      <table>
        {snaps.map((item, idx) => (
          <tr key={item.timestamp_ms} style={{ border: '1px solid black' }}>
            <td style={{ textAlign: 'center' }}>
              <b>{idx + 1}.&nbsp;</b>
              {dayjs(item.timestamp_ms).format('YYYY-MM-DD')}
            </td>
            <td
              style={{
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.sectionName}
            </td>
            <td>
              {item.clipId?.length ? (
                <a
                  href={`https://fau.tv/clip/id/${item.clipId}`}
                  style={{ textDecoration: 'underline' }}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.clipId}
                  <OpenInNewIcon fontSize="small" sx={{ mb: '-4px' }} />
                </a>
              ) : (
                <i>None</i>
              )}
            </td>
            <td>
              <IconButton
                onClick={() => {
                  snaps.splice(idx);
                  setSnaps(snaps.slice());
                }}
              >
                <DeleteIcon />
              </IconButton>
            </td>
          </tr>
        ))}
        <tr>
          <td>
            <TextField
              label="Date"
              type="date"
              value={dayjs(selectedTimestamp).format('YYYY-MM-DD')}
              onChange={(e) => {
                const timestamp = Date.parse(e.target.value);
                setSelectedTimestamp(setNoonDefaultTime(timestamp));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ m: '20px 5px 0' }}
            />
          </td>

          <td>
            <FormControl sx={{ m: '20px 5px 0' }}>
              <InputLabel id="section-select-label">Section Name</InputLabel>
              <Select
                labelId="section-select-label"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                label="Section Name"
                sx={{ width: '300px' }}
              >
                {sectionNames.map((option) => {
                  const isDuplicate = duplicateNames.includes(option.trim());

                  return (
                    <MenuItem
                      key={option}
                      value={option.trim()}
                      sx={{ backgroundColor: isDuplicate ? 'red' : undefined }}
                    >
                      {option}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </td>
          <td>
            <TextField
              label="ClipId"
              value={clipId}
              onChange={(e) => setClipId(e.target.value)}
              sx={{ m: '20px 5px 0' }}
            />
          </td>
          <td>
            <Button
              variant="contained"
              disabled={!sectionName?.length}
              onClick={handleAddItem}
              sx={{ mt: '20px' }}
            >
              Add
            </Button>
          </td>
        </tr>
      </table>
    </Box>
  );
}
