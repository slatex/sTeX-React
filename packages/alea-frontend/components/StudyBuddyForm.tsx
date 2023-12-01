import {
  Box,
  Checkbox,
  FormControl,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import { Days, Languages, MeetType, StudyBuddy } from '@stex-react/api';
import { getLocaleObject } from '../lang/utils';
import { useRouter } from 'next/router';
import InfoIcon from '@mui/icons-material/Info';
import { InfoOutlined } from '@mui/icons-material';

export function StudyBuddyForm({
  studyBuddy,
  onUpdate,
}: {
  studyBuddy: StudyBuddy;
  onUpdate: (studyBuddy: StudyBuddy) => void;
}) {
  const { studyBuddy: t } = getLocaleObject(useRouter());
  return (
    <Box>
      <TextField
        id="outlined-basic"
        label={t.introLabel}
        variant="outlined"
        value={studyBuddy.intro}
        onChange={(event) => {
          onUpdate({
            ...studyBuddy,
            intro: event.target.value,
          });
        }}
        sx={{ mb: '0.5rem' }}
        fullWidth
      />
      <TextField
        label={t.studyProgramLabel}
        variant="outlined"
        value={studyBuddy.studyProgram}
        onChange={(event) => {
          onUpdate({
            ...studyBuddy,
            studyProgram: event.target.value,
          });
        }}
        sx={{ mb: '0.5rem' }}
        fullWidth
      />
      <FormControl sx={{ mb: '0.5rem' }} fullWidth>
        <InputLabel id="semester-label">{t.semesterLabel}</InputLabel>
        <Select
          labelId="semester-label"
          id="semester-select"
          value={studyBuddy.semester}
          label="Semester #"
          onChange={(e) => {
            const semester = +e.target.value;
            onUpdate({
              ...studyBuddy,
              semester,
            });
          }}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((sem) => (
            <MenuItem key={sem} value={sem}>
              {sem}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" alignItems="center">
        <TextField
          id="outlined-basic"
          label={t.emailLabel}
          variant="outlined"
          value={studyBuddy.email}
          onChange={(event) => {
            onUpdate({
              ...studyBuddy,
              email: event.target.value,
            });
          }}
          required
          sx={{ mb: '0.5rem' }}
          fullWidth
        />
        <Tooltip title={t.emailWarning}>
          <InfoOutlined />
        </Tooltip>
      </Box>
      <FormControl sx={{ mb: '0.5rem' }} fullWidth>
        <InputLabel id="meet-type-label">{t.meetTypeLabel}</InputLabel>
        <Select
          labelId="meet-type-label"
          id="meet-type-select"
          label={t.meetTypeLabel}
          value={studyBuddy.meetType}
          variant="outlined"
          onChange={(e) => {
            onUpdate({
              ...studyBuddy,
              meetType: MeetType[e.target.value as keyof typeof MeetType],
            });
          }}
          fullWidth
        >
          {Object.keys(MeetType).map((key) => (
            <MenuItem key={key} value={key}>
              {MeetType[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ mb: '0.5rem' }} fullWidth>
        <InputLabel id="days-label">{t.preferredDays}</InputLabel>
        <Select
          labelId="days-label"
          id="days-select"
          value={
            studyBuddy.dayPreference ? studyBuddy.dayPreference.split(',') : []
          }
          multiple
          label={t.preferredDays}
          variant="outlined"
          onChange={(e) => {
            onUpdate({
              ...studyBuddy,
              dayPreference: (e.target.value as string[]).join(','),
            });
          }}
          renderValue={(selected) => selected.join(', ')}
          fullWidth
        >
          {Object.keys(Days).map((key) => (
            <MenuItem key={key} value={key}>
              <Checkbox checked={studyBuddy.dayPreference.includes(key)} />
              <ListItemText primary={Days[key]} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ mb: '0.5rem' }} fullWidth>
        <InputLabel id="language-label">{t.languagesLabel}</InputLabel>
        <Select
          labelId="language-label"
          id="language-select"
          value={studyBuddy.languages ? studyBuddy.languages.split(',') : []}
          multiple
          label={t.languagesLabel}
          variant="outlined"
          onChange={(e) => {
            onUpdate({
              ...studyBuddy,
              languages: (e.target.value as string[]).join(','),
            });
          }}
          renderValue={(selected) => selected.join(', ')}
          fullWidth
        >
          {Object.keys(Languages).map((key) => (
            <MenuItem key={key} value={key}>
              <Checkbox checked={studyBuddy.languages.includes(key)} />
              <ListItemText primary={Languages[key]} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
