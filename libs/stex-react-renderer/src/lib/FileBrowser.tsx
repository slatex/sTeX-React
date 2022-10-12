import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button } from '@mui/material';
import { ContentFromUrl } from '@stex-react/stex-react-renderer';
import {
  BG_COLOR,
  getChildrenOfBodyNode,
  PathToArticle,
  sourceFileUrl,
  XhtmlContentUrl,
  xhtmlPathToTex,
} from '@stex-react/utils';
import { useState } from 'react';
import { LayoutWithFixedMenu } from './LayoutWithFixedMenu';
import { FileNode } from './FileNode';
import { FileTree } from './FileTree';

export function FileBrowser({
  defaultRootNodes,
  baseUrl,
  topOffset,
  standaloneLink,
}: {
  defaultRootNodes: FileNode[];
  baseUrl: string;
  topOffset: number;
  standaloneLink: (archive: string, filepath: string) => string;
}) {
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedFilepath, setSelectedFilepath] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  return (
    <LayoutWithFixedMenu
      topOffset={64}
      showDashboard={showDashboard}
      setShowDashboard={setShowDashboard}
      alwaysShowWhenNotDrawer={true}
      menu={
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
      }
    >
      <Box flex={1} p="10px" sx={{ backgroundColor: BG_COLOR }}>
        <Box maxWidth="600px" m="auto">
          {selectedProject && selectedFilepath ? (
            <>
              <a
                href={standaloneLink(selectedProject, selectedFilepath)}
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
              <hr />
              <ContentFromUrl
                url={XhtmlContentUrl(
                  baseUrl,
                  selectedProject,
                  selectedFilepath
                )}
                skipSidebar={true}
                modifyRendered={getChildrenOfBodyNode}
              />
            </>
          ) : (
            <i>Select an article for preview</i>
          )}
        </Box>
      </Box>
    </LayoutWithFixedMenu>
  );
}
