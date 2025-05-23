import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { LectureEntry } from '@stex-react/utils';
import { Section } from '../types';
import { CoverageTable } from './CoverageTable';
import { CoverageForm } from './CoverageForm';

export function getSectionNameForUri(uri: string, sectionNames: Section[]): string {
  const section = sectionNames.find(({ uri: sectionUri }) => sectionUri === uri);
  return section?.title.trim() || '';
}

export function getNoonTimestampOnSameDay(timestamp: number) {
  return new Date(timestamp).setHours(12, 0, 0, 0);
}

function convertSnapToEntry(snap: LectureEntry, index: number): any {
  return {
    id: `${snap.timestamp_ms}-${index}`,
    timestamp_ms: snap.timestamp_ms,
    sectionName: getSectionNameForUri(snap.sectionUri || '', []),
    sectionUri: snap.sectionUri || '',
    targetSectionName: getSectionNameForUri(snap.targetSectionUri || '', []),
    targetSectionUri: snap.targetSectionUri || '',
    clipId: snap.clipId || '',
    isQuizScheduled: snap.isQuizScheduled || false,
    slideUri: snap.slideUri || '',
    slideNumber: snap.slideNumber,
  };
}

interface CoverageUpdaterProps {
  courseId: string;
  snaps: LectureEntry[];
  setSnaps: React.Dispatch<React.SetStateAction<LectureEntry[]>>;
  sectionNames: Section[];
}

export function CoverageUpdater({ courseId, snaps, setSnaps, sectionNames }: CoverageUpdaterProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    sectionName: '',
    sectionUri: '',
    clipId: '',
    selectedTimestamp: Date.now(),
    targetSectionName: '',
    targetSectionUri: '',
    isQuizScheduled: false,
    slideUri: '',
    slideNumber: undefined as number | undefined,
  });

  const theme = useTheme();

  useEffect(() => {
    if (snaps.length > 0) {
      const lastSnapUri = snaps[snaps.length - 1]?.sectionUri;
      const lastSnapName = getSectionNameForUri(lastSnapUri || '', sectionNames).trim();
      setFormData((prev) => ({
        ...prev,
        sectionName: lastSnapName,
        sectionUri: lastSnapUri || '',
      }));
    }
  }, [snaps, sectionNames]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, slideUri: '' }));
  }, [formData.sectionName, formData.sectionUri]);

  const handleEditItem = (index: number) => {
    const itemToEdit = snaps[index];
    const sectionNameToEdit = getSectionNameForUri(
      itemToEdit.sectionUri || '',
      sectionNames
    ).trim();
    const targetSectionNameToEdit = getSectionNameForUri(
      itemToEdit.targetSectionUri || '',
      sectionNames
    ).trim();

    setFormData({
      sectionName: sectionNameToEdit || '',
      sectionUri: itemToEdit.sectionUri || '',
      targetSectionName: targetSectionNameToEdit || '',
      targetSectionUri: itemToEdit.targetSectionUri || '',
      clipId: itemToEdit.clipId || '',
      selectedTimestamp: itemToEdit.timestamp_ms || Date.now(),
      isQuizScheduled: itemToEdit.isQuizScheduled || false,
      slideUri: itemToEdit.slideUri || '',
      slideNumber: itemToEdit.slideNumber || undefined,
    });

    setEditIndex(index);
  };

  const handleDeleteItem = (index: number) => {
    const updatedSnaps = snaps.filter((_, i) => i !== index);
    setSnaps(updatedSnaps);
  };

  const handleSubmitForm = (formData: any) => {
    const newItem: LectureEntry = {
      timestamp_ms: formData.selectedTimestamp,
      sectionUri: formData.sectionUri,
      targetSectionUri: formData.targetSectionUri,
      clipId: formData.clipId,
      isQuizScheduled: formData.isQuizScheduled,
      slideUri: formData.slideUri,
      slideNumber: formData.slideNumber,
    };

    if (editIndex !== null) {
      const updatedSnaps = [...snaps];
      updatedSnaps[editIndex] = newItem;
      setSnaps(updatedSnaps);
      setEditIndex(null);
    } else {
      setSnaps([...snaps, newItem]);
    }

    setFormData({
      sectionName: '',
      sectionUri: '',
      clipId: '',
      selectedTimestamp: Date.now(),
      targetSectionName: '',
      targetSectionUri: '',
      isQuizScheduled: false,
      slideUri: '',
      slideNumber: undefined,
    });
  };

  const handleCancelEdit = () => {
    setFormData({
      sectionName: '',
      sectionUri: '',
      clipId: '',
      selectedTimestamp: Date.now(),
      targetSectionName: '',
      targetSectionUri: '',
      isQuizScheduled: false,
      slideUri: '',
      slideNumber: undefined,
    });
    setEditIndex(null);
  };

  const coverageEntries = snaps.map((snap, index) => {
    const entry = convertSnapToEntry(snap, index);

    entry.sectionName = getSectionNameForUri(snap.sectionUri || '', sectionNames);
    entry.targetSectionName = getSectionNameForUri(snap.targetSectionUri || '', sectionNames);

    return entry;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {snaps.length > 0 ? (
        <>
          <CoverageTable
            entries={coverageEntries}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        </>
      ) : (
        <Box
          sx={{
            py: 5,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: `1px dashed ${theme.palette.divider}`,
            mb: 4,
          }}
        >
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No syllabus entries yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the form below to add your first entry
          </Typography>
        </Box>
      )}

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mt: 4,
          mb: 3,
          borderRadius: 2,
          border: editIndex !== null ? `1px solid ${theme.palette.primary.main}` : 'none',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          color={editIndex !== null ? 'primary' : 'textPrimary'}
        >
          {editIndex !== null ? 'Edit Lecture Entry' : 'Add New Lecture'}
        </Typography>

        <CoverageForm
          courseId={courseId}
          formData={formData}
          setFormData={setFormData}
          sectionNames={sectionNames}
          isEditing={editIndex !== null}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelEdit}
        />
      </Paper>
    </Box>
  );
}
export default CoverageUpdater;
