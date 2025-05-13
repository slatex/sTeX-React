import { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { CoverageSnap } from '@stex-react/utils';
import { Section } from '../types';
import { CoverageTable } from './CoverageTable';
import { CoverageForm } from './CoverageForm';

export function getUriForSectionName(sectionName: string, sectionNames: Section[]): string {
  const section = sectionNames.find(({ title }) => title.trim() === sectionName);
  return section?.uri || '';
}

export function getSectionNameForUri(uri: string, sectionNames: Section[]): string {
  const section = sectionNames.find(({ uri: sectionUri }) => sectionUri === uri);
  return section?.title.trim() || '';
}

export function findDuplicates(arr: string[]): string[] {
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

export function getNoonTimestampOnSameDay(timestamp: number) {
  return new Date(timestamp).setHours(12, 0, 0, 0);
}

interface CoverageUpdaterProps {
  snaps: CoverageSnap[];
  setSnaps: React.Dispatch<React.SetStateAction<CoverageSnap[]>>;
  sectionNames: Section[];
}

export function CoverageUpdater({ snaps, setSnaps, sectionNames }: CoverageUpdaterProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    sectionName: '',
    clipId: '',
    selectedTimestamp: Date.now(),
    targetSectionName: '',
    isQuizScheduled: false,
    slideUri: '',
    slideNumber: undefined,
  });

  const theme = useTheme();

  useEffect(() => {
    const lastSnap = getSectionNameForUri(
      snaps[snaps.length - 1]?.sectionName,
      sectionNames
    ).trim();
    setFormData((prev) => ({ ...prev, sectionName: lastSnap }));
  }, [snaps, sectionNames]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, slideUri: '' }));
  }, [formData.sectionName]);

  const handleEditItem = (index: number) => {
    const itemToEdit = snaps[index];
    const sectionNameToEdit = getSectionNameForUri(itemToEdit.sectionName, sectionNames).trim();
    const targetSectionNameToEdit = getSectionNameForUri(
      itemToEdit.targetSectionName,
      sectionNames
    ).trim();

    setFormData({
      sectionName: sectionNameToEdit || '',
      targetSectionName: targetSectionNameToEdit || '',
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
    const sectionToAdd = formData.sectionName?.length
      ? getUriForSectionName(formData.sectionName, sectionNames)
      : '';

    const targetSectionToAdd = formData.targetSectionName?.length
      ? getUriForSectionName(formData.targetSectionName, sectionNames)
      : '';

    const newItem = {
      sectionId: sectionNames.find(({ title }) => title === formData.sectionName)?.id,
      timestamp_ms: formData.selectedTimestamp,
      sectionName: sectionToAdd,
      targetSectionName: targetSectionToAdd,
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
      clipId: '',
      selectedTimestamp: Date.now(),
      targetSectionName: '',
      isQuizScheduled: false,
      slideUri: '',
      slideNumber: undefined,
    });
  };

  const handleCancelEdit = () => {
    setFormData({
      sectionName: '',
      clipId: '',
      selectedTimestamp: Date.now(),
      targetSectionName: '',
      isQuizScheduled: false,
      slideUri: '',
      slideNumber: undefined,
    });
    setEditIndex(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {snaps.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 3 }}>
            Coverage Entries ({snaps.length})
          </Typography>

          <CoverageTable
            snaps={snaps}
            sectionNames={sectionNames}
            availableSlides={{}}
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
            No coverage entries yet
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
          {editIndex !== null ? 'Edit Coverage Entry' : 'Add New Coverage Entry'}
        </Typography>

        <CoverageForm
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
