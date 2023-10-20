import { Box } from '@mui/material';
import { SectionsAPIData } from '@stex-react/api';
import {
    mmtHTMLToReact
} from '@stex-react/stex-react-renderer';


export const FileSectionDisplay = ({
  sectionData,
}: {
  sectionData: SectionsAPIData;
}) => {
  if (!sectionData) {
    return null;
  }
  const { archive, filepath, title,children} = sectionData;
  const isFile = sectionData.filepath && sectionData.archive;
  return (
    <Box>
      {isFile ? (
        <Box>{archive + '/' + filepath}</Box>
      ) : (
        <Box>{mmtHTMLToReact(title)}</Box>
      )}
      <ul>
        {children.map((section: any) => (
          <li key={section.id}>
            <FileSectionDisplay sectionData={section} />
          </li>
        ))}
      </ul>
    </Box>
  );
};
