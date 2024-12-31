import { Paper } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { LoExplorer } from '../components/lo-explorer';

const LoExplorerPage = () => {
  return (
    <MainLayout title="Learning Objects | ALeA">
      <Paper elevation={3} sx={{ m: '16px' }}>
        <LoExplorer />
      </Paper>
    </MainLayout>
  );
};

export default LoExplorerPage;
