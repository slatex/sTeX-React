import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, List, ListItem, Tooltip } from '@mui/material';
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
import { CourseSection, DeckAndVideoInfo } from '../shared/types';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useEffect, useReducer, useRef } from 'react';
import { getUriWeights } from '@stex-react/api';

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

function isDeckNeeded(
  deck: DeckAndVideoInfo,
  competencyMap: Map<string, number | undefined>
) {
  if (!deck.skipIfCompetency?.length) return true;
  for (const uri of deck.skipIfCompetency) {
    if ((competencyMap.get(uri) || 0) === 0) return true;
  }
  return false;
}

function isSectionNeeded(
  section: CourseSection,
  competencyMap: Map<string, number | undefined>
) {
  for (const deck of section?.decks || []) {
    if (isDeckNeeded(deck, competencyMap)) return true;
  }
  return false;
}

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
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const competencyMap = useRef(new Map<string, number | undefined>()).current;
  useEffect(() => {
    if (!sections?.length) return;
    for (const section of sections) {
      for (const deck of section.decks || []) {
        for (const uri of deck.skipIfCompetency || [])
          competencyMap.set(uri, undefined);
      }
    }
    const competencyMapUris = Array.from(competencyMap.keys());
    getUriWeights(competencyMapUris).then((competencyValues) => {
      for (const [idx, val] of competencyValues.entries()) {
        const uri = competencyMapUris[idx];
        competencyMap.set(uri, val.Remember);
        forceRerender();
      }
    });
  }, [sections]);

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
        <SectionAccordion
          key={section.sectionTitle}
          selectedSectionIdx={selectedSectionIdx}
          selectedDeckId={selected}
          section={section}
          sectionIdx={sectionIdx}
          competencyMap={competencyMap}
          onSelect={onSelect}
        />
      ))}
    </FixedPositionMenu>
  );
}

function SectionAccordion({
  section,
  sectionIdx,
  selectedDeckId,
  selectedSectionIdx,
  competencyMap,
  onSelect
}: {
  section: CourseSection;
  sectionIdx: number;
  selectedDeckId: string;
  selectedSectionIdx: number;
  competencyMap: Map<string, number | undefined>;
  onSelect: (item: string) => void;
}) {
  if (section.isAddlSuggestion && !isSectionNeeded(section, competencyMap)) return <></>;

  return (
    <Accordion defaultExpanded={true}>
      <AccordionSummary>
        {section.isAddlSuggestion && (
          <Tooltip title="Personalized Suggestion">
            <AutoAwesomeIcon
              sx={{ color: 'green', fontSize: '18px', pr: '5px' }}
            />
          </Tooltip>
        )}
        <span
          style={{
            fontWeight: selectedSectionIdx == sectionIdx ? 'bold' : undefined,
          }}
        >
          {sectionIdx}. {section.sectionTitle}
        </span>
      </AccordionSummary>
      <AccordionDetails>
        <List sx={{ p: '0' }}>
          {section.decks
            .filter((deck) => isDeckNeeded(deck, competencyMap))
            .map((deck) => (
              <ListItem
                key={deck.deckId}
                sx={{
                  cursor: 'pointer',
                  fontWeight: selectedDeckId === deck.deckId ? 'bold' : undefined,
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
  );
}
