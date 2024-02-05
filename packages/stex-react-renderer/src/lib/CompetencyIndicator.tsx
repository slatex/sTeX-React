import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import LinearProgress from '@mui/material/LinearProgress';
import {
  BloomDimension,
  DefiniendaItem,
  NumericCognitiveValues,
  getDefiniedaInDoc,
  getUriWeightsV2,
  isLoggedIn,
} from '@stex-react/api';
import { BG_COLOR, getSectionInfo } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import CompetencyTable from './CompetencyTable';
import { PerSectionQuiz } from './PerSectionQuiz';
import { RenderOptions } from './RendererDisplayOptions';
import { getLocaleObject } from './lang/utils';
import {
  DimIcon,
  ServerLinksContext,
  mmtHTMLToReact,
} from './stex-react-renderer';
import styles from './styles/competency-indicator.module.scss';

function CompetencyBar({ dim, val }: { dim: BloomDimension; val: number }) {
  const hue = 120 * val;
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

const TO_SHOW = [
  BloomDimension.Remember,
  BloomDimension.Understand,
  BloomDimension.Apply,
];

const CompetencyIndicator = ({
  contentUrl,
  sectionTitle,
}: {
  contentUrl: string;
  sectionTitle: string;
}) => {
  const [competencyData, setCompetencyData] = useState<
    NumericCognitiveValues[] | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [definedData, setDefinedData] = useState<DefiniendaItem[] | null>(null);
  const { archive, filepath } = getSectionInfo(contentUrl);
  const { mmtUrl } = useContext(ServerLinksContext);
  const { renderOptions } = useContext(RenderOptions);
  const [URIs, setURIs] = useState<string[]>([]);
  const t = getLocaleObject(useRouter());

  useEffect(() => {
    if (!isLoggedIn()) return;
    getDefiniedaInDoc(mmtUrl, archive, filepath).then(setDefinedData);
  }, [archive, filepath, mmtUrl]);

  useEffect(() => {
    if (!definedData) return;
    const URIs = [...new Set(definedData.flatMap((data) => data.symbols))];
    setURIs(URIs);
    getUriWeightsV2(URIs).then((data) => setCompetencyData(data));
  }, [definedData]);

  function refetchCompetencyData() {
    if (!URIs?.length) return;
    getUriWeightsV2(URIs).then((data) => setCompetencyData(data));
  }

  const averages = TO_SHOW.reduce((acc, competency) => {
    const avg = competencyData?.length
      ? competencyData.reduce((sum, item) => sum + (item[competency] ?? 0), 0) /
        competencyData.length
      : 0;
    acc[competency] = avg;
    return acc;
  }, {} as { [competency: string]: number });

  if (!definedData?.length || renderOptions.noFrills) return null;

  return (
    <Box maxWidth="var(--document-width)">
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ '& .MuiAccordionSummary-content': { overflow: 'hidden' } }}
        >
          <Box style={{ display: 'flex' }}>
            <Box className={styles['summary-competence-bar-container']}>
              {TO_SHOW.map((dim) => (
                <CompetencyBar key={dim} dim={dim} val={averages[dim]} />
              ))}
            </Box>
            <span style={{ color: 'gray', whiteSpace: 'nowrap' }}>
              {t.review}
            </span>
            &nbsp;
            <b>{mmtHTMLToReact(sectionTitle)}</b>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box className={styles['details-competence-bar-container']}>
            {TO_SHOW.map((dim) => (
              <Tooltip
                key={dim}
                title={`${dim}: ${(averages[dim] * 100).toFixed(1)}%`}
              >
                <Box
                  className={styles['details-competence-bar']}
                  bgcolor={BG_COLOR}
                  onClick={() => setOpenDialog(true)}
                >
                  <DimIcon dim={dim} white={false} showTitle={true} />
                  <CompetencyBar dim={dim} val={averages[dim]} />
                </Box>
              </Tooltip>
            ))}
          </Box>
          <PerSectionQuiz archive={archive} filepath={filepath} />
        </AccordionDetails>
      </Accordion>
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
              <CompetencyTable
                URIs={URIs}
                competencyData={competencyData}
                dimensions={TO_SHOW}
                onValueUpdate={refetchCompetencyData}
              />
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
