import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import {
  BloomDimension,
  DefiniendaItem,
  NumericCognitiveValues,
  getDefiniedaInDoc,
  getUriWeights,
} from '@stex-react/api';
import { getSectionInfo } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import CompetencyTable from './CompetencyTable';
import { getLocaleObject } from './lang/utils';
import { DimIcon, ServerLinksContext } from './stex-react-renderer';

const CompetencyIndicator = ({ contentUrl }: { contentUrl: string }) => {
  const [competencyData, setCompetencyData] = useState<
    NumericCognitiveValues[] | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [definedData, setDefinedData] = useState<DefiniendaItem[] | null>(null);
  const { archive, filepath } = getSectionInfo(contentUrl);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [URIs, setURIs] = useState<string[]>([]);
  const t = getLocaleObject(useRouter());

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    async function fetchData() {
      const data = await getDefiniedaInDoc(mmtUrl, archive, filepath);
      setDefinedData(data);
    }
    fetchData();
  }, [archive, filepath, mmtUrl]);

  useEffect(() => {
    if (!definedData) return;
    const URIs = definedData.flatMap((data) => data.symbols);
    setURIs(URIs);
    getUriWeights(URIs).then((data) => setCompetencyData(data));
  }, [definedData]);
  const sumOfAverageRemember = competencyData?.length
    ? competencyData.reduce((sum, item) => sum + (item.Remember ?? 0), 0) /
      competencyData.length
    : 0;

  const sumOfAverageUnderstand = competencyData?.length
    ? competencyData.reduce((sum, item) => sum + (item.Understand ?? 0), 0) /
      competencyData.length
    : 0;
  if (!definedData?.length) {
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
              value={Math.round(sumOfAverageRemember * 100)}
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
              value={Math.round(sumOfAverageUnderstand * 100)}
            />
          </Box>
          <Button
            variant="contained"
            style={{ height: '40px' }}
            onClick={handleOpenDialog}
          >
            {t.details}
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
          <b>{t.details}</b>
        </DialogTitle>
        <DialogContent>
          {competencyData ? (
            <DialogContentText>
              <CompetencyTable URIs={URIs} competencyData={competencyData} />
            </DialogContentText>
          ) : null}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
          >
            {t.close}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompetencyIndicator;
