import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import {
  getAllMyComments,
  getAllMyData,
  getUserInfo,
  purgeAllMyData,
  purgeComments,
  resetFakeUserData,
  UserInfo,
} from '@stex-react/api';
import { downloadFile } from '@stex-react/utils';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import MainLayout from '../layouts/MainLayout';
import { PersonaChooser } from './login';

export function ConfirmPurgeDialogContent({
  onClose,
}: {
  onClose: (confirmed: boolean) => void;
}) {
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
        <TextField
          label={t.confirmation}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>{t.cancel}</Button>
        <Button
          onClick={() => onClose(true)}
          disabled={text.toLocaleLowerCase() !== t.confirmText.toLocaleLowerCase()}
          variant="contained"
        >
          {t.purge}
        </Button>
      </DialogActions>
    </>
  );
}

const MyProfilePage: NextPage = () => {
  const router = useRouter();
  const { myProfile: t } = getLocaleObject(router);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [openPurgeDialog, setOpenPurgeDialog] = useState(false);
  const [persona, setPresetProfileName] = useState<string>('Blank');

  useEffect(() => {
    getUserInfo().then((info) => {
      if (!info) {
        router.push('/login');
        return;
      }
      setUserInfo(info);
    });
  }, [router]);

  if (!userInfo) return <></>;
  return (
    <MainLayout title={`${userInfo.fullName} | VoLL-KI`}>
      <Box p="10px" m="0 auto" maxWidth="800px" fontSize="1.2em">
        <h2>{userInfo.fullName}</h2>
        <h3 style={{ marginTop: '-15px' }}>
          <i>{userInfo.userId}</i>
        </h3>
        <hr />
        <br />
        <Link href="/my-notes" passHref>
          <Typography sx={{ '&:hover': { textDecoration: 'underline' } }}>
            {t.seePersonalNotes}
          </Typography>
        </Link>
        <br />
        <br />
        <Link href="/my-learner-model" passHref>
          <Typography sx={{ '&:hover': { textDecoration: 'underline' } }}>
            {t.seeCompetencyData}
          </Typography>
        </Link>
        <br />
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
        <Dialog
          onClose={() => setOpenPurgeDialog(false)}
          open={openPurgeDialog}
        >
          <ConfirmPurgeDialogContent
            onClose={async (confirmed) => {
              if (!confirmed) {
                setOpenPurgeDialog(false);
                return;
              }
              try {
                await purgeAllMyData();
                await purgeComments();
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
