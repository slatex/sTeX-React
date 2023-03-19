import { Box, Tooltip, Typography } from '@mui/material';
import { MdViewer } from '@stex-react/markdown';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import type { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';
import { SYSTEM_UPDATES } from '../system-updates';

dayjs.extend(localizedFormat);

const UpdatesPage: NextPage = () => {
  return (
    <MainLayout title="System Updates | VoLL-KI">
      <Box p="10px" m="0 auto" maxWidth="650px">
        <Typography fontWeight="bold" textAlign="center" variant="h3" color="#444">
          System Updates
        </Typography>
        {SYSTEM_UPDATES.map((update, idx) => (
          <Box key={idx} id={update.id} my="30px">
            <Typography fontWeight="bold" variant="h4" color="#444">
              {update.header}
            </Typography>
            <Tooltip title={update.timestamp.format('LT')}>
              <Typography color="gray" mb="10px">
                {update.timestamp.format('LL')}
              </Typography>
            </Tooltip>
            <Typography><MdViewer content={update.content}/></Typography>
          </Box>
        ))}
      </Box>
    </MainLayout>
  );
};

export default UpdatesPage;