import { DialogContentText, Typography } from '@mui/material';
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
const getColor = (color: string, averageUnderstand: number) => {
  if (color === 'green') {
    if (averageUnderstand >= 0.8) {
      return 'lightgreen';
    } else {
      return 'gray';
    }
  }
  if (color === 'yellow') {
    if (averageUnderstand > 0.3 && averageUnderstand < 0.8) {
      return 'yellow';
    } else {
      return 'gray';
    }
  }
  if (color === 'red') {
    if (averageUnderstand < 0.3) {
      return 'red';
    } else {
      return 'gray';
    }
  }
};

function getText(averageUnderstand: number): string {
  if (averageUnderstand <= 0.3) {
    return 'More preparation needed before proceeding.';
  } else if (averageUnderstand > 0.3 && averageUnderstand <= 0.8) {
    return 'Revise materials before progressing.';
  } else {
    return 'Ready to proceed. Congratulations!';
  }
}

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

  const averageUnderstand = competencyData?.length
    ? competencyData.reduce((sum, item) => sum + (item['Understand'] ?? 0), 0) /
      competencyData.length
    : 0;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center',
          border: '2px solid black',
          borderRadius: '10px',
          padding: '10px',
          backgroundColor: 'black',
          width: '150px',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            width: 'calc(100% - 30px)',
            '& .hover-text': {
              display: 'block',
              color: 'white',
              whiteSpace: 'nowrap',
            },
          },
        }}
        onClick={handleBoxClick}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'left',
            marginLeft: '10px',
            flexShrink: '0',
          }}
        >
          <Box
            sx={{
              ...trafficLightStyle,
              backgroundColor: getColor('green', averageUnderstand),
            }}
          ></Box>
          <Box
            sx={{
              ...trafficLightStyle,
              backgroundColor: getColor('yellow', averageUnderstand),
            }}
          ></Box>
          <Box
            sx={{
              ...trafficLightStyle,
              backgroundColor: getColor('red', averageUnderstand),
            }}
          ></Box>
        </Box>
        <Box className="hover-text" sx={{ display: 'none' }}>
          <Typography>{getText(averageUnderstand)}</Typography>
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
