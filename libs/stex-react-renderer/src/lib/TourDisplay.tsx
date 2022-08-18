import ListIcon from '@mui/icons-material/List';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
  ContentFromUrl,
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';
import { simpleHash } from '@stex-react/utils';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { PARSER_BASE_URL } from './mmtParser';
import styles from './styles/tour-display.module.scss';

const NAV_MENU_ID = 'list-container';
const EXPANSION_BOX_ID = 'expansion-box';

const W = typeof window === 'undefined' ? undefined : window;
export interface TourItem {
  uri: string;
  header: string;
  hash: string;
  dependencies: string[];
  successors: string[];
  level: number;
  weight: number;
}

function navMenuItemId(item: TourItem) {
  return `nav-${item.hash}`;
}

function expandedItemId(item: TourItem) {
  return `expand-${item.hash}`;
}

function useOnScreen(ref: any) {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = new IntersectionObserver(([entry]) =>
    setIntersecting(entry.isIntersecting)
  );

  useEffect(() => {
    observer.observe(ref.current);
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, []);

  return isIntersecting;
}

function scrollToItem(item: TourItem) {
  const container = document.getElementById(EXPANSION_BOX_ID);
  const displayItem = document.getElementById(expandedItemId(item));
  if (!container || !displayItem) return;
  container.scrollTop = displayItem.offsetTop - container.offsetTop;
}

function getSuccessorChain(item: TourItem, allItemsMap: Map<string, TourItem>) {
  const succChain: string[] = [];
  let succ: TourItem | undefined = item;
  while (succ) {
    succChain.push(succ.uri);
    succ = allItemsMap.get(succ.successors?.[0]);
  }
  return succChain;
}

function ItemBreadcrumbs({
  item,
  allItemsMap,
  addToTempShowUri,
}: {
  item: TourItem;
  allItemsMap: Map<string, TourItem>;
  addToTempShowUri: (uri: string) => void;
}) {
  const succChain = getSuccessorChain(item, allItemsMap);
  return (
    <>
      <ul className={styles['steps']}>
        {/* The box below gives the blur effect in case the breadcrumbs go over one line */}
        <Box className={styles['steps-blur']}></Box>
        {succChain.map((uri) => {
          const item = allItemsMap.get(uri);
          if (!item) return null;
          return (
            <li key={uri} onClick={() => scrollToItem(item)}>
              <a>{mmtHTMLToReact(item.header)}</a>
            </li>
          );
        })}
      </ul>
      {!!item.dependencies.length && (
        <Box display="flex" alignItems="center" flexWrap="wrap">
          Needs:&nbsp;
          {item.dependencies.map((depUri) => {
            const dep = allItemsMap.get(depUri);
            if (!dep) return null;
            return (
              <Button
                size="small"
                key={depUri}
                variant="outlined"
                sx={{ m: '0 2px 2px 4px', textTransform: 'none', p: '0px 8px' }}
                onClick={() => {
                  addToTempShowUri(depUri);
                  scrollToItem(dep);
                }}
              >
                {mmtHTMLToReact(dep.header)}
              </Button>
            );
          })}
        </Box>
      )}
    </>
  );
}

function TourItemDisplay({
  item,
  allItemsMap,
  isTempShow,
  lang = 'en',
  visibilityUpdate,
  onUnderstood,
  onMoreDetails,
  onHideTemp,
  addToTempShowUri,
}: {
  item: TourItem;
  allItemsMap: Map<string, TourItem>;
  isTempShow: boolean;
  lang?: string;
  visibilityUpdate: (a: boolean) => void;
  onUnderstood: () => void;
  onMoreDetails: () => void;
  onHideTemp: () => void;
  addToTempShowUri: (uri: string) => void;
}) {
  const ref = useRef();
  const isVisible = useOnScreen(ref);
  useEffect(() => {
    visibilityUpdate(isVisible);
  }, [isVisible]);

  return (
    <Box id={expandedItemId(item)} maxWidth="600px" ref={ref}>
      <Box
        display="flex"
        alignItems="center"
        mt="15px"
        mb="5px"
        justifyContent="space-between"
      >
        <h3 style={{ margin: 0 }}>{mmtHTMLToReact(item.header)}</h3>
        <Box mx="10px" height="30px" sx={{ whiteSpace: 'nowrap' }}>
          {!isTempShow ? (
            <Button
              size="small"
              onClick={() => onUnderstood()}
              variant="outlined"
            >
              I understand
            </Button>
          ) : (
            <Button
              size="small"
              onClick={() => onHideTemp()}
              variant="outlined"
              sx={{ mr: '10px' }}
            >
              Hide
            </Button>
          )}
          {/*
              <Button
                size="small"
                onClick={() => onMoreDetails()}
                variant="outlined"
              >
                More Details
          </Button>*/}
        </Box>
      </Box>
      <ItemBreadcrumbs
        item={item}
        allItemsMap={allItemsMap}
        addToTempShowUri={addToTempShowUri}
      />
      <Box sx={{ mt: '20px' }}>
        <ContentFromUrl
          url={`${PARSER_BASE_URL}/:vollki/frag?path=${item.uri}&lang=${lang}`}
          skipSidebar={true}
        />
      </Box>

      <Divider />
    </Box>
  );
}

export interface TourAPIEntry {
  id: string;
  title: string;
  successors: string[];
}

function computeOrderedList(
  tourItems: Map<string, TourItem>,
  understoodUri: string[],
  tempShowUri: string[],
  currentId: string,
  level: number,
  orderedList: TourItem[],
  addOnlyTemp: boolean
): void {
  const deps = tourItems.get(currentId)?.dependencies || [];
  const alreadyPreset = orderedList.some((item) => item.uri === currentId);
  if (alreadyPreset) return;
  const isUnderstood = understoodUri.includes(currentId);

  for (const d of deps) {
    computeOrderedList(
      tourItems,
      understoodUri,
      tempShowUri,
      d,
      level + 1,
      orderedList,
      addOnlyTemp || isUnderstood
    );
  }
  if ((!isUnderstood && !addOnlyTemp) || tempShowUri.includes(currentId)) {
    const currentItem = tourItems.get(currentId);
    if (!currentItem) {
      console.log('Not possible');
      return;
    }
    currentItem.level = level;
    orderedList.push(currentItem);
  }
}

function getTourItemMap(tourAPIEntries: TourAPIEntry[], weights: number[]) {
  const tourItems: Map<string, TourItem> = new Map();
  for (const [idx, entry] of tourAPIEntries.entries()) {
    tourItems.set(entry.id, {
      uri: entry.id,
      header: entry.title,
      hash: simpleHash(entry.id),
      dependencies: [],
      successors: entry.successors,
      level: 0,
      weight: weights[idx],
    });
  }
  for (const n of tourAPIEntries) {
    for (const s of n.successors) {
      tourItems.get(s)?.dependencies?.push(n.id);
    }
  }
  return tourItems;
}

function getDisplayItemList(
  tourItemMap: Map<string, TourItem>,
  understoodUri: string[],
  tempShowUri: string[]
): TourItem[] {
  const rootItem = Array.from(tourItemMap.values()).find(
    (item) => !item.successors?.length
  );
  if (!rootItem) return [];

  if (understoodUri.includes(rootItem.uri)) {
    return [rootItem];
  }
  const orderedList: TourItem[] = [];
  computeOrderedList(
    tourItemMap,
    understoodUri,
    tempShowUri,
    rootItem.uri,
    0,
    orderedList,
    false
  );
  return orderedList;
}

function listItemText(item: TourItem, isIntersecting: boolean) {
  const header = mmtHTMLToReact(item.header);
  return <Box>{isIntersecting ? <b>{header}</b> : header}</Box>;
}

function LeftGuide({ children, level }: { children: any; level: number }) {
  return (
    <Box display="flex">
      {Array(level)
        .fill(0)
        .map((_, idx) => (
          <Box
            display="inline"
            key={idx}
            sx={{ ml: `10px`, borderLeft: '1px solid #BBB' }}
          ></Box>
        ))}
      <Box display="flex" p="0" alignItems="center">
        <span
          style={{
            color: '#BBB',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            marginRight: '1px',
            display: 'inline',
          }}
        >
          {level !== 0 && '--'}
        </span>
        <Box
          sx={{
            px: '4px',
            py: '2px',
            mb: '4px',
            border: '1px solid #BBB',
            borderRadius: '5px',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export function NavBar({
  items,
  itemVisibility,
}: {
  items: TourItem[];
  itemVisibility: any;
}) {
  useEffect(() => {
    scrollNavToShowVisibleItems(items, itemVisibility);
  }, [items]);

  return (
    <List id={NAV_MENU_ID}>
      {items.map((item) => (
        <ListItem
          disablePadding
          key={item.hash}
          id={navMenuItemId(item)}
          sx={{ cursor: 'pointer' }}
          onClick={() => scrollToItem(item)}
        >
          <Box sx={{ mx: '10px' }}>
            <LeftGuide level={item.level}>
              <ListItemText
                sx={{ m: '0' }}
                primary={listItemText(item, itemVisibility[item.hash])}
              />
            </LeftGuide>
          </Box>
        </ListItem>
      ))}
    </List>
  );
}

function scrollNavToShowVisibleItems(
  items: TourItem[],
  itemVisibility: { [hash: string]: boolean }
) {
  const idx = items.findIndex((item) => itemVisibility[item.hash]);
  if (idx < 0) return;
  const container = document.getElementById(NAV_MENU_ID);
  const displayItem = document.getElementById(
    navMenuItemId(items[idx > 0 ? idx - 1 : idx])
  );
  if (!container || !displayItem) return;
  container.scrollTop = displayItem.offsetTop;
}

export function TourDisplay({
  tourId,
  language = 'en',
  getUriWeights = (uri: string[]) =>
    Promise.resolve(new Array(uri.length).fill(0)),
  setUriWeights = (_) => Promise.resolve(),
}: {
  tourId: string;
  language?: string;
  getUriWeights?: (uri: string[]) => Promise<number[]>;
  setUriWeights?: (uriData: { [uri: string]: number }) => Promise<void>;
}) {
  const [allItemsMap, setAllItemsMap] = useState(new Map<string, TourItem>());
  const [displayItemList, setDisplayItemList] = useState([] as TourItem[]);
  // Object to hold each item's current visibility. Keys are hashes of the item's uri.
  const [itemVisibility, setItemVisibility] = useState<{
    [hash: string]: boolean;
  }>({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [windowSize, setWindowSize] = useState(0);
  const [understoodUri, setUnderstoodUriList] = useState([] as string[]);
  const [tempShowUri, setTempShowUri] = useState([] as string[]);

  useEffect(() => {
    function handleResize() {
      setWindowSize(W?.innerWidth || 0);
    }
    setWindowSize(W?.innerWidth || 0);
    W?.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!tourId?.length) return;
    // https://mmt.beta.vollki.kwarc.info/:vollki/tour?path=http://mathhub.info/sTeX/Algebra/General/mod/props?Absorption&user=nulluser&lang=en
    const tourInfoUrl = `${PARSER_BASE_URL}/:vollki/tour?path=${tourId}&user=nulluser&lang=${language}`;
    setFetchingItems(true);
    axios.get(tourInfoUrl).then((r) => {
      setFetchingItems(false);
      const apiEntries: TourAPIEntry[] = r.data;
      const tourUris = apiEntries.map((e) => e.id);
      getUriWeights(tourUris).then((weights) => {
        const understood = [];
        for (const [idx, w] of weights.entries()) {
          weights[idx] = +w;
        }
        for (const [idx, weight] of weights.entries()) {
          if (weight > 0.5) {
            understood.push(tourUris[idx]);
          }
        }
        setUnderstoodUriList(understood);
        setAllItemsMap(getTourItemMap(apiEntries, weights));
      });
    });
  }, [tourId, language]);

  useEffect(() => {
    setDisplayItemList(
      getDisplayItemList(allItemsMap, understoodUri, tempShowUri)
    );
  }, [allItemsMap, understoodUri, tempShowUri]);

  useEffect(() => {
    scrollNavToShowVisibleItems(displayItemList, itemVisibility);
  }, [itemVisibility]);

  function addToUnderstoodList(uri: string) {
    setUnderstoodUriList((previous) => {
      if (previous.includes(uri)) return previous;
      return [...previous, uri];
    });
    setUriWeights({ [uri]: 1 }).then(console.log);
    const item = allItemsMap.get(uri);
    if (item) item.weight = 1;
  }
  function removeFromUnderstoodList(uri: string) {
    setUnderstoodUriList((previous) => previous.filter((u) => u !== uri));
    setUriWeights({ [uri]: 0.0 }).then(console.log);
    const item = allItemsMap.get(uri);
    if (item) item.weight = 0;
  }

  function addToTempShowUri(uri: string) {
    setTempShowUri((previous) => {
      if (previous.includes(uri)) return previous;
      return [...previous, uri];
    });
  }

  function removeFromTempShowUri(uri: string) {
    setTempShowUri((previous) => previous.filter((u) => u !== uri));
  }

  if (fetchingItems) return <CircularProgress />;
  if (!displayItemList?.length) return null;

  const showSidePanel = windowSize >= 650;
  return (
    <>
      {!showSidePanel && (
        <>
          {showDashboard ? (
            <Drawer
              anchor="left"
              open={showDashboard}
              onClose={() => setShowDashboard(false)}
            >
              <NavBar items={displayItemList} itemVisibility={itemVisibility} />
            </Drawer>
          ) : (
            <Box
              sx={{
                position: 'fixed',
                bottom: `20px`,
                left: '5px',
                zIndex: 1000,
              }}
            >
              <IconButton
                sx={{
                  border: '2px solid #3f51b5',
                  borderRadius: '500px',
                  color: '#3f51b5',
                  backgroundColor: 'white',
                  boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.3s ease 0s',
                  ':hover': {
                    boxShadow: '0px 15px 20px rgba(0, 0, 0, 0.4)',
                    transform: 'translateY(1px)',
                    backgroundColor: 'white',
                  },
                }}
                onClick={() => setShowDashboard(true)}
              >
                <ListIcon />
              </IconButton>
            </Box>
          )}
        </>
      )}

      <Box display="flex" maxHeight="calc(100vh - 125px)" overflow="hidden">
        {showSidePanel && (
          <Box
            maxWidth="325px"
            flexGrow={1}
            flexBasis="300px"
            sx={{ overflowY: 'scroll' }}
          >
            <NavBar items={displayItemList} itemVisibility={itemVisibility} />
          </Box>
        )}
        <Box
          id={EXPANSION_BOX_ID}
          sx={{ overflowY: 'scroll' }}
          flexGrow={1}
          flexBasis="600px"
        >
          <Box mx="10px">
            {displayItemList.map((item) => (
              <TourItemDisplay
                key={item.hash}
                item={item}
                allItemsMap={allItemsMap}
                lang={language}
                isTempShow={tempShowUri.includes(item.uri)}
                onUnderstood={() => addToUnderstoodList(item.uri)}
                onMoreDetails={() => removeFromUnderstoodList(item.uri)}
                onHideTemp={() => removeFromTempShowUri(item.uri)}
                addToTempShowUri={addToTempShowUri}
                visibilityUpdate={(visibility) => {
                  setItemVisibility((prev) => {
                    const newV = { ...prev };
                    newV[item.hash] = visibility;
                    return newV;
                  });
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
