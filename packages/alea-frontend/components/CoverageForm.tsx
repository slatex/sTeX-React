import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import dayjs from 'dayjs';
import { Section } from '../types';
import { SlidePicker } from './SlideSelector';
import { findDuplicates, getNoonTimestampOnSameDay } from './CoverageUpdater';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import QuizIcon from '@mui/icons-material/Quiz';
import SaveIcon from '@mui/icons-material/Save';
import SlideshowIcon from '@mui/icons-material/Slideshow';

interface FormData {
  sectionName: string;
  sectionUri: string;
  clipId: string;
  selectedTimestamp: number;
  targetSectionName: string;
  targetSectionUri: string;
  isQuizScheduled: boolean;
  slideUri: string;
  slideNumber?: number;
}

interface CoverageFormProps {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  sectionNames: Section[];
  isEditing: boolean;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  courseId: string;
}

export function CoverageForm({
  formData,
  setFormData,
  sectionNames,
  isEditing,
  onSubmit,
  onCancel,
  courseId,
}: CoverageFormProps) {
  const duplicateTitles: string[] = findDuplicates(sectionNames.map(({ title }) => title.trim()));

  useEffect(() => {
    let updatedData = { ...formData };
    let dataChanged = false;

    if (formData.sectionName && formData.sectionName.trim() !== '' && !formData.sectionUri) {
      const section = sectionNames.find((s) => s.title.trim() === formData.sectionName.trim());
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
      const targetSection = sectionNames.find(
        (s) => s.title.trim() === formData.targetSectionName.trim()
      );
      if (targetSection) {
        updatedData.targetSectionUri = targetSection.uri;
        dataChanged = true;
      }
    }

    if (dataChanged) {
      setFormData(updatedData);
    }
  }, [formData, sectionNames]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name as string]: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timestamp = Date.parse(e.target.value);
    setFormData({ ...formData, selectedTimestamp: getNoonTimestampOnSameDay(timestamp) });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isQuizScheduled: e.target.checked });
  };

  const handleSlideUriChange = (uri: string, slideNumber: number) => {
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

    const selectedSection = sectionNames.find((section) => section.uri === selectedUri);
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

    const selectedSection = sectionNames.find((section) => section.uri === selectedUri);
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
          value={dayjs(formData.selectedTimestamp).format('YYYY-MM-DD')}
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
          <InputLabel id="section-name-select-label">Actually Got-to</InputLabel>
          <Select
            labelId="section-name-select-label"
            value={formData.sectionUri}
            onChange={handleSectionChange}
            name="sectionUri"
            label="Actually Got-to"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {sectionNames.map((section) => {
              const isDuplicate = false;// duplicateTitles.includes(section.title.trim());

              return (
                <MenuItem
                  key={section.uri}
                  value={section.uri}
                  sx={{
                    backgroundColor: isDuplicate ? 'rgba(255, 0, 0, 0.1)' : undefined,
                    borderLeft: isDuplicate ? '3px solid red' : undefined,
                    pl: isDuplicate ? 1 : undefined,
                  }}
                >
                  {section.title}
                </MenuItem>
              );
            })}
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
            {sectionNames.map((section) => {
              const isDuplicate = duplicateTitles.includes(section.title.trim());

              return (
                <MenuItem
                  key={section.uri}
                  value={section.uri}
                  sx={{
                    backgroundColor: isDuplicate ? 'rgba(255, 0, 0, 0.1)' : undefined,
                    borderLeft: isDuplicate ? '3px solid red' : undefined,
                    pl: isDuplicate ? 1 : undefined,
                  }}
                >
                  {section.title}
                </MenuItem>
              );
            })}
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
          sectionNames={sectionNames}
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
