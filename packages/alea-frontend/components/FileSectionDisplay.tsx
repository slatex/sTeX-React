import { Box, Button } from '@mui/material';
import {
  SectionsAPIData,
  findFileNode,
  hasSectionChild,
  isFile,
} from '@stex-react/api';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FileDebugData from './FileDebugData';
import { useState } from 'react';

export const FileSectionDisplay = ({
  sectionData,
}: {
  sectionData: SectionsAPIData;
}) => {
  const [showDebugData, setShowDebugData] = useState(false);
  function handleButtonClick() {
    setShowDebugData(!showDebugData);
  }
  const { archive, filepath, title, children } = sectionData;
  if (!sectionData) {
    return null;
  }
  const node = findFileNode(archive, filepath, sectionData);
  const hasChild = hasSectionChild(node);
  return (
    <Box>
      {isFile(sectionData) ? (
        <Box>
          <InsertDriveFileIcon />
          {archive + '/' + filepath}{' '}
          <Button variant="contained" onClick={handleButtonClick}>
            {showDebugData ? 'Hide' : 'See All'}
          </Button>
          {showDebugData && (
            <FileDebugData archive={archive} filepath={filepath} />
          )}
          {hasChild ? ' - Display Indicator' : " - Don't Display Indicator"}
        </Box>
      ) : (
        <Box>
          <ListAltIcon />
          {mmtHTMLToReact(title)}
        </Box>
      )}
      <ul style={{ listStyle: 'none' }}>
        {children.map((section: any) => (
          <li key={section.id} style={{ listStyle: 'none' }}>
            <FileSectionDisplay sectionData={section} />
          </li>
        ))}
      </ul>
    </Box>
  );
};
