import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  Slider,
  Tooltip,
  Typography,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  ALL_SMILEY_LEVELS,
  BloomDimension,
  getAuthHeaders,
  isLoggedIn,
  SmileyCognitiveValues,
  SmileyLevel,
  smileyToLevel,
  SMILEY_TOOLTIPS,
} from '@stex-react/api';
import { DimIcon, LevelIcon } from '@stex-react/stex-react-renderer';
import { PRIMARY_COL, SECONDARY_COL } from '@stex-react/utils';
import axios from 'axios';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { DefInfo } from '../definitions.preval';
import { FlashCardMode, FlashCards } from './FlashCards';

function getMarks(
  dim: BloomDimension,
  rememberValue: SmileyLevel | undefined,
  understandValue: SmileyLevel | undefined
) {
  const value =
    dim === BloomDimension.Remember ? rememberValue : understandValue;
  return ALL_SMILEY_LEVELS.map((l) => {
    return {
      value: l,
      label: (
        <LevelIcon level={l} highlighted={value === undefined || l <= value} />
      ),
    };
  });
}

export interface CardsWithSmileys extends DefInfo, SmileyCognitiveValues {}

function cardMeetsLevelReqs(
  card: CardsWithSmileys,
  loggedIn: boolean,
  levels: ConfiguredLevel
) {
  if (!loggedIn) return true;
  return ![BloomDimension.Remember, BloomDimension.Understand].some(
    (dim) =>
      smileyToLevel(card[dim]) > (levels[dim] === undefined ? 2 : levels[dim])
  );
}

function getChapterCounts(
  levels: ConfiguredLevel,
  loggedIn: boolean,
  cards?: CardsWithSmileys[]
): {
  chapter: string;
  totalCount: number;
  selectedCards: CardsWithSmileys[];
}[] {
  if (!cards) return [];
  const counts: {
    chapter: string;
    totalCount: number;
    selectedCards: CardsWithSmileys[];
  }[] = [];
  for (const card of cards) {
    const chapter = card.instances[0].chapter;

    const selected = cardMeetsLevelReqs(card, loggedIn, levels);
    const idx = counts.findIndex((v) => v.chapter === chapter);
    if (idx === -1) {
      counts.push({
        chapter,
        totalCount: 1,
        selectedCards: selected ? [card] : [],
      });
    } else {
      counts[idx].totalCount++;
      if (selected) counts[idx].selectedCards.push(card);
    }
  }
  return counts;
}

function getUpdatedConfigLevel(
  existing: ConfiguredLevel,
  dim: BloomDimension,
  newValue?: SmileyLevel
): ConfiguredLevel {
  return { ...existing, [dim]: newValue };
}

export interface ConfiguredLevel {
  Remember?: SmileyLevel;
  Understand?: SmileyLevel;
}

function LevelConfigurator({
  levels,
  setLevels,
}: {
  levels: ConfiguredLevel;
  setLevels: Dispatch<SetStateAction<ConfiguredLevel>>;
}) {
  return (
    <>
      <Tooltip title="Choose the competency levels (estimated by the learner model) up to which cards should be included into the card stack">
        <Typography variant="h6" style={{ textAlign: 'center' }}>
          Choose competency levels
        </Typography>
      </Tooltip>
      <i style={{ color: 'gray' }}>
        The selection will put all cards up to the chosen competency level onto
        the stack.
      </i>
      {[BloomDimension.Remember, BloomDimension.Understand].map((dim, idx) => (
        <Box
          key={dim}
          display="flex"
          width="220px"
          m="0 auto 10px"
          alignItems="center"
          p="0 20px 20px 0"
          borderBottom={idx === 0 ? '1px solid #DDD' : undefined}
        >
          <Tooltip title={`I ${dim}. Click to enable/disable filter.`}>
            <IconButton
              onClick={() => {
                setLevels((prev) => {
                  const newVal = levels[dim] === undefined ? 2 : undefined;
                  return getUpdatedConfigLevel(prev, dim, newVal);
                });
              }}
            >
              <DimIcon showTitle={false} dim={dim} white={false} />
            </IconButton>
          </Tooltip>
          <Slider
            step={1}
            value={levels[dim] === undefined ? 2 : levels[dim]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => {
              return SMILEY_TOOLTIPS[dim][value];
            }}
            onChange={(_e: Event, newValue: SmileyLevel) => {
              setLevels((prev) => getUpdatedConfigLevel(prev, dim, newValue));
            }}
            marks={getMarks(dim, levels.Remember, levels.Understand)}
            min={-2}
            max={2}
            sx={{
              ml: '20px',
              filter: levels[dim] === undefined ? 'grayscale(1)' : undefined,
            }}
            disabled={levels[dim] === undefined}
          />
        </Box>
      ))}
    </>
  );
}

function CoverageConfigurator({
  chapterCounts,
  checkedChapterIdxs,
  levels,
  setCheckedChapterIdxs,
  startSingleChapter,
}: {
  chapterCounts: {
    chapter: string;
    totalCount: number;
    selectedCards: CardsWithSmileys[];
  }[];
  checkedChapterIdxs: number[];
  levels: ConfiguredLevel;
  setCheckedChapterIdxs: Dispatch<SetStateAction<number[]>>;
  startSingleChapter: (chapterIdx: number, mode: FlashCardMode) => void;
}) {
  const handleToggle = (value: number) => () => {
    const currentIndex = checkedChapterIdxs.indexOf(value);
    const newChecked = [...checkedChapterIdxs];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setCheckedChapterIdxs(newChecked);
  };
  const loggedIn = isLoggedIn();

  return (
    <>
      <Tooltip title="Choose the cards in the stack by course chapters">
        <Typography variant="h6" style={{ textAlign: 'center' }}>
          Choose the coverage
        </Typography>
      </Tooltip>
      <List sx={{ bgcolor: 'background.paper' }}>
        {chapterCounts.map(({ chapter, totalCount, selectedCards }, idx) => {
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
                    checked={checkedChapterIdxs.indexOf(idx) !== -1}
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
                      <b style={{ color: SECONDARY_COL }}>
                        {loggedIn && selectedCards.length + '/'}
                        {totalCount} Concepts
                      </b>
                    </Box>
                  }
                />

                <Box display="flex" alignItems="center" gap="5px 10px">
                  <Button
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      startSingleChapter(idx, FlashCardMode.REVISION_MODE);
                    }}
                  >
                    Revise
                  </Button>
                  {loggedIn && (
                    <Button
                      size="small"
                      sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        startSingleChapter(idx, FlashCardMode.DRILL_MODE);
                      }}
                    >
                      Drill
                    </Button>
                  )}
                </Box>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
function ReviseAndDrillButtons({
  selectedCards,
  start,
}: {
  selectedCards: CardsWithSmileys[];
  start: (mode: FlashCardMode) => void;
}) {
  const loggedIn = isLoggedIn();
  const isDisabled = selectedCards.length === 0;

  return (
    <Box>
      <Box display="flex" gap="10px" justifyContent="center" m="20px 0 5px">
        <Button
          variant="contained"
          disabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation();
            start(FlashCardMode.REVISION_MODE);
          }}
        >
          Revise
        </Button>
        {loggedIn && (
          <Button
            variant="contained"
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              start(FlashCardMode.DRILL_MODE);
            }}
          >
            Drill
          </Button>
        )}
      </Box>

      <b
        style={{
          color: SECONDARY_COL,
          textAlign: 'center',
          display: 'block',
          fontFamily: "'Roboto'",
        }}
      >
        {selectedCards.length} cards selected
      </b>
    </Box>
  );
}
export function DrillConfigurator({ courseId }: { courseId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [courseCards, setCourseCards] = useState<
    CardsWithSmileys[] | undefined
  >(undefined);

  const [levels, setLevels] = useState<ConfiguredLevel>({
    Remember: 2,
    Understand: 2,
  });
  const [checkedChapterIdxs, setCheckedChapterIdxs] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState(FlashCardMode.REVISION_MODE);

  const loggedIn = isLoggedIn();

  const chapterCounts = getChapterCounts(levels, loggedIn, courseCards);
  const selectedChapters = checkedChapterIdxs.map(
    (idx) => chapterCounts[idx].chapter
  );
  const selectedCards = chapterCounts
    .filter((chap) => selectedChapters.includes(chap.chapter))
    .map((v) => v.selectedCards)
    .flat(1);

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
    <Box mt="15px">
      <Typography variant="h5" style={{ textAlign: 'center' }}>
        Configure your flash card stack for drilling/revising!
      </Typography>

      <br />
      <Box
        display="flex"
        gap="10px"
        flexWrap="wrap"
        justifyContent="center"
        flexDirection="row-reverse"
      >
        <Box zIndex={1} maxWidth="250px">
          {loggedIn && (
            <LevelConfigurator levels={levels} setLevels={setLevels} />
          )}
          <ReviseAndDrillButtons
            selectedCards={selectedCards}
            start={(mode) => {
              setMode(mode);
              setStarted(true);
            }}
          />
        </Box>
        <Box flex="1 1 400px" maxWidth="600px">
          <CoverageConfigurator
            chapterCounts={chapterCounts}
            checkedChapterIdxs={checkedChapterIdxs}
            levels={levels}
            setCheckedChapterIdxs={setCheckedChapterIdxs}
            startSingleChapter={(idx, mode) => {
              setCheckedChapterIdxs([idx]);
              setMode(mode);
              setStarted(true);
            }}
          />
        </Box>
      </Box>
      <ReviseAndDrillButtons
        selectedCards={selectedCards}
        start={(mode) => {
          setMode(mode);
          setStarted(true);
        }}
      />
    </Box>
  );
}
