import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import GradingIcon from '@mui/icons-material/Grading';
import InsightsIcon from '@mui/icons-material/Insights';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SchoolIcon from '@mui/icons-material/School';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';

import { useState } from 'react';
import { EditProfileDialog } from './EditProfileDialog';

function CalendarInstruction({ openCalendarDialog, setOpenCalendarDialog, t }) {
  return (
    <Dialog
      open={openCalendarDialog}
      onClose={() => setOpenCalendarDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t.calendar.howTo}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <ol>
            <li>{t.calendar.stepOne}</li>
            <li>{t.calendar.stepTwo}</li>
            <li>{t.calendar.stepThree}</li>
            <li>{t.calendar.stepFour}</li>
            <li>{t.calendar.stepFive}</li>
          </ol>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

export const ProfileTab = ({
  t,
  profileData,
  userInfo,
  setOpenEditDialog,
  openEditDialog,
  handleProfileUpdate,
}) => {
  const [openCalendarDialog, setOpenCalendarDialog] = useState(false);
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
                  <Box key={field.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        minWidth: 160,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      {field.label} <span>:</span>
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
            <Link href="/my-notes" passHref>
              <Button variant="contained" fullWidth startIcon={<NoteAltIcon />}>
                {t.myNotes}
              </Button>
            </Link>
            <Link href="/my-learner-model" passHref>
              <Button variant="contained" fullWidth startIcon={<InsightsIcon />}>
                {t.myCompetencyData}
              </Button>
            </Link>
            <Link href="/my-answers" passHref>
              <Button variant="contained" fullWidth startIcon={<AssignmentTurnedInIcon />}>
                {t.myAnswers}
              </Button>
            </Link>
            <Link href="/my-grading" passHref>
              <Button variant="contained" fullWidth startIcon={<GradingIcon />}>
                {t.myGrading}
              </Button>
            </Link>
            <Link href="/learner-model-init" passHref>
              <Button variant="contained" fullWidth startIcon={<SchoolIcon />}>
                {t.learnerModelPriming}
              </Button>
            </Link>
            <Button
              variant="contained"
              fullWidth
              startIcon={<CalendarMonthIcon />}
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://courses.voll-ki.fau.de/api/calendar/create-calendar?userId=${userInfo?.userId}`
                );
                setOpenCalendarDialog(true);
              }}
            >
              {t.calendar.copyCalendarUrl}
            </Button>
          </Stack>
        </Card>
        <CalendarInstruction
          openCalendarDialog={openCalendarDialog}
          setOpenCalendarDialog={setOpenCalendarDialog}
          t={t}
        />
      </Box>
    </Box>
  );
};
