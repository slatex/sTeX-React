import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import {
  ContentFromUrl,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';
import axios from 'axios';
import { getOuterHTML } from 'domutils';
import { parseDocument } from 'htmlparser2';
import { useEffect, useState } from 'react';
import { BASE_URL } from './mmtParser';

export const BG_COLOR = 'hsl(210, 20%, 98%)';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  //padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
  backgroundColor: BG_COLOR,
  padding: '8px',
}));

export interface TourItem {
  uri: string;
  display: string;
}

function TourItemDisplay({
  item,
  lang = 'en',
}: {
  item: TourItem;
  lang?: string;
}) {
  return (
    <Accordion>
      <AccordionSummary>
        <b>{mmtHTMLToReact(item.display)}</b>
      </AccordionSummary>
      <AccordionDetails>
        <ContentFromUrl
          url={`${BASE_URL}/:vollki/frag?path=${item.uri}&lang=${lang}`}
          skipSidebar={true}
        />
      </AccordionDetails>
    </Accordion>
  );
}

function filterByName(nodes: any[], name: string): any[] {
  return nodes.filter((node) => (node as any).name === name);
}

function getTourItems(tourResponse: string) {
  const tourItems = [];
  const items = parseDocument(tourResponse).children;
  const trNodes = filterByName(items, 'tr');
  for (const trNode of trNodes) {
    const tdNode = filterByName((trNode as any).childNodes, 'td')[0];
    const aNode = filterByName((tdNode as any).childNodes, 'a')[0];
    const display = getOuterHTML(aNode.childNodes[0].childNodes[1]);
    const href: string = aNode.attribs?.href?.substring();
    const uri = href.substring(21, href.length - 2);
    tourItems.push({ uri, display });
  }
  return tourItems;
}

export function TourDisplay({
  tourId,
  userModel,
  language = 'en',
}: {
  tourId: string;
  userModel: string;
  language?: string;
}) {
  const [items, setItems] = useState([] as TourItem[]);
  useEffect(() => {
    if (!tourId?.length) return;
    // https://mmt.beta.vollki.kwarc.info/:vollki/tour?path=http://mathhub.info/sTeX/Algebra/General/mod/props?Absorption&user=nulluser&lang=en
    const tourInfoUrl = `${BASE_URL}/:vollki/tour?path=${tourId}&user=${userModel}&lang=${language}`;
    axios.get(tourInfoUrl).then((r) => setItems(getTourItems(r.data)));
  }, [tourId, userModel, language]);
  return (
    <>
      {items.map((item) => (
        <TourItemDisplay key={item.uri} item={item} lang={language} />
      ))}
    </>
  );
}
