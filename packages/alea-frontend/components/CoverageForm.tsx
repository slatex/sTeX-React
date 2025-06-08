import { FTML } from '@kwarc/ftml-viewer';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import QuizIcon from '@mui/icons-material/Quiz';
import SaveIcon from '@mui/icons-material/Save';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { LectureEntry } from '@stex-react/utils';
import dayjs from 'dayjs';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { SecInfo } from '../types';
import { getNoonTimestampOnSameDay } from './CoverageUpdater';
import { SlidePicker } from './SlideSelector';

export type FormData = LectureEntry & {
  sectionName: string;
  targetSectionName: string;
};

interface CoverageFormProps {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  secInfo: Record<FTML.DocumentURI, SecInfo>;
  isEditing: boolean;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  courseId: string;
}

export function CoverageForm({
  formData,
  setFormData,
  secInfo,
  isEditing,
  onSubmit,
  onCancel,
  courseId,
}: CoverageFormProps) {
  useEffect(() => {
    const updatedData = { ...formData };
    let dataChanged = false;

    if (formData.sectionName && formData.sectionName.trim() !== '' && !formData.sectionUri) {
      const section = secInfo[formData.sectionUri];
      if (section) {
        updatedData.sectionUri = section.uri;
        dataChanged = true;
      }
    }

    if (
      formData.targetSectionName &&
      formData.targetSectionName.trim() !== '' &&
      !formData.targetSectionUri
    ) {
      const targetSection = secInfo[formData.targetSectionUri];
      if (targetSection) {
        updatedData.targetSectionUri = targetSection.uri;
        dataChanged = true;
      }
    }

    if (dataChanged) {
      setFormData(updatedData);
    }
  }, [formData, secInfo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name as string]: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timestamp = Date.parse(e.target.value);
    setFormData({ ...formData, timestamp_ms: getNoonTimestampOnSameDay(timestamp) });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isQuizScheduled: e.target.checked });
  };

  const handleSlideUriChange = (uri: string | undefined, slideNumber: number | undefined) => {
    setFormData({ ...formData, slideUri: uri, slideNumber });
  };

  const handleSectionChange = (event: any) => {
    const selectedUri = event.target.value as string;

    if (!selectedUri) {
      setFormData({
        ...formData,
        sectionUri: '',
        sectionName: '',
        slideUri: '',
        slideNumber: undefined,
      });
      return;
    }

    const selectedSection = secInfo[selectedUri];
    if (selectedSection) {
      setFormData({
        ...formData,
        sectionUri: selectedUri,
        sectionName: selectedSection.title.trim(),
        slideUri: '',
        slideNumber: undefined,
      });
    }
  };

  const handleTargetSectionChange = (event: any) => {
    const selectedUri = event.target.value as string;

    if (!selectedUri) {
      setFormData({
        ...formData,
        targetSectionUri: '',
        targetSectionName: '',
      });
      return;
    }

    const selectedSection = secInfo[selectedUri];
    if (selectedSection) {
      setFormData({
        ...formData,
        targetSectionUri: selectedUri,
        targetSectionName: selectedSection.title.trim(),
      });
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date"
          type="date"
          name="date"
          value={dayjs(formData.timestamp_ms).format('YYYY-MM-DD')}
          onChange={handleDateChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mb: { xs: 2, md: 0 } }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Clip ID"
          name="clipId"
          value={formData.clipId}
          onChange={handleChange}
          placeholder="Enter clip ID"
          variant="outlined"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel id="section-name-select-label">Section (actually) Completed</InputLabel>
          <Select
            labelId="section-name-select-label"
            value={formData.sectionUri}
            onChange={handleSectionChange}
            name="sectionUri"
            label="Section (actually) Completed"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {Object.values(secInfo).map((section) => (
              <MenuItem key={section.uri} value={section.uri}>
                {section.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel id="target-section-select-label">Target Section</InputLabel>
          <Select
            labelId="target-section-select-label"
            value={formData.targetSectionUri}
            onChange={handleTargetSectionChange}
            name="targetSectionUri"
            label="Target Section"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {Object.values(secInfo).map((section) => (
              <MenuItem key={section.uri} value={section.uri}>
                {section.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <SlideshowIcon sx={{ mr: 1, fontSize: 20 }} />
          Slide Selection
        </Typography>
        <SlidePicker
          courseId={courseId}
          sectionUri={formData.sectionUri}
          slideUri={formData.slideUri}
          setSlideUri={handleSlideUriChange}
          secInfo={secInfo}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }} />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isQuizScheduled}
              onChange={handleCheckboxChange}
              color="warning"
            />
          }
          label={
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <QuizIcon sx={{ mr: 0.5, color: 'warning.main' }} fontSize="small" />
              Quiz Scheduled
            </Typography>
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 3,
            gap: 1,
          }}
        >
          {isEditing && (
            <Button variant="outlined" onClick={onCancel} startIcon={<ClearIcon />}>
              Cancel
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={() => onSubmit(formData)}
            startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
          >
            {isEditing ? 'Update' : 'Add Entry'}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default CoverageForm;
