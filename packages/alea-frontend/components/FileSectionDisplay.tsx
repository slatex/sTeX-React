import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Box, Button } from '@mui/material';
import {
  SectionsAPIData,
  findFileNode,
  hasSectionChild,
  is2ndLevelSection,
  isFile
} from '@stex-react/api';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { useState } from 'react';
import FileDebugData from './FileDebugData';


export const FileSectionDisplay = ({
  sectionData,
  topLevel,
}: {
  sectionData: SectionsAPIData;
  topLevel: SectionsAPIData;
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
  const is2ndLevel = is2ndLevelSection(archive, filepath, topLevel);
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
          {hasChild ? (
            <span style={{ color: 'green' }}> &nbsp;- Display Indicator</span>
          ) : (
            <span style={{ color: 'red' }}>
              &nbsp;- Do not Display Indicator
            </span>
          )}
          {is2ndLevel ? (
            <b style={{ color: 'green' }}> &nbsp;- Show Quiz</b>
          ) : (
            <span style={{ color: 'red' }}>&nbsp;- Do not Show Quiz</span>
          )}
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
            <FileSectionDisplay sectionData={section} topLevel={topLevel} />
          </li>
        ))}
      </ul>
    </Box>
  );
};
