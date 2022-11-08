import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, List, ListItem } from '@mui/material';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import {
  FixedPositionMenu,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';
import { CourseSection } from '../shared/types';

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
  padding: theme.spacing(0),
  borderTop: '2px solid #00000020',
}));

export function SlideDeckNavigation({
  sections,
  selected,
  onSelect,
  onClose,
}: {
  sections: CourseSection[];
  selected: string;
  onSelect: (item: string) => void;
  onClose: () => void;
}) {
  const selectedSectionIdx = sections.findIndex((section) =>
    section.decks.some((deck) => deck.deckId === selected)
  );
  return (
    <FixedPositionMenu
      staticContent={
        <Box display="flex" alignItems="center">
          <IconButton sx={{ m: '2px' }} onClick={() => onClose()}>
            <CloseIcon />
          </IconButton>
          Course Content
        </Box>
      }
    >
      {sections.slice(0, -1).map((section, sectionIdx) => (
        <Accordion key={section.sectionTitle} defaultExpanded={true}>
          <AccordionSummary>
            <span
              style={{
                fontWeight:
                  selectedSectionIdx == sectionIdx ? 'bold' : undefined,
              }}
            >
              {sectionIdx}. {section.sectionTitle}
            </span>
          </AccordionSummary>
          <AccordionDetails>
            <List sx={{ p: '0' }}>
              {section.decks.map((deck, idx) => (
                <ListItem
                  key={deck.deckId}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: selected === deck.deckId ? 'bold' : undefined,
                    display: 'flex',
                    alignItems: 'baseline',
                    borderBottom: '1px solid #00000020',
                  }}
                  onClick={() => onSelect(deck.deckId)}
                >
                  {deck.secNo && (
                    <span>
                      {sectionIdx}.{deck.secNo}&nbsp;
                    </span>
                  )}
                  {mmtHTMLToReact(deck.titleAsHtml)}
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </FixedPositionMenu>
  );
}
