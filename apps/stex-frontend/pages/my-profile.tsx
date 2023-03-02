import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
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
import MainLayout from '../layouts/MainLayout';
import { PersonaChooser } from './login';

export function ConfirmPurgeDialogContent({
  onClose,
}: {
  onClose: (confirmed: boolean) => void;
}) {
  const [text, setText] = useState('');
  return (
    <>
      <DialogTitle>Confirm Data Purge</DialogTitle>
      <DialogContent>
        <DialogContentText>
          WARNING: This will delete all data the system has on you (learner
          model, interaction logs, comments, and notes) except for the
          information that/when you purged the data. Your learning experience
          may be significantly affected.
          <br />
          <br />
          Enter the text <b>Purge my data</b> in the box below to confirm.
          <br /> <br />
        </DialogContentText>
        <TextField
          label="Confirmation"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button
          onClick={() => onClose(true)}
          disabled={text.toLowerCase() !== 'purge my data'}
          variant="contained"
        >
          Purge
        </Button>
      </DialogActions>
    </>
  );
}

const MyProfilePage: NextPage = () => {
  const router = useRouter();
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
        See all your{' '}
        <Link href="/my-notes" passHref>
          <span style={{ textDecoration: 'underline' }}>personal notes</span>
        </Link>
        .
        <br />
        <br />
        See your{' '}
        <Link href="/my-learner-model" passHref>
          <span style={{ textDecoration: 'underline' }}>competency data</span>
        </Link>
        .
        <br />
        <br />
        <h2
          style={{
            borderBottom: '1px solid #AAA',
            padding: '7px 0',
            display: 'inline',
          }}
        >
          Download your Data
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
          Download your notes and comments
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
          Download your profile data
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
          Data Deletion
        </h2>
        <br />
        <br />
        <Button variant="contained" onClick={() => setOpenPurgeDialog(true)}>
          Purge your data
        </Button>
        {userInfo?.userId?.startsWith('fake_') && (
          <Box>
            <br />
            <br />
            <hr />
            <PersonaChooser
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
              Reset Fake User Data
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
                alert('Data purged');
                setOpenPurgeDialog(false);
              } catch (err) {
                console.log(err);
                alert('Some error purging data');
              }
            }}
          />
        </Dialog>
      </Box>
    </MainLayout>
  );
};
export default MyProfilePage;
