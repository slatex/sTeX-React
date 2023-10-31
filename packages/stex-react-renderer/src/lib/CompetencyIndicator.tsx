import { getSectionInfo } from '@stex-react/utils';
import { useContext, useEffect, useState } from 'react';
import { DimIcon, ServerLinksContext } from './stex-react-renderer';
import {
  BloomDimension,
  getDefiniedaInDoc,
  getUriWeights,
} from '@stex-react/api';
import { DefiniendaItem, NumericCognitiveValues } from '@stex-react/api';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import CompetencyTable from './CompetencyTable';

const CompetencyIndicator = ({ contentUrl }: { contentUrl: string }) => {
  const [competencyData, setCompetencyData] = useState<
    NumericCognitiveValues[] | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [definedData, setDefinedData] = useState<DefiniendaItem[] | null>(null);
  const { archive, filepath } = getSectionInfo(contentUrl);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [URIs, setURIs] = useState<string[]>([]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    async function fetchData() {
      const data = await getDefiniedaInDoc(mmtUrl, archive, filepath);
      console.log('defined data - ' + data);
      setDefinedData(data);
    }
    fetchData();
  }, [archive, filepath, mmtUrl]);

  async function getData() {
    if (definedData !== null) {
      const URIs = definedData.flatMap((data) => data.symbols);
      setURIs(URIs);
      const data = await getUriWeights(URIs);
      setCompetencyData(data);
    }
  }
  useEffect(() => {
    getData();
  }, [definedData]);
  const sumOfAverageRemember = competencyData?.length
    ? competencyData.reduce((sum, item) => sum + (item.Remember || 0), 0) /
      competencyData.length
    : 0;

  const sumOfAverageUnderstand = competencyData?.length
    ? competencyData.reduce((sum, item) => sum + (item.Understand || 0), 0) /
      competencyData.length
    : 0;
  if(!definedData?.length){
    return null;
  }
  return (
    <Box style={{ backgroundColor: '#FFFFE0' }}>
      {competencyData && (
        <Box
          display="flex"
          justifyContent="space-around"
          border="1px solid yellow"
          borderRadius="3px"
          marginBottom="5px"
          alignItems="center"
          p="5px"
        >
          <Box width="10vw">
            <DimIcon
              dim={BloomDimension.Remember}
              white={false}
              showTitle={true}
            />
            <LinearProgress
              variant="determinate"
              value={parseFloat(sumOfAverageRemember.toFixed(2)) * 100}
            />
          </Box>
          <Box width="10vw">
            <DimIcon
              dim={BloomDimension.Understand}
              white={false}
              showTitle={true}
            />
            <LinearProgress
              variant="determinate"
              value={parseFloat(sumOfAverageUnderstand.toFixed(2)) * 100}
            />
          </Box>
          <Button
            variant="contained"
            style={{ height: '40px' }}
            onClick={handleOpenDialog}
          >
            My Competency
          </Button>
        </Box>
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth={true}
        maxWidth="lg"
      >
        <DialogTitle>
          <b>My Competency Data</b>
        </DialogTitle>
        <DialogContent>
          {competencyData ? (
            <DialogContentText>
              <CompetencyTable URIs={URIs} competencyData={competencyData} />
            </DialogContentText>
          ) : (
            'Loading Data - C'
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompetencyIndicator;
