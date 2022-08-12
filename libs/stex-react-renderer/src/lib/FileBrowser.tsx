import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button } from '@mui/material';
import { ContentFromUrl } from '@stex-react/stex-react-renderer';
import {
  BG_COLOR,
  PathToArticle,
  sourceFileUrl,
  XhtmlContentUrl,
  xhtmlPathToTex,
} from '@stex-react/utils';
import { useState } from 'react';
import { FileNode } from './FileNode';
import { FileTree } from './FileTree';

export function FileBrowser({
  defaultRootNodes,
  baseUrl,
  topOffset
}: {
  defaultRootNodes: FileNode[];
  baseUrl: string;
  topOffset: number;
}) {
  const [selectedFilepath, setSelectedFilepath] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  return (
    <>
      <FileTree
        topOffset={topOffset}
        defaultRootNodes={defaultRootNodes}
        baseUrl={baseUrl}
        selectedFile={{
          project: selectedProject,
          filepath: selectedFilepath,
        }}
        onSelectedFile={(project, filepath) => {
          setSelectedProject(project);
          setSelectedFilepath(filepath);
        }}
      />
      <Box ml="300px" p="10px" sx={{ backgroundColor: BG_COLOR }}>
        {selectedProject && selectedFilepath ? (
          <>
            <a
              href={PathToArticle(selectedProject, selectedFilepath)}
              target="_blank"
              rel="noreferrer"
            >
              <Button>
                Open Article
                <OpenInNewIcon />
              </Button>
            </a>
            <a
              href={sourceFileUrl(
                selectedProject,
                xhtmlPathToTex(selectedFilepath)
              )}
              target="_blank"
              rel="noreferrer"
            >
              <Button>
                View Source
                <OpenInNewIcon />
              </Button>
            </a>
            <ContentFromUrl
              url={XhtmlContentUrl(baseUrl, selectedProject, selectedFilepath)}
              skipSidebar={true}
              modifyRendered={(bodyNode) => bodyNode?.props?.children}
            />
          </>
        ) : (
          <i>No Article Selected</i>
        )}
      </Box>
    </>
  );
}
