import { FTML } from '@kwarc/ftml-viewer';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { LectureEntry } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import { SecInfo } from '../types';
import { CoverageForm, FormData } from './CoverageForm';
import { CoverageTable } from './CoverageTable';

export function getSectionNameForUri(
  uri: string,
  secInfo: Record<FTML.DocumentURI, SecInfo>
): string {
  const section = secInfo[uri];
  return section?.title.trim() || '';
}

export function getNoonTimestampOnSameDay(timestamp: number) {
  return new Date(timestamp).setHours(12, 0, 0, 0);
}

function convertSnapToEntry(snap: LectureEntry, index: number): any {
  return {
    id: `${snap.timestamp_ms}-${index}`,
    timestamp_ms: snap.timestamp_ms,
    sectionName: getSectionNameForUri(snap.sectionUri || '', {}),
    sectionUri: snap.sectionUri || '',
    targetSectionName: getSectionNameForUri(snap.targetSectionUri || '', {}),
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
  secInfo: Record<FTML.DocumentURI, SecInfo>;
  handleSave: (snaps: LectureEntry[]) => void;
}

export function CoverageUpdater({ courseId, snaps, secInfo, handleSave }: CoverageUpdaterProps) {
  const [formData, setFormData] = useState<FormData>({
    sectionName: '',
    sectionUri: '',
    clipId: '',
    timestamp_ms: Date.now(),
    targetSectionName: '',
    targetSectionUri: '',
    isQuizScheduled: false,
    slideUri: '',
    slideNumber: undefined as number | undefined,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const theme = useTheme();
  useEffect(() => {
    if (snaps.length > 0) {
      const lastSnapUri = snaps[snaps.length - 1]?.sectionUri;
      const lastSnapName = getSectionNameForUri(lastSnapUri || '', secInfo).trim();
      setFormData((prev) => ({
        ...prev,
        sectionName: lastSnapName,
        sectionUri: lastSnapUri || '',
      }));
    }
  }, [snaps, secInfo]);

  const handleDeleteItem = (index: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    const updatedSnaps = snaps.filter((_, i) => i !== index);
    handleSave(updatedSnaps);
  };

  const handleCancelEdit = () => {
    setFormData({
      sectionName: '',
      sectionUri: '',
      clipId: '',
      timestamp_ms: Date.now(),
      targetSectionName: '',
      targetSectionUri: '',
      isQuizScheduled: false,
      slideUri: '',
      slideNumber: undefined,
    });
    setEditIndex(null);
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
    setFormData({
      sectionName: '',
      sectionUri: '',
      clipId: '',
      timestamp_ms: Date.now(),
      targetSectionName: '',
      targetSectionUri: '',
      isQuizScheduled: false,
      slideUri: '',
      slideNumber: undefined,
    });
    handleSave([...snaps, newItem]);
  };

  const handleEditDialogOpen = (entry: FormData, index: number) => {
    console.log('setformdata', entry.slideUri);

    setFormData({ ...entry });
    setEditIndex(index);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    handleCancelEdit();
    setEditIndex(null);
  };

  const handleEditDialogSave = (data: FormData) => {
    if (editIndex === null) {
      return;
    }
    const updatedSnaps = [...snaps];
    updatedSnaps[editIndex] = { ...data };
    handleSave(updatedSnaps);
    handleEditDialogClose();
  };

  const coverageEntries = snaps.map((snap, index) => {
    const entry = convertSnapToEntry(snap, index);
    entry.sectionName = getSectionNameForUri(snap.sectionUri || '', secInfo);
    entry.targetSectionName = getSectionNameForUri(snap.targetSectionUri || '', secInfo);
    return entry;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {snaps.length > 0 ? (
        <>
          <CoverageTable
            courseId={courseId}
            entries={snaps}
            secInfo={secInfo}
            onEdit={(idx) => handleEditDialogOpen(coverageEntries[idx], idx)}
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
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Coverage Entry</DialogTitle>
        <DialogContent>
          <br />
          <CoverageForm
            formData={formData}
            setFormData={setFormData}
            secInfo={secInfo}
            isEditing={true}
            onSubmit={handleEditDialogSave}
            onCancel={handleEditDialogClose}
            courseId={courseId}
          />
        </DialogContent>
      </Dialog>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mt: 4,
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom color={'textPrimary'}>
          Add New Lecture
        </Typography>

        {!editDialogOpen && (
          <CoverageForm
            courseId={courseId}
            formData={formData}
            setFormData={setFormData}
            secInfo={secInfo}
            isEditing={false}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelEdit}
          />
        )}
      </Paper>
    </Box>
  );
}
export default CoverageUpdater;
