import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IndexNode, INDEX_UPDATE_COUNT, TOP_LEVEL } from './collectIndexInfo';
import { RendererDisplayOptions } from './RendererDisplayOptions';
import UnfoldLessDoubleIcon from '@mui/icons-material/UnfoldLessDouble';
import UnfoldMoreDoubleIcon from '@mui/icons-material/UnfoldMoreDouble';
import styles from './stex-react-renderer.module.scss';
import { FixedPositionMenu } from './LayoutWithFixedMenu';

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
            router.query['inDocPath'] = paths.reverse().join('.');
            router.push(router);
          }}
        >
          {node.title}
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
export function ContentDashboard({
  onClose,
  topOffset = 0,
  dashInfo = undefined,
}: {
  onClose: () => void;
  topOffset?: number;
  dashInfo?: IndexNode;
}) {
  const [filterStr, setFilterStr] = useState('');
  const [updatedCount, setUpdatedCount] = useState(-1);
  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    // This is required only when we use dynmically created index info.
    // If dashboard info is precomputed, we don't need to do refresh ContentDashboard.
    if (dashInfo) return;
    const timerId = setInterval(() => {
      if (!dashInfo && INDEX_UPDATE_COUNT !== updatedCount) {
        setUpdatedCount(INDEX_UPDATE_COUNT);
      }
    }, 2000);
    return () => clearInterval(timerId);
  }, [dashInfo]); // No need to add updatedCount.

  const rootPage = applyFilter(
    dashInfo || TOP_LEVEL,
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
          <Box display="flex" alignItems="center">
            <IconButton sx={{ m: '2px 0 0 5px' }} onClick={() => onClose()}>
              <CloseIcon />
            </IconButton>
            <TextField
              id="tree-filter-string"
              label="Search"
              value={filterStr}
              onChange={(e) => setFilterStr(e.target.value)}
              sx={{ m: '10px', width: '100%' }}
              size="small"
            />
          </Box>
          <Box display="flex" justifyContent="space-between" m="10px">
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
