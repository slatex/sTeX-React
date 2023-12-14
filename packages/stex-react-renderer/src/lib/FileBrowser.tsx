import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button } from '@mui/material';
import { FileNode } from '@stex-react/api';
import {
  BG_COLOR,
  FileLocation,
  IS_MMT_VIEWER,
  XhtmlTopDocumentContentUrl,
  getChildrenOfBodyNode,
  shouldUseDrawer,
  sourceFileUrl,
  xhtmlPathToTex,
} from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ContentFromUrl, DisplayReason } from './ContentFromUrl';
import { FileTree } from './FileTree';
import { LayoutWithFixedMenu } from './LayoutWithFixedMenu';
import { getLocaleObject } from './lang/utils';

export function FileBrowser({
  defaultRootNodes,
  topOffset,
  standaloneLink,
}: {
  defaultRootNodes: FileNode[];
  topOffset: number;
  standaloneLink: (fileLoc: FileLocation) => string;
}) {
  const t = getLocaleObject(useRouter());
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
                  {t.openArticle}
                  <OpenInNewIcon />
                </Button>
              </a>
              <a
                href={sourceFileUrl(archive, xhtmlPathToTex(filepath))}
                target="_blank"
                rel="noreferrer"
              >
                <Button>
                  {t.viewSource}
                  <OpenInNewIcon />
                </Button>
              </a>
              <hr style={{ width: '90%' }} />
              <ContentFromUrl
                displayReason={DisplayReason.FILE_BROWSER}
                topLevelDocUrl={XhtmlTopDocumentContentUrl({ archive, filepath })}
                url={XhtmlTopDocumentContentUrl({ archive, filepath })}
                modifyRendered={getChildrenOfBodyNode}
              />
            </>
          ) : (
            <i>{t.selectArticle}</i>
          )}
        </Box>
      </Box>
    </LayoutWithFixedMenu>
  );
}
