import { Box, Button } from '@mui/material';
import { SectionsAPIData } from '@stex-react/api';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
  const isFile = filepath && archive;
  if (!sectionData) {
    return null;
  }
  return (
    <Box>
      {isFile ? (
        <Box>
          <InsertDriveFileIcon />
          {archive + '/' + filepath}{' '}
          <Button variant="contained" onClick={handleButtonClick}>
            {showDebugData ? 'Hide' : 'See All'}
          </Button>
          {showDebugData && <FileDebugData archive={archive} filepath={filepath} />}
        </Box>
      ) : (
        <Box>
          <ChevronRightIcon />
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
