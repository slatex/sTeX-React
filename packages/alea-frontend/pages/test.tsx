import { Box } from '@mui/material';
import { useState } from 'react';

const Test = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [status, setStatus] = useState('loggedOut');
  function test(){
    return "test";
  }
  return <Box>Test</Box>;
};

export default Test;

