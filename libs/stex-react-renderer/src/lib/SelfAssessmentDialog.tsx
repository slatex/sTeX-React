import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { Box, Dialog, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import {
  ALL_SMILEY_LEVELS,
  BloomDimension,
  getUriSmileys,
  reportEvent,
  SmileyCognitiveValues,
  SmileyLevel,
  smileyToLevel,
  SmileyType,
  SMILEY_TOOLTIPS,
} from '@stex-react/api';
import { PRIMARY_COL, SECONDARY_COL } from '@stex-react/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { mmtHTMLToReact } from './mmtParser';

const ICON_SIZE = 33;

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
    margin: '0',
    padding: '0',
    backgroundColor: '#ffffff00',
  },
});

export function DimIcon({
  dim,
  white,
  showTitle = true,
}: {
  dim: BloomDimension;
  white: boolean;
  showTitle?: boolean;
}) {
  return (
    <Image
      width={ICON_SIZE}
      height={ICON_SIZE}
      title={showTitle ? `I ${dim}` : undefined}
      src={`/bloom-dimensions/${dim}${white ? '_white' : ''}.svg`}
      alt={dim}
    />
  );
}

export function LevelIcon({
  level,
  highlighted,
}: {
  level?: SmileyLevel;
  highlighted: boolean;
}) {
  if (level === undefined) {
    return (
      <PendingOutlinedIcon
        sx={{ fontSize: `${ICON_SIZE}px` }}
        color="disabled"
      />
    );
  }
  return (
    <Image
      width={ICON_SIZE}
      height={ICON_SIZE}
      src={`/likert-icons/${level}${highlighted ? 'color' : ''}.svg`}
      alt={`${level}`}
      style={{ borderRadius: '500px' }}
    />
  );
}

function SelfAssessmentPopup({
  dims,
  uri,
  smileys,
  htmlName,
  dimText = true,
  refetchSmileys,
}: {
  dims: BloomDimension[];
  uri: string;
  smileys: SmileyCognitiveValues | undefined;
  htmlName: string;
  dimText?: boolean;
  refetchSmileys: () => void;
}) {
  return (
    <Box
      sx={{ background: SECONDARY_COL, border: `1px solid ${PRIMARY_COL}` }}
      p="5px 0"
      borderRadius="5px"
    >
      {dims.map((dim, idx) => (
        <Box key={dim} mt={idx ? '5px' : '0'}>
          <SelfAssessmentDialogRow
            dim={dim}
            uri={uri}
            htmlName={htmlName}
            selectedLevel={smileyToLevel(smileys?.[dim])}
            dimText={dimText}
            refetchSmileys={refetchSmileys}
          />
        </Box>
      ))}
    </Box>
  );
}

function SelfAssessmentDialogRow({
  dim,
  uri,
  htmlName,
  dimText,
  selectedLevel,
  refetchSmileys,
}: {
  dim: BloomDimension;
  uri: string;
  htmlName: string;
  dimText: boolean;
  selectedLevel?: number;
  refetchSmileys: () => void;
}) {
  return (
    <Box display="flex">
      <DimIcon dim={dim} white={true} />

      <Box>
        {dimText && (
          <span
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'left',
              marginLeft: '5px',
            }}
          >
            I {dim.toLowerCase()}{' '}
            <Box
              sx={{
                mr: '5px',
                display: 'inline',
                '& *': { display: 'inline!important' },
              }}
            >
              {mmtHTMLToReact(htmlName, false)}
            </Box>
          </span>
        )}
        {ALL_SMILEY_LEVELS.map((l) => (
          <Tooltip key={l} title={SMILEY_TOOLTIPS[dim]?.[l] || `Level ${l}`}>
            <IconButton
              sx={{ p: '0' }}
              onClick={async () => {
                await reportEvent({
                  type: 'self-assessment-5StepLikertSmileys',
                  URI: uri,
                  values: {
                    [dim]: `smiley${l}`,
                  },
                });
                refetchSmileys();
              }}
            >
              <LevelIcon level={l} highlighted={l === selectedLevel} />
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

export function SelfAssessment2({
  dims,
  uri,
}: {
  dims: BloomDimension[];
  uri: string;
}) {
  const [smileys, setSmileys] = useState<SmileyCognitiveValues | undefined>(
    undefined
  );
  function refetchSmileys() {
    getUriSmileys([uri]).then((v) => setSmileys(v[0]));
  }
  useEffect(() => {
    setSmileys(undefined);
    refetchSmileys();
  }, [uri]);
  return (
    <SelfAssessmentPopup
      dims={dims}
      uri={uri}
      smileys={smileys}
      htmlName={''}
      dimText={false}
      refetchSmileys={refetchSmileys}
    />
  );
}

export function SelfAssessmentDialog({
  dims,
  uri,
  htmlName,
}: {
  dims: BloomDimension[];
  uri: string;
  htmlName: string;
}) {
  const [open, setOpen] = useState(false);
  const [smileys, setSmileys] = useState<SmileyCognitiveValues | undefined>(
    undefined
  );
  function refetchSmileys() {
    getUriSmileys([uri]).then((v) => setSmileys(v[0]));
  }
  useEffect(() => {
    setSmileys(undefined);
    refetchSmileys();
  }, [uri]);

  return (
    <>
      <CustomTooltip
        title={
          <Box sx={{ boxShadow: '2px 7px 31px 8px rgba(0,0,0,0.75)' }}>
            <SelfAssessmentPopup
              dims={dims}
              uri={uri}
              smileys={smileys}
              htmlName={htmlName}
              refetchSmileys={() => refetchSmileys()}
            />
          </Box>
        }
      >
        <Box
          display="flex"
          p="0"
          border="1px solid #AAA"
          borderRadius="10px"
          width="fit-content"
          sx={{ cursor: 'pointer' }}
          onClick={() => setOpen(true)}
        >
          {dims.map((dim) => (
            <Box
              key={dim}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <DimIcon dim={dim} white={false} />
              <LevelIcon
                level={smileyToLevel(smileys?.[dim])}
                highlighted={true}
              />
            </Box>
          ))}
        </Box>
      </CustomTooltip>
      <Dialog onClose={() => setOpen(false)} open={open}>
        <SelfAssessmentPopup
          dims={dims}
          uri={uri}
          smileys={smileys}
          htmlName={htmlName}
          refetchSmileys={() => refetchSmileys()}
        />
      </Dialog>
    </>
  );
}
