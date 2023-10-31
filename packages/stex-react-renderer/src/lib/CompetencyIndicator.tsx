import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
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

function CompetencyBar({ dim, val }: { dim: BloomDimension; val: number }) {
  const hue = 120 * (val);
  return (
    <Tooltip title={`${dim}: ${(val * 100).toFixed(1)}%`}>
      <LinearProgress
        sx={{
          backgroundColor: `hsl(${hue}, 100%, 90%)`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: `hsl(${hue}, 100%, 50%)`,
          },
        }}
        variant="determinate"
        value={Math.round(val * 100)}
      />
    </Tooltip>
  );
}

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

  useEffect(() => {
    getDefiniedaInDoc(mmtUrl, archive, filepath).then(setDefinedData);
  }, [archive, filepath, mmtUrl]);

  useEffect(() => {
    if (!definedData) return;
    const URIs = definedData.flatMap((data) => data.symbols);
    setURIs(URIs);
    getUriWeights(URIs).then((data) => setCompetencyData(data));
  }, [definedData]);
  const averageRemember = competencyData?.length
    ? competencyData.reduce((sum, item) => sum + (item.Remember ?? 0), 0) /
      competencyData.length
    : 0;

  const averageUnderstand = competencyData?.length
    ? competencyData.reduce((sum, item) => sum + (item.Understand ?? 0), 0) /
      competencyData.length
    : 0;

  if (!definedData?.length) return null;

  return (
    <Box style={{ backgroundColor: '#FFFFE0' }}>
      {competencyData && (
        <Box
          display="flex"
          justifyContent="space-around"
          border="1px solid yellow"
          borderRadius="3px"
          marginBottom="5px"
          gap="15px"
          alignItems="center"
          p="5px"
        >
          <Box flexGrow={1} maxWidth="10vw">
            <DimIcon
              dim={BloomDimension.Remember}
              white={false}
              showTitle={true}
            />
            <CompetencyBar
              dim={BloomDimension.Remember}
              val={averageRemember}
            />
          </Box>
          <Box flexGrow={1} maxWidth="10vw">
            <DimIcon
              dim={BloomDimension.Understand}
              white={false}
              showTitle={true}
            />
            <CompetencyBar
              dim={BloomDimension.Understand}
              val={averageUnderstand}
            />
          </Box>
          <Button
            sx={{ flexGrow: 0 }}
            variant="contained"
            style={{ height: '40px' }}
            onClick={() => setOpenDialog(true)}
          >
            {t.details}
          </Button>
        </Box>
      )}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
            onClick={() => setOpenDialog(false)}
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
