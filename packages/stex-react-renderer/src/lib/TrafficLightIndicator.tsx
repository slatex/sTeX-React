import { DialogContentText } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
  BloomDimension,
  DefiniendaItem,
  NumericCognitiveValues,
  getDefiniedaInDoc,
  getUriWeights,
  isLoggedIn,
} from '@stex-react/api';
import { getSectionInfo } from '@stex-react/utils';
import { useContext, useEffect, useState } from 'react';
import CompetencyTable from './CompetencyTable';
import { ServerLinksContext } from './stex-react-renderer';

const TO_SHOW = [
  BloomDimension.Remember,
  BloomDimension.Understand,
  BloomDimension.Apply,
];
const trafficLightStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  margin: '0px 5px ',
  boxShadow: 'inset 0px 0px 5px 2px rgba(0, 0, 0, 0.5)',
};
const getColor = (color: string, marks: number) => {
  if (color === 'green') {
    if (marks >= 80) {
      return 'lightgreen';
    } else {
      return 'gray';
    }
  }
  if (color === 'yellow') {
    if (marks > 30 && marks < 80) {
      return 'yellow';
    } else {
      return 'gray';
    }
  }
  if (color === 'red') {
    if (marks < 30) {
      return 'red';
    } else {
      return 'gray';
    }
  }
};

const TrafficLightIndicator = ({ contentUrl }: { contentUrl: string }) => {
  const { archive, filepath } = getSectionInfo(contentUrl);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [competencyData, setCompetencyData] = useState<
    NumericCognitiveValues[] | null
  >(null);
  const [definedData, setDefinedData] = useState<DefiniendaItem[] | null>(null);
  const [URIs, setURIs] = useState<string[]>([]);
  useEffect(() => {
    if (!isLoggedIn()) return;
    getDefiniedaInDoc(mmtUrl, archive, filepath).then(setDefinedData);
  }, [archive, filepath, mmtUrl]);
  useEffect(() => {
    if (!definedData) return;
    const URIs = [...new Set(definedData.flatMap((data) => data.symbols))];
    setURIs(URIs);
    getUriWeights(URIs).then((data) => setCompetencyData(data));
  }, [definedData]);
  const handleBoxClick = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  function refetchCompetencyData() {
    if (!URIs?.length) return;
    getUriWeights(URIs).then((data) => setCompetencyData(data));
  }
  const averages = TO_SHOW.reduce((acc, competency) => {
    const avg = competencyData?.length
      ? competencyData.reduce((sum, item) => sum + (item[competency] ?? 0), 0) /
        competencyData.length
      : 0;
    acc[competency] = avg;
    return acc;
  }, {} as { [competency: string]: number });
  return (
    <>
      <Box
        sx={{
          textAlign: 'center',
          border: '2px solid black',
          borderRadius: '10px',
          padding: '10px',
          backgroundColor: 'black',
          width: '150px',
          cursor: 'pointer',
        }}
        onClick={handleBoxClick}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              ...trafficLightStyle,
              backgroundColor: getColor('green', averages.Remember * 100),
            }}
          ></Box>
          <Box
            sx={{
              ...trafficLightStyle,
              backgroundColor: getColor('yellow', averages.Remember * 100),
            }}
          ></Box>
          <Box
            sx={{
              ...trafficLightStyle,
              backgroundColor: getColor('red', averages.Remember * 100),
            }}
          ></Box>
        </Box>
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth={true}
        maxWidth="lg"
      >
        <DialogTitle>Competency Table</DialogTitle>
        <DialogContent>
          {competencyData ? (
            <DialogContentText>
              <CompetencyTable
                URIs={URIs}
                competencyData={competencyData}
                dimensions={TO_SHOW}
                onValueUpdate={refetchCompetencyData}
                showTour={true}
                mmtUrl={mmtUrl}
              />
            </DialogContentText>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TrafficLightIndicator;
