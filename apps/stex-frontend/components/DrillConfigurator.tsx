import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  Slider,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  ALL_SMILEY_LEVELS,
  BloomDimension,
  getAuthHeaders,
  SmileyCognitiveValues,
  SmileyLevel,
  smileyToLevel,
  SMILEY_TOOLTIPS,
} from '@stex-react/api';
import { DimIcon, LevelIcon } from '@stex-react/stex-react-renderer';
import { PRIMARY_COL, SECONDARY_COL } from '@stex-react/utils';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { DefInfo } from '../definitions.preval';
import { FlashCardMode, FlashCards } from './FlashCards';

function getMarks(
  dim: BloomDimension,
  rememberValue: number,
  understandValue: number
) {
  const value =
    dim === BloomDimension.Remember ? rememberValue : understandValue;
  return ALL_SMILEY_LEVELS.map((l) => {
    return {
      value: l,
      label: (
        <Tooltip title={SMILEY_TOOLTIPS[dim]?.[l] || `Level ${l}`}>
          <LevelIcon level={l} highlighted={l <= value} />
        </Tooltip>
      ),
    };
  });
}

function isRemember(dim: BloomDimension) {
  return dim === BloomDimension.Remember;
}
function isDisabled(
  dim: BloomDimension,
  useRemember: boolean,
  useUnderstand: boolean
) {
  const isRem = isRemember(dim);
  return (isRem && !useRemember) || (!isRem && !useUnderstand);
}

export interface CardsWithSmileys extends DefInfo, SmileyCognitiveValues {}

function getDrillCounts(
  cards?: CardsWithSmileys[]
): { chapter: string; count: number }[] {
  if (!cards) return [];
  const counts: { chapter: string; count: number }[] = [];
  for (const card of cards) {
    const chapter = card.chapter;
    const idx = counts.findIndex((v) => v.chapter === chapter);
    if (idx === -1) {
      counts.push({ chapter, count: 1 });
    } else {
      counts[idx].count++;
    }
  }
  return counts;
}

function getSelectedCards(
  cards: CardsWithSmileys[] | undefined,
  checkedChapters: string[],
  rememberValue: SmileyLevel,
  understandValue: SmileyLevel
) {
  if (!cards) return [];
  console.log(cards[0]);
  console.log(checkedChapters.includes(cards[0].chapter));
  console.log(smileyToLevel(cards[0].Remember) <= rememberValue);
  console.log(smileyToLevel(cards[0].Analyse) <= understandValue);
  return cards.filter(
    (card) =>
      checkedChapters.includes(card.chapter) &&
      smileyToLevel(card.Remember) <= rememberValue &&
      smileyToLevel(card.Analyse) <= understandValue
  );
}

export function DrillConfigurator({ courseId }: { courseId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [courseCards, setCourseCards] = useState<
    CardsWithSmileys[] | undefined
  >(undefined);

  const [rememberValue, setRememberValue] = useState<SmileyLevel>(2);
  const [understandValue, setUnderstandValue] = useState<SmileyLevel>(2);
  const [useRemember, setUseRemember] = useState(true);
  const [useUnderstand, setUseUnderstand] = useState(true);
  const [checked, setChecked] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState(FlashCardMode.REVISION_MODE);

  const drillCounts = getDrillCounts(courseCards);
  const selectedCards = getSelectedCards(
    courseCards,
    checked.map((idx) => drillCounts[idx].chapter),
    useRemember ? rememberValue : 2,
    useMediaQuery ? understandValue : 2
  );

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  useEffect(() => {
    if (!courseId) return;
    setIsLoading(true);
    axios
      .get(`/api/get-cards-with-smileys/${courseId}`, {
        headers: getAuthHeaders(),
      })
      .then((r) => {
        setIsLoading(false);
        setCourseCards(r.data);
      });
  }, [courseId]);

  if (isLoading) return <CircularProgress />;

  if (started) {
    return (
      <FlashCards
        mode={mode}
        items={selectedCards}
        onCancelOrFinish={() => setStarted(false)}
      />
    );
  }

  return (
    <Box>
      <List sx={{ bgcolor: 'background.paper' }}>
        {drillCounts.map(({ chapter, count }, idx) => {
          const labelId = `checkbox-list-label-${idx}`;

          return (
            <ListItem key={idx} disablePadding>
              <ListItemButton
                role={undefined}
                onClick={handleToggle(idx)}
                dense
                sx={{ p: '0 0 0 10px', m: '0' }}
              >
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <Checkbox
                    edge="start"
                    checked={checked.indexOf(idx) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText
                  id={labelId}
                  primary={
                    <Box sx={{ fontSize: '14px' }}>
                      <b style={{ display: 'block', color: PRIMARY_COL }}>
                        {chapter}
                      </b>
                      <b style={{ color: SECONDARY_COL }}>{count} Concepts</b>
                    </Box>
                  }
                />

                <Box display="flex" alignItems="center" gap="5px 10px">
                  <Button
                    size="small"
                    sx={{fontWeight: 'bold'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      setChecked([idx]);
                      setRememberValue(2);
                      setUnderstandValue(2);
                      setMode(FlashCardMode.REVISION_MODE);
                      setStarted(true);
                    }}
                  >
                    Revise
                  </Button>
                  <Button
                    size="small"
                    sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setChecked([idx]);
                      setRememberValue(2);
                      setUnderstandValue(2);
                      setMode(FlashCardMode.DRILL_MODE);
                      setStarted(true);
                    }}
                  >
                    Drill
                  </Button>
                </Box>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {[BloomDimension.Remember, BloomDimension.Understand].map((dim) => (
        <Box
          key={dim}
          display="flex"
          width="250px"
          m="0 auto 10px"
          alignItems="center"
          p="0 20px 20px 0"
          borderBottom={isRemember(dim) ? '1px solid #DDD' : undefined}
        >
          <Tooltip title={`I ${dim}. Click to enable/disable.`}>
            <IconButton
              onClick={() => {
                isRemember(dim)
                  ? setUseRemember((prev) => !prev)
                  : setUseUnderstand((prev) => !prev);
              }}
            >
              <DimIcon showTitle={false} dim={dim} white={false} />
            </IconButton>
          </Tooltip>
          <Slider
            step={1}
            value={isRemember(dim) ? rememberValue : understandValue}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => {
              return SMILEY_TOOLTIPS[dim][value];
            }}
            onChange={(_e: Event, newValue: SmileyLevel) => {
              isRemember(dim)
                ? setRememberValue(newValue)
                : setUnderstandValue(newValue);
            }}
            marks={getMarks(dim, rememberValue, understandValue)}
            min={-2}
            max={2}
            sx={{
              ml: '20px',
              filter: isDisabled(dim, useRemember, useUnderstand)
                ? 'grayscale(1)'
                : undefined,
            }}
            disabled={isDisabled(dim, useRemember, useUnderstand)}
          />
        </Box>
      ))}
      <Box>
        <Box display="flex" gap="10px" justifyContent="center" m="20px 0 5px">
          <Button
            variant="contained"
            disabled={selectedCards.length === 0}
            onClick={(e) => {
              e.stopPropagation();
              setMode(FlashCardMode.REVISION_MODE);
              setStarted(true);
            }}
          >
            Revise
          </Button>
          <Button
            variant="contained"
            disabled={selectedCards.length === 0}
            onClick={(e) => {
              e.stopPropagation();
              setMode(FlashCardMode.DRILL_MODE);
              setStarted(true);
            }}
          >
            Drill
          </Button>
        </Box>

        <b
          style={{
            color: SECONDARY_COL,
            textAlign: 'center',
            display: 'block',
            fontFamily: "'Roboto'"
          }}
        >
          {selectedCards.length} cards selected
        </b>
      </Box>
    </Box>
  );
}
