import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { CoverageSnap, PRIMARY_COL } from '@stex-react/utils';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Section } from '../pages/coverage-update';

function getUriForSectionName(sectionName: string, sectionNames: Section[]): string {
  const section = sectionNames.find(({ title }) => title.trim() === sectionName);
  return section?.uri || '';
}

function getSectionNameForUri(uri: string, sectionNames: Section[]): string {
  const section = sectionNames.find(({ uri: sectionUri }) => sectionUri === uri);
  return section?.title || '';
}

interface FormWithListProps {
  snaps: CoverageSnap[];
  setSnaps: React.Dispatch<React.SetStateAction<CoverageSnap[]>>;
  sectionNames: Section[];
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

export function CoverageUpdater({ snaps, setSnaps, sectionNames }: FormWithListProps) {
  const [sectionName, setSectionName] = useState('');
  const [clipId, setClipId] = useState('');
  const [selectedTimestamp, setSelectedTimestamp] = useState(Date.now());
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [targetSectionName, setTargetSectionName] = useState('');
  const [isQuizScheduled, setIsQuizScheduled] = useState(false);

  useEffect(() => {
    setSectionName(snaps[snaps.length - 1]?.sectionName);
  }, [snaps]);

  const duplicateNames: string[] = findDuplicates(sectionNames.map(({ title }) => title.trim()));

  function setNoonDefaultTime(timestamp: number) {
    return new Date(timestamp).setHours(12, 0, 0, 0);
  }

  const handleAddItem = () => {
    const sectionToAdd = sectionName?.length ? getUriForSectionName(sectionName, sectionNames) : '';
    const targetSectionToAdd = targetSectionName?.length
      ? getUriForSectionName(targetSectionName, sectionNames)
      : '';

    const newItem = {
      sectionId: sectionNames.find(({ title }) => title === sectionName)?.id,
      timestamp_ms: selectedTimestamp,
      sectionName: sectionToAdd,
      targetSectionName: targetSectionToAdd,
      clipId,
      isQuizScheduled,
    };

    if (editIndex !== null) {
      const updatedSnaps = [...snaps];
      updatedSnaps[editIndex] = newItem;
      setSnaps(updatedSnaps);
      setEditIndex(null);
    } else {
      setSnaps([...snaps, newItem]);
    }

    setSectionName('');
    setTargetSectionName('');
    setClipId('');
    setSelectedTimestamp(Date.now());
    setIsQuizScheduled(false);
  };

  const handleEditItem = (index: number) => {
    const itemToEdit = snaps[index];
    const sectionNameToEdit = getSectionNameForUri(itemToEdit.sectionName, sectionNames).trim();
    const targetSectionNameToEdit = getSectionNameForUri(
      itemToEdit.targetSectionName,
      sectionNames
    ).trim();
    setSectionName(sectionNameToEdit || '');
    setTargetSectionName(targetSectionNameToEdit || '');
    setClipId(itemToEdit.clipId || '');
    setSelectedTimestamp(itemToEdit.timestamp_ms || Date.now());
    setIsQuizScheduled(itemToEdit.isQuizScheduled || false);
    setEditIndex(index);
  };

  const handleCancelEdit = () => {
    setSectionName('');
    setClipId('');
    setTargetSectionName('');
    setSelectedTimestamp(Date.now());
    setIsQuizScheduled(false);
    setEditIndex(null);
  };

  return (
    <Box mt="10px" sx={{ display: 'flex', flexDirection: 'column' }}>
      <table>
        {snaps.map((item, idx) => (
          <tr key={item.timestamp_ms} style={{ border: '1px solid black' }}>
            <td style={{ textAlign: 'center', border: '1px solid black' }}>
              <b>{idx + 1}. </b>
              {dayjs(item.timestamp_ms).format('YYYY-MM-DD')}
            </td>
            <td
              style={{
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                padding: '10px',
                border: '1px solid black',
              }}
            >
              {getSectionNameForUri(item.sectionName, sectionNames)}
            </td>
            <td
              style={{
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                border: '1px solid black',
                padding: '10px',
              }}
            >
              {getSectionNameForUri(item.targetSectionName, sectionNames)}
            </td>
            <td style={{ border: '1px solid black' }}>
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
            <td />
            <td style={{ borderRight: '1px solid black' }}>
              {item.isQuizScheduled ? 'Quiz Scheduled' : ''}
            </td>
            <td>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={() => handleEditItem(idx)}>
                  <EditIcon sx={{ color: PRIMARY_COL }} />
                </IconButton>
                <IconButton
                  onClick={() => {
                    const updatedSnaps = snaps.filter((_, i) => i !== idx);
                    setSnaps(updatedSnaps);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </td>
          </tr>
        ))}
      </table>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
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
        <FormControl sx={{ m: '20px 5px 0' }}>
          <InputLabel id="section-name-select-label">Section Name</InputLabel>
          <Select
            labelId="section-name-select-label"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            label="Section Name"
            sx={{ minWidth: '300px', width: '100%' }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {sectionNames.map(({ title }) => {
              const isDuplicate = duplicateNames.includes(title.trim());

              return (
                <MenuItem
                  key={title}
                  value={title.trim()}
                  sx={{ backgroundColor: isDuplicate ? 'red' : undefined }}
                >
                  {title}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl sx={{ m: '20px 5px 0' }}>
          <InputLabel id="target-section-select-label">Target Section</InputLabel>
          <Select
            labelId="target-section-select-label"
            value={targetSectionName}
            onChange={(e) => setTargetSectionName(e.target.value)}
            label="Target Section"
            sx={{ minWidth: '300px', width: '100%' }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {sectionNames.map(({ title }) => {
              const isDuplicate = duplicateNames.includes(title.trim());

              return (
                <MenuItem
                  key={title}
                  value={title.trim()}
                  sx={{ backgroundColor: isDuplicate ? 'red' : undefined }}
                >
                  {title}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <TextField
          label="ClipId"
          value={clipId}
          onChange={(e) => setClipId(e.target.value)}
          sx={{ m: '20px 5px 0', minWidth: '200px' }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={isQuizScheduled}
              onChange={(e) => setIsQuizScheduled(e.target.checked)}
            />
          }
          label="Quiz"
        />

        {editIndex !== null ? (
          <Box sx={{ display: 'flex', mt: '20px', mr: '10px' }}>
            <Button variant="contained" color="primary" onClick={handleAddItem}>
              Update
            </Button>
            <IconButton onClick={() => handleCancelEdit()}>
              <ClearIcon sx={{ color: PRIMARY_COL, fontSize: 'large', variant: 'contained' }} />
            </IconButton>
          </Box>
        ) : (
          <Button variant="contained" onClick={handleAddItem} sx={{ mt: '20px' }}>
            Add
          </Button>
        )}
      </Box>
    </Box>
  );
}
