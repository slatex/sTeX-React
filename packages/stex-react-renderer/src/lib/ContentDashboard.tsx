import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import UnfoldLessDoubleIcon from '@mui/icons-material/UnfoldLessDouble';
import UnfoldMoreDoubleIcon from '@mui/icons-material/UnfoldMoreDouble';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import { TOCElem, URI } from '@stex-react/api';
import {
  convertHtmlStringToPlain,
  CoverageSnap,
  CoverageTimeline,
  PRIMARY_COL,
} from '@stex-react/utils';
import axios from 'axios';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { getLocaleObject } from './lang/utils';
import { FixedPositionMenu } from './LayoutWithFixedMenu';
import styles from './stex-react-renderer.module.scss';

interface SectionTreeNode {
  parentNode?: SectionTreeNode;
  children: SectionTreeNode[];
  tocElem: Extract<TOCElem, { type: 'Section' }>;
  isCovered?: boolean;
  lectureIdx?: number;
  started?: Date;
  ended?: Date;
}

function fillCoverage(node: SectionTreeNode, coveredSectionUris: string[]) {
  if (!node || node.tocElem.type !== 'Section') return;
  for (const child of node.children) {
    fillCoverage(child, coveredSectionUris);
  }
  if (node.tocElem?.uri && coveredSectionUris.includes(node.tocElem.uri)) {
    node.isCovered = true;
    node.lectureIdx = Math.ceil(Math.random() * 100);
  }
  // node.started = new Date();
  //node.ended = node.started
}

function getTopLevelSections(tocElems: TOCElem[], parentNode: SectionTreeNode): SectionTreeNode[] {
  return tocElems
    .map((t) => getSectionTree(t, parentNode))
    .filter(Boolean)
    .map((t) => (Array.isArray(t) ? t : [t as SectionTreeNode]))
    .flat();
}

function getSectionTree(
  tocElem: TOCElem,
  parentNode: SectionTreeNode
): SectionTreeNode | SectionTreeNode[] | undefined {
  if (tocElem.type === 'Paragraph' || tocElem.type === 'Slide') return undefined;
  const isSection = tocElem.type === 'Section';

  if (isSection) {
    const children: SectionTreeNode[] = [];
    const thisNode = {
      tocElem,
      children,
      parentNode,
    } as SectionTreeNode;
    for (const s of tocElem.children || []) {
      const subNodes = getSectionTree(s, thisNode);
      if (!subNodes) continue;
      if (Array.isArray(subNodes)) children.push(...subNodes);
      else children.push(subNodes);
    }
    return thisNode;
  } else {
    const children: SectionTreeNode[] = [];
    for (const s of tocElem.children) {
      const subNodes = getSectionTree(s, parentNode);
      if (!subNodes) continue;
      if (Array.isArray(subNodes)) children.push(...subNodes);
      else children.push(subNodes);
    }
    return children;
  }
}

function applyFilterOne(
  node?: SectionTreeNode,
  searchTerms?: string[]
): SectionTreeNode | undefined {
  if (!node || !searchTerms?.length) return node;
  const newChildren: SectionTreeNode[] = [];
  for (const childNode of node.children) {
    const newChild = applyFilterOne(childNode, searchTerms);
    if (newChild) newChildren.push(newChild);
  }
  const matchesThisNode = searchTerms.some((term) =>
    node.tocElem.title?.toLowerCase().includes(term)
  );
  if (newChildren.length === 0 && !matchesThisNode) {
    return undefined;
  }
  return {
    parentNode: node.parentNode,
    children: newChildren,
    tocElem: node.tocElem,
  };
}

function applyFilter(
  nodes?: SectionTreeNode[],
  searchTerms?: string[]
): SectionTreeNode[] | undefined {
  if (!nodes || !searchTerms?.length) return nodes;
  return nodes.map((n) => applyFilterOne(n, searchTerms)).filter((n) => n) as any;
}

function getCoverageHover(info?: SectionCoverageInfo) {
  if (!info) return '';
  const { startTime_ms, endTime_ms } = info;
  if (!startTime_ms) return 'Not yet covered';
  const startTimeDisplay = dayjs(startTime_ms).format('DD MMM');
  if (startTime_ms === endTime_ms) return `Covered: ${startTimeDisplay}`;
  if (!endTime_ms) return `Covered: ${startTimeDisplay} to -`;
  const endTimeDisplay = dayjs(endTime_ms).format('DD MMM');
  if (startTimeDisplay.substring(3, 6) === endTimeDisplay.substring(3, 6)) {
    return `Covered: ${startTimeDisplay.substring(0,2)} to ${endTimeDisplay}`;
  }
  return `Covered: ${startTimeDisplay} to ${endTimeDisplay}`;
}

function RenderTree({
  node,
  level,
  defaultOpen,
  selectedSection,
  perSectionCoverageInfo,
  preAdornment,
  onSectionClick,
}: {
  node: SectionTreeNode;
  level: number;
  defaultOpen: boolean;
  selectedSection: string;
  perSectionCoverageInfo: Record<URI, SectionCoverageInfo>;
  preAdornment?: (sectionId: string) => JSX.Element;
  onSectionClick?: (sectionId: string, sectionUri: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const itemClassName = level === 0 ? styles['level0_dashboard_item'] : styles['dashboard_item'];
  const isSelected = selectedSection === node.tocElem.id;
  const secCoverageInfo = perSectionCoverageInfo[node.tocElem.uri];
  const coverageHover = getCoverageHover(secCoverageInfo);

  return (
    <Box
      key={(node.tocElem as any).id}
      sx={{
        py: '6px',
        backgroundColor: secCoverageInfo?.endTime_ms
          ? (secCoverageInfo.lastLectureIdx ?? 0) % 2 === 0
            ? '#FFC'
            : '#FFC' //'#D1FFCC'
          : undefined,
      }}
    >
      <Box
        display="flex"
        ml={node.children.length > 0 ? undefined : '23px'}
        fontWeight={isSelected ? 'bold' : undefined}
      >
        {node.children.length > 0 && (
          <IconButton
            sx={{ color: 'gray', p: '0', mr: '3px' }}
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? (
              <IndeterminateCheckBoxOutlinedIcon sx={{ fontSize: '20px' }} />
            ) : (
              <AddBoxOutlinedIcon sx={{ fontSize: '20px' }} />
            )}
          </IconButton>
        )}
        <span
          className={itemClassName}
          style={{
            cursor: 'pointer',
            color: isSelected ? 'white' : undefined,
            padding: isSelected ? '0 3px' : undefined,
            backgroundColor: isSelected ? PRIMARY_COL : 'inherit',
            borderRadius: '3px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSectionClick?.(node.tocElem.id, node.tocElem.uri);
            return;
          }}
        >
          {preAdornment ? preAdornment(node.tocElem.id) : null}
          {coverageHover ? (
            <Tooltip title={<span style={{ fontSize: 'medium' }}>{coverageHover}</span>}>
              <span>{convertHtmlStringToPlain(node.tocElem.title || 'Untitled')}</span>
            </Tooltip>
          ) : (
            <span>{convertHtmlStringToPlain(node.tocElem.title || 'Untitled')}</span>
          )}
        </span>
      </Box>
      {isOpen && node.children.length > 0 && (
        <Box display="flex" ml="3px">
          <Box
            minWidth="12px"
            sx={{
              cursor: 'pointer',
              '&:hover *': { borderLeft: '1px solid #333' },
            }}
            onClick={() => setIsOpen((v) => !v)}
          >
            <Box width="0" m="auto" borderLeft="1px solid #CCC" height="100%">
              &nbsp;
            </Box>
          </Box>
          <Box>
            {(node.children || []).map((child) => (
              <RenderTree
                key={(child.tocElem as any).id}
                node={child}
                level={level + 1}
                defaultOpen={defaultOpen}
                perSectionCoverageInfo={perSectionCoverageInfo}
                selectedSection={selectedSection}
                preAdornment={preAdornment}
                onSectionClick={onSectionClick}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export function getCoveredSections(endSecUri: string, elem: TOCElem | undefined): string[] {
  const coveredUris: string[] = [];
  if (!elem) return coveredUris;
  if ('children' in elem && elem.children.length) {
    for (const child of elem.children) {
      coveredUris.push(...getCoveredSections(endSecUri, child));
      if (coveredUris.includes(endSecUri)) return coveredUris;
    }
  }
  if (elem.type === 'Section') coveredUris.push(elem.uri);

  return coveredUris;
}

function getOrderedSections(elem: TOCElem): [URI[], URI[]] {
  const preOrderedList: URI[] = [];
  const postOrderedList: URI[] = [];
  if (!elem) return [preOrderedList, postOrderedList];
  if (elem.type === 'Section') preOrderedList.push(elem.uri);
  if ('children' in elem && elem.children.length) {
    for (const c of elem.children) {
      const [subPreList, subPostList] = getOrderedSections(c);
      preOrderedList.push(...subPreList);
      postOrderedList.push(...subPostList);
    }
  }
  if (elem.type === 'Section') postOrderedList.push(elem.uri);
  return [preOrderedList, postOrderedList];
}

function getNextSectionInList(sectionUri?: URI, uriList?: URI[]) {
  if (!sectionUri || !uriList?.length) return undefined;
  const idx = uriList.findIndex((uri) => uri === sectionUri);
  if (idx === -1) return undefined;
  if (idx === uriList.length - 1) return undefined; // todo: cleanup
  return uriList[idx + 1];
}

function getPrevSectionInList(sectionUri?: URI, uriList?: URI[]) {
  if (!sectionUri || !uriList?.length) return undefined;
  const idx = uriList.findIndex((uri) => uri === sectionUri);
  if (idx === -1) return undefined;
  if (idx === 0) return undefined; // todo: cleanup
  return uriList[idx - 1];
}

interface SectionCoverageInfo {
  startTime_ms?: number;
  endTime_ms?: number;
  lastLectureIdx?: number;
}

function getPerSectionCoverageInfo(topLevel: TOCElem, coverageData: CoverageSnap[]) {
  const perSectionCoverageInfo: Record<URI, SectionCoverageInfo> = {};
  coverageData = coverageData?.filter((snap) => snap.sectionName);
  if (!coverageData?.length) return perSectionCoverageInfo;
  const [preOrdered, postOrdered] = getOrderedSections(topLevel);
  const firstSectionNotStarted = coverageData.map((snap) => {
    return getNextSectionInList(snap.sectionName, preOrdered);
  });

  const lastSectionCompleted = coverageData.map((snap) => {
    const isPartial = Number.isFinite(snap.slideNumber);
    if (isPartial) return getPrevSectionInList(snap.sectionName, postOrdered);
    return snap.sectionName;
  });

  console.log('coverageData', coverageData);
  console.log('preOrdered', preOrdered);
  console.log('firstSectionNotStarted', firstSectionNotStarted);
  console.log('lastSectionCompleted', lastSectionCompleted);

  let currLecIdx = 0;
  for (const secUri of preOrdered) {
    if (
      secUri ===
      'https://mathhub.info?a=courses/FAU/AI/course&p=rational-decisions/sec&d=vpi&l=en&e=section'
    ) {
      console.log('currLecIdx', currLecIdx);
      console.log('firstSectionNotStarted[currLecIdx]', firstSectionNotStarted[currLecIdx]);
      console.log('firstSectionNotStarted[currLecIdx+1]', firstSectionNotStarted[currLecIdx + 1]);
    }
    if (secUri === firstSectionNotStarted[currLecIdx]) {
      currLecIdx++;
      if (!firstSectionNotStarted[currLecIdx]) break;
    }
    const currentSnap = coverageData[currLecIdx];
    if (!currentSnap?.sectionName) break;
    perSectionCoverageInfo[secUri] = {
      startTime_ms: currentSnap.timestamp_ms,
      //lastLectureIdx: currLecIdx,
    };
  }
  currLecIdx = 0;
  for (const secUri of postOrdered) {
    if (currLecIdx >= coverageData.length) break;
    const currentSnap = coverageData[currLecIdx];
    if (!currentSnap.sectionName) break;
    perSectionCoverageInfo[secUri].endTime_ms = currentSnap.timestamp_ms;
    perSectionCoverageInfo[secUri].lastLectureIdx = currLecIdx;

    if (secUri === lastSectionCompleted[currLecIdx]) currLecIdx++;
    if (!firstSectionNotStarted[currLecIdx]) break;
  }
  console.log('perSectionCoverageInfo', perSectionCoverageInfo);
  return perSectionCoverageInfo;
}

export function ContentDashboard({
  toc,
  selectedSection,
  courseId,
  preAdornment,
  onClose,
  onSectionClick,
}: {
  toc: TOCElem[];
  selectedSection: string;
  courseId?: string;
  preAdornment?: (sectionId: string) => JSX.Element;
  onClose: () => void;
  onSectionClick?: (sectionId: string, sectionUri: string) => void;
}) {
  const t = getLocaleObject(useRouter());
  const [filterStr, setFilterStr] = useState('');
  const [defaultOpen, setDefaultOpen] = useState(true);
  const [perSectionCoverageInfo, setPerSectionCoverageInfo] = useState<
    Record<URI, SectionCoverageInfo>
  >({});

  useEffect(() => {
    async function getCoverageInfo() {
      if (!courseId || !toc?.length) return;
      const resp = await axios.get('/api/get-coverage-timeline');
      const snaps = (resp.data as CoverageTimeline)?.[courseId];
      const shadowTopLevel: TOCElem = { type: 'SkippedSection', children: toc };
      setPerSectionCoverageInfo(getPerSectionCoverageInfo(shadowTopLevel, snaps));
    }
    getCoverageInfo();
  }, [courseId, toc]);

  const firstLevelSections = useMemo(() => {
    const shadowTopLevel: SectionTreeNode = { children: [], tocElem: undefined as any };
    const topLevel = getTopLevelSections(toc, shadowTopLevel);
    shadowTopLevel.children = topLevel;
    return topLevel;
  }, [toc]);

  return (
    <FixedPositionMenu
      staticContent={
        <>
          <Box display="flex" alignItems="center" sx={{ m: '5px' }}>
            <IconButton sx={{ m: '2px' }} onClick={() => onClose()}>
              <CloseIcon />
            </IconButton>
            <TextField
              id="tree-filter-string"
              label={t.search}
              value={filterStr}
              onChange={(e) => setFilterStr(e.target.value)}
              sx={{ mx: '5px', width: '100%' }}
              size="small"
            />
          </Box>
          <Box display="flex" justifyContent="space-between" m="5px 10px">
            <Tooltip title={t.expandCollapseAll}>
              <IconButton
                onClick={() => setDefaultOpen((v) => !v)}
                sx={{ border: '1px solid #CCC', borderRadius: '40px' }}
              >
                {defaultOpen ? <UnfoldLessDoubleIcon /> : <UnfoldMoreDoubleIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </>
      }
    >
      {(firstLevelSections || []).map((child) => (
        <RenderTree
          key={(child.tocElem as any).id ?? 'skipped'}
          node={child}
          level={0}
          defaultOpen={defaultOpen}
          selectedSection={selectedSection}
          perSectionCoverageInfo={perSectionCoverageInfo}
          preAdornment={preAdornment}
          onSectionClick={onSectionClick}
        />
      ))}
    </FixedPositionMenu>
  );
}
