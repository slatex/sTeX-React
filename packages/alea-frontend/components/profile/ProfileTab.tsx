import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/Edit';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';

import { EditProfileDialog } from './EditProfileDialog';

export const ProfileTab = ({ 
  t, 
  profileData, 
  userInfo, 
  setOpenEditDialog, 
  openEditDialog, 
  handleProfileUpdate 
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Box sx={{ flex: '1 1 50%' }}>
        <Card variant="outlined">
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.light',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">{t.personalInfo}</Typography>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditDialog(true)}
            >
              Edit
            </Button>
          </Box>
          <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 2 }}>
            {profileData ? (
              <Stack spacing={2}>
                {[
                  { label: t.firstName, value: profileData.firstName },
                  { label: t.lastName, value: profileData.lastName },
                  { label: t.email, value: profileData.email },
                  { label: t.studyProgram, value: profileData.studyProgram },
                  { label: t.semester, value: profileData.semester },
                  { label: t.languages, value: profileData.languages },
                ].map((field) => (
                  <Box key={field.label} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 'bold', color: 'text.secondary', minWidth: 140 }}
                    >
                      {field.label}:
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {field.value || '-'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>Loading...</Typography>
            )}
          </Box>
        </Card>
        
        <EditProfileDialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          profileData={profileData}
          userId={userInfo?.userId}
          onSave={handleProfileUpdate}
        />
      </Box>

      <Box sx={{ flex: '1 1 50%' }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6">{t.dataAlea}</Typography>
          </Box>
          <Stack spacing={2} sx={{ p: 2 }}>
            <Button
              component={Link}
              href="/my-notes"
              variant="contained"
              fullWidth
              startIcon={<NoteAltIcon />}
            >
              {t.myNotes}
            </Button>
            <Button
              component={Link}
              href="/my-learner-model"
              variant="contained"
              fullWidth
              startIcon={<AssessmentIcon />}
            >
              {t.myCompetencyData}
            </Button>
            <Button
              component={Link}
              href="/learner-model-init"
              variant="contained"
              fullWidth
              startIcon={<SchoolIcon />}
            >
              {t.learnerModelPriming}
            </Button>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
};