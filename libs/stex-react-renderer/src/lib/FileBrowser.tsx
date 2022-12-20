import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button } from '@mui/material';
import {
  BG_COLOR,
  getChildrenOfBodyNode,
  IS_MMT_VIEWER,
  shouldUseDrawer,
  sourceFileUrl,
  xhtmlPathToTex,
  XhtmlTopDocumentContentUrl
} from '@stex-react/utils';
import { useState } from 'react';
import { ContentFromUrl } from './ContentFromUrl';
import { FileNode } from './FileNode';
import { FileTree } from './FileTree';
import { LayoutWithFixedMenu } from './LayoutWithFixedMenu';

export function FileBrowser({
  defaultRootNodes,
  topOffset,
  standaloneLink,
}: {
  defaultRootNodes: FileNode[];
  topOffset: number;
  standaloneLink: (archive: string, filepath: string) => string;
}) {
  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());
  const [selectedFilepath, setSelectedFilepath] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  return (
    <LayoutWithFixedMenu
      topOffset={topOffset}
      showDashboard={showDashboard}
      setShowDashboard={setShowDashboard}
      menu={
        <FileTree
          defaultRootNodes={defaultRootNodes}
          selectedFile={{
            project: selectedProject,
            filepath: selectedFilepath,
          }}
          onSelectedFile={(project, filepath) => {
            setSelectedProject(project);
            setSelectedFilepath(filepath);
          }}
          onClose={() => setShowDashboard(false)}
        />
      }
    >
      <Box width="100%" sx={{ backgroundColor: BG_COLOR }}>
        <Box maxWidth={IS_MMT_VIEWER ? undefined : '650px'} p="10px" m="auto">
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
              <hr style={{ width: '90%' }} />
              <ContentFromUrl
                url={XhtmlTopDocumentContentUrl(selectedProject, selectedFilepath)}
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
