import ListIcon from '@mui/icons-material/List';
import {
  Box,
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
import { getOuterHTML } from 'domutils';
import { parseDocument } from 'htmlparser2';
import { useEffect, useRef, useState } from 'react';
import { PARSER_BASE_URL } from './mmtParser';
import styles from './stex-react-renderer.module.scss';

const NAV_MENU_ID = 'list-container';
const EXPANSION_BOX_ID = 'expansion-box';

const W = typeof window === 'undefined' ? undefined : window;
export interface TourItem {
  uri: string;
  header: string;
  hash: string;
}

function navMenuItemId(item: TourItem) {
  return `nav-${item.hash}`;
}

function expandedItemId(item: TourItem) {
  return `expand-${item.hash}`;
}

export default function useOnScreen(ref: any) {
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

function TourItemDisplay({
  item,
  lang = 'en',
  visibilityUpdate,
}: {
  item: TourItem;
  lang?: string;
  visibilityUpdate: (a: boolean) => void;
}) {
  const ref = useRef();
  const isVisible = useOnScreen(ref);
  useEffect(() => {
    visibilityUpdate(isVisible);
  }, [isVisible]);
  return (
    <Box id={expandedItemId(item)} maxWidth="600px" ref={ref}>
      <h3>{mmtHTMLToReact(item.header)}</h3>
      <ContentFromUrl
        url={`${PARSER_BASE_URL}/:vollki/frag?path=${item.uri}&lang=${lang}`}
        skipSidebar={true}
      />
      <Divider />
    </Box>
  );
}

function filterByName(nodes: any[], name: string): any[] {
  return nodes.filter((node) => (node as any).name === name);
}

function getTourItems(tourResponse: string) {
  const tourItems: TourItem[] = [];
  const items = parseDocument(tourResponse).children;
  const trNodes = filterByName(items, 'tr');
  for (const trNode of trNodes) {
    const tdNode = filterByName((trNode as any).childNodes, 'td')[0];
    const aNode = filterByName((tdNode as any).childNodes, 'a')[0];
    const header = getOuterHTML(aNode.childNodes[0].childNodes[1]);
    const href: string = aNode.attribs?.href?.substring();
    const uri = href.substring(21, href.length - 2);
    tourItems.push({ uri, header, hash: simpleHash(uri) });
  }
  return tourItems;
}

function listItemText(item: TourItem, isIntersecting: boolean) {
  const header = mmtHTMLToReact(item.header);
  return isIntersecting ? <b>{header}</b> : header;
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
    <List id={NAV_MENU_ID} sx={{ overflowY: 'scroll', width: '250px' }}>
      {items.map((item) => (
        <ListItem
          disablePadding
          id={navMenuItemId(item)}
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            const container = document.getElementById(EXPANSION_BOX_ID);
            const displayItem = document.getElementById(expandedItemId(item));
            if (!container || !displayItem) return;
            container.scrollTop = displayItem.offsetTop - container.offsetTop;
          }}
        >
          <ListItemText
            sx={{ mx: '10px' }}
            primary={listItemText(item, itemVisibility[item.hash])}
          />
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
  userModel,
  language = 'en',
}: {
  tourId: string;
  userModel: string;
  language?: string;
}) {
  const [items, setItems] = useState([] as TourItem[]);
  // Object to hold each item's current visibility. Keys are hashes of the item's uri.
  const [itemVisibility, setItemVisibility] = useState<{
    [hash: string]: boolean;
  }>({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [windowSize, setWindowSize] = useState(0);

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
    const tourInfoUrl = `${PARSER_BASE_URL}/:vollki/tour?path=${tourId}&user=${userModel}&lang=${language}`;
    setFetchingItems(true);
    axios.get(tourInfoUrl).then((r) => {
      setFetchingItems(false);
      setItems(getTourItems(r.data));
    });
  }, [tourId, userModel, language]);

  useEffect(() => {
    scrollNavToShowVisibleItems(items, itemVisibility);
  }, [itemVisibility]);

  if (fetchingItems) return <CircularProgress />;
  if (!items?.length) return null;

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
              <NavBar items={items} itemVisibility={itemVisibility} />
            </Drawer>
          ) : (
            <Box sx={{ position: 'fixed', bottom: `20px`, left: '5px' }}>
              <IconButton
                className={styles['nav-bar-button']}
                onClick={() => setShowDashboard(true)}
              >
                <ListIcon />
              </IconButton>
            </Box>
          )}
        </>
      )}

      <Box display="flex" maxHeight="calc(100vh - 190px)" overflow="hidden">
        {showSidePanel && (
          <NavBar items={items} itemVisibility={itemVisibility} />
        )}
        <Box id={EXPANSION_BOX_ID} sx={{ overflowY: 'scroll' }} flexGrow={1}>
          <Box mx="10px">
            {items.map((item) => (
              <TourItemDisplay
                key={item.hash}
                item={item}
                lang={language}
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
