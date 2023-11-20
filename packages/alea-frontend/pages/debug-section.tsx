import { TextField, Box, Button } from '@mui/material';
import { getDocumentSections } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import type { NextPage } from 'next';
import { useContext, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { FileSectionDisplay } from '../components/FileSectionDisplay';

const DebugSection: NextPage = () => {
  const { mmtUrl } = useContext(ServerLinksContext);
  const [sectionData, setSectionData] = useState(null);
  const [archive, setArchive] = useState('MiKoMH/AI');
  const [path, setPath] = useState('course/sec/overview.en.xhtml');

  async function fetchData(archive: string, path: string) {
    const data = await getDocumentSections(mmtUrl, archive, path);
    setSectionData(data);
  }
  return (
    <MainLayout>
      <Box p="10px" mx="5px">
        <TextField
          size="small"
          label="Archive Name"
          variant="outlined"
          value={archive}
          onChange={(e) => setArchive(e.target.value)}
        />
        <TextField
          size="small"
          label="File Path"
          variant="outlined"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />
        <Button variant="contained" onClick={() => fetchData(archive, path)}>
          Search
        </Button>
      </Box>
      <Box p="10px">
        {sectionData && <FileSectionDisplay sectionData={sectionData} topLevel={sectionData} />}
      </Box>
    </MainLayout>
  );
};

export default DebugSection;
