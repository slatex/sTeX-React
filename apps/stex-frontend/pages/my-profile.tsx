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
  getAllMyData,
  getUserInfo,
  purgeAllMyData,
  UserInfo,
} from '@stex-react/api';
import { downloadFile } from '@stex-react/utils';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

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
          Warning: This will permanantly delete all your data and may
          significantly affect the content that is presented to you.
          <br />
          <br />
          Enter the text <b>Purge my data</b> in the box below to confirm.
          <br /> <br />
        </DialogContentText>
        <TextField
          label="Name"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button
          onClick={() => onClose(true)}
          disabled={text.toLowerCase() != 'purge my data'}
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
      <Box p="10px" m="0 auto" maxWidth="800px">
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
        <Button
          variant="contained"
          onClick={() => {
            getAllMyData().then((data) => {
              downloadFile(
                JSON.stringify(data, undefined, 2),
                `${userInfo.userId}-${Date.now()}.json`,
                'text/json'
              );
            });
          }}
        >
          Download your data
        </Button>
        <br />
        <br />
        <Button variant="contained" onClick={() => setOpenPurgeDialog(true)}>
          Purge your data
        </Button>
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
