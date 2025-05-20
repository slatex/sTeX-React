import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import UnfoldLessDoubleIcon from '@mui/icons-material/UnfoldLessDouble';
import UnfoldMoreDoubleIcon from '@mui/icons-material/UnfoldMoreDouble';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import { TOCElem } from '@stex-react/api';
import { convertHtmlStringToPlain, CoverageTimeline, PRIMARY_COL } from '@stex-react/utils';
import axios from 'axios';
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
}

function fillCoverage(node: SectionTreeNode, coveredSectionUris: string[]) {
  if (!node || node.tocElem.type !== 'Section') return;
  for (const child of node.children) {
    fillCoverage(child, coveredSectionUris);
  }
  if (node.tocElem?.uri && coveredSectionUris.includes(node.tocElem.uri)) {
    node.isCovered = true;
  }
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

function RenderTree({
  node,
  level,
  defaultOpen,
  selectedSection,
  preAdornment,
  onSectionClick,
}: {
  node: SectionTreeNode;
  level: number;
  defaultOpen: boolean;
  selectedSection: string;
  preAdornment?: (sectionId: string) => JSX.Element;
  onSectionClick?: (sectionId: string, sectionUri: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const itemClassName = level === 0 ? styles['level0_dashboard_item'] : styles['dashboard_item'];
  const isSelected = selectedSection === node.tocElem.id;
  return (
    <Box
      key={(node.tocElem as any).id}
      sx={{
        py: '6px',
        backgroundColor: node.isCovered ? '#FFB' : undefined,
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
          {convertHtmlStringToPlain(node.tocElem.title || 'Untitled')}
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

/*export function getCoveredSections(
  startSecUri: string | undefined,
  endSecUri: string,
  elem: TOCElem | undefined,
  started = false
): {
  started: boolean;
  ended: boolean;
  fullyCovered: boolean;
  coveredSectionUris: string[];
} {
  const wasStartedForMe = started;
  if (!elem) return { started, ended: true, coveredSectionUris: [], fullyCovered: false };

  const isSec = elem.type === 'Section';
  let iAmEnding = false;
  if (isSec) {
    const sectionUri = elem.uri;
    if (sectionUri === startSecUri) started = true;
    iAmEnding = sectionUri === endSecUri;
  }

  let allChildrenCovered = true;
  const coveredSectionUris: string[] = [];
  const children = 'children' in elem ? elem.children : [];
  for (const child of children) {
    const cResp = getCoveredSections(startSecUri, endSecUri, child, started);
    if (!cResp.fullyCovered) allChildrenCovered = false;
    coveredSectionUris.push(...cResp.coveredSectionUris);

    if (cResp.started) started = true;
    if (cResp.ended) {
      return {
        started,
        ended: true,
        fullyCovered: false,
        coveredSectionUris: coveredSectionUris,
      };
    }
  }

  const fullyCovered = allChildrenCovered && wasStartedForMe;
  if (isSec && elem.uri && fullyCovered) coveredSectionUris.push(elem.uri);
  return { started, ended: iAmEnding, fullyCovered, coveredSectionUris: coveredSectionUris };
}*/

export function ContentDashboard({
  toc,
  selectedSection,
  courseId,
  coveredSectionIds = undefined,
  preAdornment,
  onClose,
  onSectionClick,
}: {
  toc: TOCElem[];
  selectedSection: string;
  courseId?: string;
  coveredSectionIds?: string[];
  preAdornment?: (sectionId: string) => JSX.Element;
  onClose: () => void;
  onSectionClick?: (sectionId: string, sectionUri: string) => void;
}) {
  const t = getLocaleObject(useRouter());
  const [filterStr, setFilterStr] = useState('');
  const [defaultOpen, setDefaultOpen] = useState(true);
  const [covUpdateLink, setCovUpdateLink] = useState<string | undefined>(undefined);
  const [coveredSectionUris, setCoveredSectionUris] = useState<string[]>([]);

  useEffect(() => {
    async function getCoverageInfo() {
      if (!courseId || coveredSectionIds !== undefined) return;
      const resp = await axios.get('/api/get-coverage-timeline');
      const snaps = (resp.data as CoverageTimeline)?.[courseId];
      if (!snaps?.length) return;
      const endSec = snaps[snaps.length - 1].sectionUri;
      const shadowTopLevel: TOCElem = { type: 'SkippedSection', children: toc };
      const covered = getCoveredSections(endSec, shadowTopLevel);
      console.log('sectionUris', covered);
      setCoveredSectionUris(covered);
    }
    getCoverageInfo();
  }, [courseId, coveredSectionIds, toc]);

  const firstLevelSections = useMemo(() => {
    const shadowTopLevel: SectionTreeNode = { children: [], tocElem: undefined as any };
    const topLevel = getTopLevelSections(toc, shadowTopLevel);
    shadowTopLevel.children = topLevel;
    console.log('topLevel', topLevel);
    for (const e of topLevel) fillCoverage(e, coveredSectionUris);
    return topLevel;
  }, [toc, coveredSectionUris]);

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
            {covUpdateLink?.length && (
              <a href={covUpdateLink} target="_blank" rel="noreferrer">
                <IconButton>
                  <EditIcon />
                </IconButton>
              </a>
            )}
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
          preAdornment={preAdornment}
          onSectionClick={onSectionClick}
        />
      ))}
    </FixedPositionMenu>
  );
}
