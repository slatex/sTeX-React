import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import UnfoldLessDoubleIcon from '@mui/icons-material/UnfoldLessDouble';
import UnfoldMoreDoubleIcon from '@mui/icons-material/UnfoldMoreDouble';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import {
  convertHtmlStringToPlain,
  createHash,
  fileLocToString,
  getSectionInfo,
  localStore,
  simpleHash,
} from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import {
  TOCFileNode,
  TOCNode,
  TOCNodeType,
  TOCSectionNode,
} from './collectIndexInfo';
import { FixedPositionMenu } from './LayoutWithFixedMenu';
import { RendererDisplayOptions } from './RendererDisplayOptions';
import { ServerLinksContext } from './stex-react-renderer';
import styles from './stex-react-renderer.module.scss';

interface SectionTreeNode {
  parentNode?: SectionTreeNode;
  children: SectionTreeNode[];
  tocNode: TOCSectionNode;
}

function getSectionTree(
  tocNode: TOCNode,
  parentNode?: SectionTreeNode
): SectionTreeNode | SectionTreeNode[] {
  const isSection = tocNode.type === TOCNodeType.SECTION;
  if (isSection) {
    const children: SectionTreeNode[] = [];
    for (const s of tocNode.childNodes.values()) {
      const subNodes = getSectionTree(s);
      if (!subNodes) continue;
      if (Array.isArray(subNodes)) children.push(...subNodes);
      else children.push(subNodes);
    }
    return { tocNode: tocNode as TOCSectionNode, children, parentNode };
  } else {
    const children: SectionTreeNode[] = [];
    for (const s of tocNode.childNodes.values()) {
      const subNodes = getSectionTree(s);
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
    node.tocNode.title.toLowerCase().includes(term)
  );
  if (newChildren.length === 0 && !matchesThisNode) {
    return undefined;
  }
  return {
    parentNode: node.parentNode,
    children: newChildren,
    tocNode: node.tocNode,
  };
}

function applyFilter(
  nodes?: SectionTreeNode[],
  searchTerms?: string[]
): SectionTreeNode[] | undefined {
  if (!nodes || !searchTerms?.length) return nodes;
  return nodes
    .map((n) => applyFilterOne(n, searchTerms))
    .filter((n) => n) as any;
}

function RenderTree({
  node,
  level,
  defaultOpen,
}: {
  node: SectionTreeNode;
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
    <Box key={node.tocNode.id} sx={{ my: '6px' }}>
      <Box display="flex" ml={node.children.length > 0 ? undefined : '23px'}>
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
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            const paths: string[] = [];
            let n: TOCNode | undefined = node.tocNode;
            while (n?.parentNode) {
              const hash = (n as any)?.hash;
              if (hash) paths.push(hash);
              console.log(hash);
              n = n.parentNode;
            }
            if (router) {
              const inDocPath =
                paths.reverse().join('.') + '~' + node.tocNode.id;
              const fileId = router.query['id'];
              localStore?.setItem(`inDocPath-${fileId}`, inDocPath);
              router.replace({query: {...router.query, inDocPath}});
            }
          }}
        >
          {convertHtmlStringToPlain(node.tocNode.title)}
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
                key={child.tocNode.id}
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

function getDocumentTree(data: SectionsAPIData, parentNode?: TOCNode): TOCNode {
  const { children, archive, filepath, id, title } = data;
  const isFileNode = archive && filepath;
  let node: TOCNode | undefined = undefined;
  const childNodes = new Map<string, TOCNode>();
  if (isFileNode) {
    const hash = createHash({ archive, filepath });
    node = {
      type: TOCNodeType.FILE,
      parentNode,
      childNodes,

      hash,
      archive,
      filepath,
    } as TOCFileNode;
  } else {
    node = {
      type: TOCNodeType.SECTION,
      parentNode,
      childNodes,

      id,
      title,
    } as TOCSectionNode;
  }

  (children || []).forEach((c) => {
    const cNode = getDocumentTree(c, node) as any;
    childNodes.set(cNode.id || cNode.hash, cNode);
  });
  return node;
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
  const [dashInfo, setDashInfo] = useState<TOCNode | undefined>(undefined);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    async function getIndex() {
      const { archive, filepath } = getSectionInfo(contentUrl);
      const resp = await axios.get(
        `${mmtUrl}/:sTeX/sections?archive=${archive}&filepath=${filepath}`
      );
      const root = getDocumentTree(resp.data, undefined);
      setDashInfo(root);
    }
    getIndex();
  }, [mmtUrl, contentUrl]);

  const rootPage =
    dashInfo &&
    applyFilter(
      getSectionTree(dashInfo) as SectionTreeNode[],
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
      {(rootPage || []).map((child) => (
        <RenderTree
          key={child.tocNode.id}
          node={child}
          level={0}
          defaultOpen={defaultOpen}
        />
      ))}
    </FixedPositionMenu>
  );
}
