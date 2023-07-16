import React, { useState, useEffect } from 'react';
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
import { UserInfo, getAuthHeaders, getUserInfo } from '@stex-react/api';
import axios from 'axios';
import { localStore } from '@stex-react/utils';

export enum InterviewResponse {
  YES = 'YES',
  NO = 'NO',
  ASK_LATER = 'ASK_LATER',
}

function wasLastResponseLongAgo() {
  const lastPrompted = localStorage.getItem('interview-lastPrompted');
  return Date.now() - Number(lastPrompted) > 24 * 60 * 60 * 1000;
}

const Popup = () => {
  const [open, setOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    getUserInfo().then((i) => {
      setUserInfo(i);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (userInfo) {
      const headers = getAuthHeaders();
      axios
        .get('/api/read-interview-response', { headers })
        .then(
          (resp) => setOpen(!resp.data && wasLastResponseLongAgo()),
          console.log
        );
    } else {
      const userResponse = localStorage.getItem('interview-userResponse');

      if (
        !userResponse ||
        (userResponse === InterviewResponse.ASK_LATER &&
          wasLastResponseLongAgo())
      ) {
        console.log('opening');
        setOpen(true);
      }
    }
  }, [userInfo, isLoading]);

  const handleResponse = (response) => {
    localStore?.setItem('interview-lastPrompted', Date.now().toString());
    localStore?.setItem('interview-userResponse', response);
    if (userInfo) {
      if (response !== InterviewResponse.ASK_LATER) {
        const headers = getAuthHeaders();
        axios.post('/api/write-interview-response', { response }, { headers });
        alert('Your response has been noted. Thank you!');
      }
    } else if (response === InterviewResponse.YES) {
      const body = { response, userName, userEmail };
      axios.post('/api/write-interview-response', body);
      alert('Your response has been noted. Thank you!');
    }

    setOpen(false);
  };

  if (process.env.NEXT_PUBLIC_SHOW_INTERVIEW_POPUP !== 'true') return <></>;

  return (
    <Dialog
      open={open}
      onClose={() => handleResponse(InterviewResponse.ASK_LATER)}
      maxWidth="md"
    >
      <DialogContent sx={{ p: 0 }}>
        <img
          src="/interview.jpg"
          alt="Interview"
          style={{
            width: '100%',
            maxHeight: '200px',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <DialogContentText sx={{ p: '10px' }}>
          <b>Dear {userInfo?.givenName || 'Learner'},</b> <br />
          We invite you to participate in an in-person interview to gain
          insights into your user experience and receive feedback on the new
          features of our platform. Your valuable input will greatly contribute
          to shaping the future of our platform.
          <br />
          <br />
          The interview will be held between 24 and 28 July 2023 at
          Martensstraße 3, 91058 Erlangen, Germany (near Prof. Kohlhase&apos;s
          office). The interview will take about 30 minutes. You will receive a
          <b> 10€ Amazon gift card</b> as a token of appreciation.
        </DialogContentText>
        {!userInfo && (
          <Box sx={{ p: '10px' }}>
            <TextField
              label="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              fullWidth
              sx={{ mt: '10px' }}
            />
            <TextField
              label="Your Email address"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              fullWidth
              sx={{ mt: '10px' }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleResponse(InterviewResponse.NO)}>No</Button>
        <Button onClick={() => handleResponse(InterviewResponse.ASK_LATER)}>
          Ask later
        </Button>
        <Button
          onClick={() => handleResponse(InterviewResponse.YES)}
          variant="contained"
          disabled={!userInfo && (!userName || !userEmail)}
          autoFocus
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Popup;
