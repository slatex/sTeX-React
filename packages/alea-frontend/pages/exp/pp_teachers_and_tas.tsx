import { Box } from '@mui/material';
import axios from 'axios';
import parse from 'html-react-parser';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
const IMGS = [
  'wireframe',
  'total',
  ...Array.from(Array(16)).keys(), // 0 to 15
];

export function CycleImage() {
  const [val, setVal] = useState(0);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      id="lernkurve"
      width="480px"
      src={`/exp_res/learning_progess_${IMGS[val]}.png`}
      alt="Lernkurve"
      onClick={(e) => {
        if (e.button === 0) setVal((old) => (old + 1) % IMGS.length);
        else setVal((old) => (old + IMGS.length - 1) % IMGS.length);
      }}
      style={{ cursor: 'pointer' }}
    ></img>
  );
}

function customReplaceFunc(d: any) {
  if (d.name === 'img' && d['attribs']['id'] === 'lernkurve')
    return <CycleImage />;
  if (d.name === 'body') d.name = 'div';
}

const PPTeachersAndTas: NextPage = () => {
  const [renderedHtml, setRenderedHtml] = useState<any>(undefined);
  useEffect(() => {
    axios.get('/exp_res/pp_teachers_and_tas.htm').then((resp) => {
      setRenderedHtml(parse(resp.data, { replace: customReplaceFunc }));
    });
  }, []);
  return (
    <MainLayout title="Experiments | VoLL-KI">
      <Box px="10px" m="auto" maxWidth="600px">
        {renderedHtml}
      </Box>
    </MainLayout>
  );
};

export default PPTeachersAndTas;
