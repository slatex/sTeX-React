import { Box, Button, TextField, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PRIMARY_COL } from '@stex-react/utils';
import Link from 'next/link';

const HomeworkForm = ({
  homeworkName,
  setHomeworkName,
  homeworkGivenDate,
  setHomeworkGivenDate,
  answerReleaseDate,
  setAnswerReleaseDate,
  homeworkId,
  archive,
  setArchive,
  filepath,
  setFilepath,
  handleSave,
  resetForm,
  view,
  t,
}) => {
  const sourcePath = filepath.replace('xhtml', 'tex');
  return (
    <Box
      sx={{
        width: '100%',
        mt: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {view === 'create' ? t.createHomework : t.updateHomework}
      </Typography>
      <TextField
        label={t.homeworkName}
        value={homeworkName}
        onChange={(e) => setHomeworkName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label={t.homeworkGivenDate}
        type="date"
        value={homeworkGivenDate}
        onChange={(e) => setHomeworkGivenDate(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label={t.answerReleaseDate}
        type="date"
        value={answerReleaseDate}
        onChange={(e) => setAnswerReleaseDate(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label={t.archive}
          variant="outlined"
          fullWidth
          value={archive}
          onChange={(e) => setArchive(e.target.value)}
        />
        <TextField
          label={t.filePath}
          variant="outlined"
          fullWidth
          value={filepath}
          onChange={(e) => setFilepath(e.target.value)}
        />
        <Link
          href={`https://gl.mathhub.info/${archive}/-/blob/main/source/${sourcePath}`}
          target="_blank"
        >
          <OpenInNewIcon style={{ color: PRIMARY_COL }} />
        </Link>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {homeworkId ? t.updateHomework : t.saveHomework}
        </Button>
        <Button variant="outlined" color="secondary" onClick={resetForm}>
          {t.cancel}
        </Button>
      </Box>
    </Box>
  );
};

export default HomeworkForm;
