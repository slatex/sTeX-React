import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RefreshIcon from '@mui/icons-material/Refresh';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, IconButton, TextField } from '@mui/material';
import { DEFAULT_BASE_URL } from '@stex-react/utils';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ROOT_NODES, { FileNode } from '../file-structure.preval';
import styles from '../styles/file-browser.module.scss';

const IS_SERVER = typeof window === 'undefined';
const PARSER_BASE_URL =
  (IS_SERVER ? null : (window as any).BASE_URL) ?? DEFAULT_BASE_URL;

export type SetSelectedFileFunction = (
  projectId: string,
  filepath: string
) => void;

interface SelectedFile {
  project: string;
  filepath: string;
}

export function NodeDisplay({
  node,
  selectedFile,
  onSelectedFile,
  searchTerms,
}: {
  node: FileNode;
  selectedFile: SelectedFile;
  onSelectedFile: SetSelectedFileFunction;
  searchTerms: string[];
}) {
  const [isOpen, setIsOpen] = useState(node.autoOpen);
  useEffect(() => {
    setIsOpen(node.autoOpen);
  }, [node.autoOpen]);

  const match = /archive=([^&]+)&filepath=([^"]+xhtml)/g.exec(node.link);
  const projectId = match?.[1];
  const filepath = match?.[2];
  if (projectId && filepath) {
    const isSelected =
      projectId === selectedFile.project && filepath === selectedFile.filepath;
    const fontWeight = node.autoOpen || isSelected ? 'bold' : undefined;
    const backgroundColor = isSelected ? '#CCC' : undefined;
    const color = node.autoOpen ? 'black' : undefined;
    return (
      <Box
        display="flex"
        alignItems="center"
        ml="18px"
        sx={{ cursor: 'pointer', fontWeight, backgroundColor }}
        onClick={() => onSelectedFile(projectId, filepath)}
      >
        <ArticleIcon />
        <span className={styles['dashboard_item']} style={{ color }}>
          {node.label}
        </span>
      </Box>
    );
  }

  return (
    <>
      <Box
        onClick={() => setIsOpen((prev) => !prev)}
        display="flex"
        alignItems="center"
        sx={{ cursor: 'pointer' }}
      >
        {isOpen ? (
          <>
            <RemoveIcon fontSize="small" />
            <FolderOpenIcon fontSize="small" sx={{ color: '#eeae4a' }} />
          </>
        ) : (
          <>
            <AddIcon fontSize="small" />
            <FolderIcon fontSize="small" sx={{ color: '#eeae4a' }} />
          </>
        )}
        <span className={styles['dashboard_item']}>{node.label}</span>
      </Box>
      {isOpen && (
        <Box marginLeft="18px">
          <NodesDisplay
            nodes={node.children}
            selectedFile={selectedFile}
            onSelectedFile={onSelectedFile}
            searchTerms={searchTerms}
          />
        </Box>
      )}
    </>
  );
}

export function NodesDisplay({
  nodes,
  selectedFile,
  onSelectedFile,
  searchTerms,
}: {
  nodes: FileNode[];
  selectedFile: { project: string; filepath: string };
  onSelectedFile: SetSelectedFileFunction;
  searchTerms: string[];
}) {
  return (
    <>
      {nodes.map((node) => {
        return (
          <NodeDisplay
            key={node.label}
            node={node}
            selectedFile={selectedFile}
            onSelectedFile={onSelectedFile}
            searchTerms={searchTerms}
          />
        );
      })}
    </>
  );
}

function applyFilter(nodes: FileNode[], searchTerms: string[]) {
  for (const node of nodes) {
    applyFilter(node.children, searchTerms);

    const matchesThisNode =
      searchTerms?.length &&
      searchTerms.some((term) => node.label.toLowerCase().includes(term));
    node.autoOpen = matchesThisNode || node.children?.some((c) => c.autoOpen);
  }
}

export function FileTree({
  topOffset,
  selectedFile,
  onSelectedFile,
}: {
  topOffset: number;
  selectedFile: SelectedFile;
  onSelectedFile: SetSelectedFileFunction;
}) {
  const [fileTree, setFileTree] = useState(ROOT_NODES);
  const [filterStr, setFilterStr] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const searchTerms = filterStr
    .toLowerCase()
    .split(' ')
    .map((s) => s.trim())
    .filter((t) => !!t?.length);

  applyFilter(fileTree, searchTerms);

  function refreshFileTree() {
    setIsRefreshing(true);
    axios.get(`${PARSER_BASE_URL}/:sTeX/browser?menu`).then((r) => {
      setIsRefreshing(false);
      setFileTree(r.data);
    });
  }

  return (
    <Box className={styles['dash_outer_box']}>
      <Box
        className={styles['dash_inner_box']}
        sx={{ marginTop: `${topOffset}px` }}
      >
        <Box display="flex" alignItems="baseline">
          <TextField
            id="tree-filter-string"
            label="Search"
            value={filterStr}
            onChange={(e) => setFilterStr(e.target.value)}
            sx={{ m: '10px 5px' }}
            size="small"
          />
          <IconButton onClick={() => refreshFileTree()} disabled={isRefreshing}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <Box className={styles['dash_scroll_area_box']}>
          <NodesDisplay
            nodes={fileTree}
            selectedFile={selectedFile}
            onSelectedFile={onSelectedFile}
            searchTerms={searchTerms}
          />
        </Box>
      </Box>
    </Box>
  );
}
