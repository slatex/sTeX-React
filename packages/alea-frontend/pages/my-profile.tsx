import EmailIcon from '@mui/icons-material/Email';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  ANON_USER_ID_PREFIX,
  UserInfo,
  getAllMyComments,
  getAllMyData,
  getUserInfo,
  getUserInformation,
  purgeAllMyData,
  purgeComments,
  purgeStudyBuddyData,
  purgeUserNotifications,
  resetFakeUserData,
  sendVerificationEmail,
  updateSectionReviewStatus,
  updateTrafficLightStatus,
} from '@stex-react/api';
import { PRIMARY_COL, downloadFile } from '@stex-react/utils';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import MainLayout from '../layouts/MainLayout';
import { PersonaChooser } from './login';

export function ConfirmPurgeDialogContent({ onClose }: { onClose: (confirmed: boolean) => void }) {
  const router = useRouter();
  const { myProfile: t } = getLocaleObject(router);
  const [text, setText] = useState('');
  return (
    <>
      <DialogTitle>{t.confirmPurge}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t.purgeWarning}
          <br />
          <br />
          Enter this text in the box below to confirm: <b>{t.confirmText}</b>
          <br /> <br />
        </DialogContentText>
        <TextField label={t.confirmation} value={text} onChange={(e) => setText(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>{t.cancel}</Button>
        <Button
          onClick={() => onClose(true)}
          disabled={text.toLocaleLowerCase() !== t.confirmText.toLocaleLowerCase()}
          variant="contained"
          color="error"
        >
          {t.purge}
        </Button>
      </DialogActions>
    </>
  );
}

const MyProfilePage: NextPage = () => {
  const router = useRouter();
  const { myProfile: t, logInSystem: l } = getLocaleObject(router);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [openPurgeDialog, setOpenPurgeDialog] = useState(false);
  const [persona, setPresetProfileName] = useState<string>('Blank');
  const [trafficLightStatus, setTrafficLightStatus] = useState<boolean>(false);
  const [sectionReviewStatus, setSectionReviewStatus] = useState<boolean>(false);
  const [isVerifiedUser, setIsVerifiedUser] = useState<boolean>(false);

  useEffect(() => {
    getUserInfo().then((info) => {
      if (!info) {
        router.push('/login');
        return;
      }
      setUserInfo(info);
    });
  }, [router]);

  useEffect(() => {
    getUserInformation().then((res) => setTrafficLightStatus(res.showTrafficLight));
  }, [trafficLightStatus]);
  useEffect(() => {
    getUserInformation().then((res) => setSectionReviewStatus(res.showSectionReview));
  }, [sectionReviewStatus]);
  useEffect(() => {
    getUserInformation().then((res) => {
      setIsVerifiedUser(res.isVerified);
    });
  }, [isVerifiedUser]);

  async function handleTrafficLight(trafficLightStatus: boolean) {
    try {
      await updateTrafficLightStatus(trafficLightStatus);
      setTrafficLightStatus(trafficLightStatus);
      console.log('Traffic light status updated successfully.');
    } catch (error) {
      console.error('Error updating traffic light status:', error);
    }
  }
  async function handleSectionReviewStatus(sectionReviewStatus: boolean) {
    try {
      await updateSectionReviewStatus(sectionReviewStatus);
      setSectionReviewStatus(sectionReviewStatus);
      console.log('Section review status updated successfully.');
    } catch (error) {
      console.error('Error updating section review status:', error);
    }
  }

  async function handleVerification(userId: string) {
    try {
      await sendVerificationEmail(userId, crypto.randomUUID());
      alert(l.verificationEmail);
    } catch (error) {
      alert(l.somethingWentWrong);
      console.error('Error in sending verification email:', error);
    }
  }
  if (!userInfo) return <></>;
  return (
    <MainLayout title={`${userInfo.fullName} | VoLL-KI`}>
      <Box p="10px" m="0 auto" maxWidth="800px" fontSize="1.2em">
        <h2>{userInfo.fullName}</h2>
        <h3 style={{ marginTop: '-15px' }}>
          <i>{userInfo.userId}</i>
        </h3>
        {!isVerifiedUser && !userInfo.userId.startsWith(ANON_USER_ID_PREFIX) && (
          <Box>
            <Typography>{l.verifcationMessage}</Typography>
            <Button onClick={() => handleVerification(userInfo.userId)} variant="contained">
              {l.sendVerifcationBtn}
              <EmailIcon sx={{ marginLeft: '5px' }} />
            </Button>
          </Box>
        )}
        <hr />
        <Link href="/my-notes" passHref>
          <Button variant="contained" sx={{ m: '10px 0' }}>
            {t.myNotes}
          </Button>
        </Link>
        <br />
        <Link href="/my-learner-model" passHref>
          <Button variant="contained" sx={{ m: '10px 0' }}>
            {t.myCompetencyData}
          </Button>
        </Link>
        <br />
        <Link href="/learner-model-init" passHref>
          <Button variant="contained" sx={{ m: '10px 0' }}>
            {t.learnerModelPriming}
          </Button>
        </Link>
        <br />
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  <Typography fontWeight="bold" color={PRIMARY_COL}>
                    Show Traffic Light on Notes
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Switch
                    checked={trafficLightStatus}
                    onChange={() => handleTrafficLight(!trafficLightStatus)}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  <Typography fontWeight="bold" color={PRIMARY_COL}>
                    Show the Review Section on Notes.
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Switch
                    checked={sectionReviewStatus}
                    onChange={() => handleSectionReviewStatus(!sectionReviewStatus)}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <br />
        <h2
          style={{
            borderBottom: '1px solid #AAA',
            padding: '7px 0',
            display: 'inline',
          }}
        >
          {t.downloadData}
        </h2>
        <br />
        <br />
        <Button
          variant="contained"
          onClick={() => {
            getAllMyComments().then((data) => {
              downloadFile(
                JSON.stringify(data, undefined, 2),
                `${userInfo.userId}-comments-${Date.now()}.json`,
                'text/json'
              );
            });
          }}
        >
          {t.downloadNotes}
        </Button>
        <br />
        <br />
        <Button
          variant="contained"
          onClick={() => {
            getAllMyData().then((data) => {
              downloadFile(
                JSON.stringify(data, undefined, 2),
                `${userInfo.userId}-lms-${Date.now()}.json`,
                'text/json'
              );
            });
          }}
        >
          {t.downloadProfile}
        </Button>
        <br />
        <br />
        <h2
          style={{
            borderBottom: '1px solid #AAA',
            padding: '7px 0',
            display: 'inline',
          }}
        >
          {t.dataDeletion}
        </h2>
        <br />
        <br />
        <Button variant="contained" onClick={() => setOpenPurgeDialog(true)}>
          {t.purgeData}
        </Button>
        {userInfo?.userId?.startsWith('fake_') && (
          <Box>
            <br />
            <br />
            <hr />
            <PersonaChooser
              label={t.choosePersona}
              persona={persona}
              onPersonaUpdate={(l) => {
                setPresetProfileName(l);
              }}
            />
            <Button
              disabled={!persona?.length}
              variant="contained"
              onClick={() => resetFakeUserData(persona)}
              sx={{ ml: '10px' }}
            >
              {t.resetFake}
            </Button>
          </Box>
        )}
        <Dialog onClose={() => setOpenPurgeDialog(false)} open={openPurgeDialog}>
          <ConfirmPurgeDialogContent
            onClose={async (confirmed) => {
              if (!confirmed) {
                setOpenPurgeDialog(false);
                return;
              }
              try {
                await purgeAllMyData();
                await purgeComments();
                await purgeUserNotifications();
                await purgeStudyBuddyData();
                alert(t.dataPurged);
                setOpenPurgeDialog(false);
              } catch (err) {
                console.log(err);
                alert(t.purgeError);
              }
            }}
          />
        </Dialog>
      </Box>
    </MainLayout>
  );
};
export default MyProfilePage;
