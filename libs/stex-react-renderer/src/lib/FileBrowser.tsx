import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button } from '@mui/material';
import {
  BG_COLOR,
  FileLocation,
  getChildrenOfBodyNode,
  IS_MMT_VIEWER,
  shouldUseDrawer,
  sourceFileUrl,
  xhtmlPathToTex,
  XhtmlTopDocumentContentUrl,
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
  standaloneLink: (fileLoc: FileLocation) => string;
}) {
  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());
  const [archive, setArchive] = useState('');
  const [filepath, setFilepath] = useState('');

  return (
    <LayoutWithFixedMenu
      topOffset={topOffset}
      showDashboard={showDashboard}
      setShowDashboard={setShowDashboard}
      menu={
        <FileTree
          defaultRootNodes={defaultRootNodes}
          selectedFile={{ archive, filepath }}
          onSelectedFile={(f) => {
            setArchive(f.archive);
            setFilepath(f.filepath);
          }}
          onClose={() => setShowDashboard(false)}
        />
      }
    >
      <Box width="100%" sx={{ backgroundColor: BG_COLOR }}>
        <Box maxWidth={IS_MMT_VIEWER ? undefined : '650px'} p="10px" m="auto">
          {archive && filepath ? (
            <>
              <a
                href={standaloneLink({ archive, filepath })}
                target="_blank"
                rel="noreferrer"
              >
                <Button>
                  Open Article
                  <OpenInNewIcon />
                </Button>
              </a>
              <a
                href={sourceFileUrl(archive, xhtmlPathToTex(filepath))}
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
                url={XhtmlTopDocumentContentUrl({ archive, filepath })}
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
