import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { IndexNode } from './collectIndexInfo';
import { RendererDisplayOptions } from './RendererDisplayOptions';
import UnfoldLessDoubleIcon from '@mui/icons-material/UnfoldLessDouble';
import UnfoldMoreDoubleIcon from '@mui/icons-material/UnfoldMoreDouble';
import styles from './stex-react-renderer.module.scss';
import { FixedPositionMenu } from './LayoutWithFixedMenu';
import {
  convertHtmlStringToPlain,
  fileLocToString,
  getSectionInfo,
  localStore,
  simpleHash,
} from '@stex-react/utils';
import { mmtHTMLToReact, ServerLinksContext } from './stex-react-renderer';
import axios from 'axios';
import { getChildren } from 'domutils';

function applyFilter(
  node?: IndexNode,
  searchTerms?: string[]
): IndexNode | undefined {
  if (!node || !searchTerms?.length) return node;
  const newChildren = new Map<string, IndexNode>();
  for (const [key, childNode] of node.childNodes.entries()) {
    const newChild = applyFilter(childNode, searchTerms);
    if (newChild) newChildren.set(key, newChild);
  }
  const matchesThisNode = searchTerms.some((term) =>
    node.title.toLowerCase().includes(term)
  );
  if (newChildren.size === 0 && !matchesThisNode) {
    return undefined;
  }
  return {
    hash: node.hash,
    parentNode: node.parentNode,
    childNodes: newChildren,
    title: node.title,
  };
}

function RenderTree({
  node,
  level,
  defaultOpen,
}: {
  node: IndexNode;
  level: number;
  defaultOpen: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const itemClassName =
    level === 0 ? styles['level0_dashboard_item'] : styles['dashboard_item'];
  return (
    <Box key={node.hash} sx={{ my: '6px' }}>
      <Box display="flex" ml={node.childNodes.size > 0 ? undefined : '23px'}>
        {node.childNodes.size > 0 && (
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
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            const paths: string[] = [];
            for (let n: IndexNode | undefined = node; n; n = n.parentNode) {
              if (n.hash) paths.push(n.hash);
            }
            if (router) {
              const inDocPath = paths.reverse().join('.');
              const fileId = router.query['id'];
              localStore?.setItem(`inDocPath-${fileId}`, inDocPath);
              router.query['inDocPath'] = inDocPath;
              router.push(router);
            }
          }}
        >
          {convertHtmlStringToPlain(node.title)}
        </span>
      </Box>
      {isOpen && node.childNodes.size > 0 && (
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
            {Array.from(node.childNodes.values()).map((child) => (
              <RenderTree
                node={child}
                level={level + 1}
                defaultOpen={defaultOpen}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

interface SectionsAPIData {
  archive?: string;
  filepath?: string;

  title?: string;
  id?: string;

  ids?: string[];
  children: SectionsAPIData[];
}

function getTitle(nodes: SectionsAPIData[]): string {
  for (const node of nodes) {
    if (node.title) return node.title;
    const sub = getTitle(node.children);
    if (sub) return sub;
  }
  return 'NOT FOUND';
}

function getDocumentTree(
  data: SectionsAPIData,
  level: number,
  parentNode?: IndexNode
): IndexNode[] | IndexNode {
  const { archive, filepath, children } = data;
  const isFileNode = archive && filepath;
  if (isFileNode) {
    const hash = simpleHash(fileLocToString({ archive, filepath }));
    const t = getTitle(data.children);
    const childNodes = new Map<string, IndexNode>();
    const node = {
      hash,
      parentNode,
      title: t,
      childNodes,
    };
    (children || []).forEach((c) => {
      const cNodes = getDocumentTree(c, level, node);
      if (Array.isArray(cNodes)) {
        for (const n of cNodes) childNodes.set(n.hash, n);
      } else {
        childNodes.set(cNodes.hash, cNodes);
      }
    });
    return node;
  }
  const subNodes: IndexNode[] = [];
  for (const c of children) {
    const cNodes = getDocumentTree(c, level, parentNode);
    if (Array.isArray(cNodes)) subNodes.push(...cNodes);
    else subNodes.push(cNodes);
  }
  return subNodes;
}

export function ContentDashboard({
  onClose,
  contentUrl,
}: {
  onClose: () => void;
  contentUrl: string;
}) {
  const [filterStr, setFilterStr] = useState('');
  const [defaultOpen, setDefaultOpen] = useState(true);
  const [dashInfo, setDashInfo] = useState<IndexNode | undefined>(undefined);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    async function getIndex() {
      const { archive, filepath } = getSectionInfo(contentUrl);
      const resp = await axios.get(
        `${mmtUrl}/:sTeX/sections?archive=${archive}&filepath=${filepath}`
      );
      const root = getDocumentTree(resp.data, 0, undefined);
      if (!Array.isArray(root)) setDashInfo(root);
      console.log(root);
    }
    getIndex();
  }, [mmtUrl, contentUrl]);

  const rootPage = applyFilter(
    dashInfo,
    filterStr
      .toLowerCase()
      .split(' ')
      .map((s) => s.trim())
      .filter((t) => !!t?.length)
  );

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
              label="Search"
              value={filterStr}
              onChange={(e) => setFilterStr(e.target.value)}
              sx={{ mx: '5px', width: '100%' }}
              size="small"
            />
          </Box>
          <Box display="flex" justifyContent="space-between" m="5px 10px">
            <Tooltip title="Expand/collapse all">
              <IconButton
                onClick={() => setDefaultOpen((v) => !v)}
                sx={{ border: '1px solid #CCC', borderRadius: '40px' }}
              >
                {defaultOpen ? (
                  <UnfoldLessDoubleIcon />
                ) : (
                  <UnfoldMoreDoubleIcon />
                )}
              </IconButton>
            </Tooltip>
            <RendererDisplayOptions />
          </Box>
        </>
      }
    >
      {Array.from(rootPage?.childNodes?.values() || []).map((child) => (
        <RenderTree node={child} level={0} defaultOpen={defaultOpen} />
      ))}
    </FixedPositionMenu>
  );
}
