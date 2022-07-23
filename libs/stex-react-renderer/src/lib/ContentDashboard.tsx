import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, IconButton, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useReducer, useState } from 'react';
import { IndexNode, TOP_LEVEL } from './collectIndexInfo';
import styles from './stex-react-renderer.module.scss';

function applyFilter(
  node: IndexNode,
  searchTerms: string[]
): IndexNode | undefined {
  if (!searchTerms?.length) return node;
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

export function ContentDashboard({
  onClose,
  topOffset = 0,
}: {
  onClose: () => void;
  topOffset?: number;
}) {
  const router = useRouter();
  const [filterStr, setFilterStr] = useState('');
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  setTimeout(() => forceUpdate(), 1000);
  const rootPage = applyFilter(
    TOP_LEVEL,
    filterStr
      .toLowerCase()
      .split(' ')
      .map((s) => s.trim())
      .filter((t) => !!t?.length)
  );

  const renderTree = (nodes: IndexNode[], level = 0) =>
    nodes.map((node) => {
      const marginLeft = `${level * 20}px`;
      const itemClassName =
        level === 0
          ? styles['level0_dashboard_item']
          : styles['dashboard_item'];
      return (
        <Box
          key={node.hash}
          sx={{ my: '6px', cursor: 'pointer' }}
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
          <span style={{ marginLeft }} className={itemClassName}>
            {node.title}
          </span>
          {renderTree(Array.from(node.childNodes.values()), level + 1)}
        </Box>
      );
    });
  return (
    <Box className={styles['dash_outer_box']}>
      <Box
        className={styles['dash_inner_box']}
        sx={{ marginTop: `${topOffset}px` }}
      >
        <Box display="flex" alignItems="baseline">
          <IconButton sx={{ m: '2px 0 0 5px' }} onClick={() => onClose()}>
            <ArrowBackIcon />
          </IconButton>
          <TextField
            id="tree-filter-string"
            label="Search"
            value={filterStr}
            onChange={(e) => setFilterStr(e.target.value)}
            sx={{ m: '10px 5px' }}
            size="small"
          />
        </Box>
        <Box className={styles['dash_scroll_area_box']}>
          {renderTree(Array.from(rootPage?.childNodes.values() || []))}
        </Box>
      </Box>
    </Box>
  );
}
