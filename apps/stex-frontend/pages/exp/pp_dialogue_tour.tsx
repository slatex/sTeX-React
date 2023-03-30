import { Box } from '@mui/material';
import axios from 'axios';
import parse from 'html-react-parser';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

function customReplaceFunc(d: any) {
  if (d.name === 'body') d.name = 'div';
}

const PPDialogueTour: NextPage = () => {
  const [renderedHtml, setRenderedHtml] = useState<any>(undefined);
  useEffect(() => {
    axios.get('/exp_res/pp_dialogue_tour.htm').then((resp) => {
      setRenderedHtml(parse(resp.data, { replace: customReplaceFunc }));
    });
  }, []);
  return (
    <MainLayout title="Experiments | VoLL-KI">
      <Box px="10px" m="auto" maxWidth="850px">
        {renderedHtml}
      </Box>
    </MainLayout>
  );
};

export default PPDialogueTour;
