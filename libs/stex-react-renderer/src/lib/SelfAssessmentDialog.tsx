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
  SmileyType,
} from '@stex-react/api';
import { SECONDARY_COL } from '@stex-react/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { mmtHTMLToReact } from './mmtParser';

const LEVEL_ICON_SIZE = 33;

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

function DimIcon({ dim, white }: { dim: BloomDimension; white: boolean }) {
  return (
    <Image
      width={40}
      height={40}
      src={`/bloom-dimensions/${dim}${white ? '_white' : ''}.svg`}
      alt={dim}
    />
  );
}

const LEVEL_TO_COLOR = {
  '-2': '#ea1f1f',
  '-1': '#f04f11',
  '0': '#ffa81d',
  '1': '#acd600',
  '2': '#15bc26',
};
function LevelIcon({
  level,
  highlighted = false,
}: {
  level?: SmileyLevel;
  highlighted: boolean;
}) {
  if (level === undefined) {
    return (
      <PendingOutlinedIcon
        sx={{ fontSize: `${LEVEL_ICON_SIZE}px` }}
        color="disabled"
      />
    );
  }
  return (
    <Image
      width={LEVEL_ICON_SIZE}
      height={LEVEL_ICON_SIZE}
      src={`/likert-icons/${level}.svg`}
      alt={`${level}`}
      style={{
        background: highlighted ? LEVEL_TO_COLOR[level] : undefined,
        borderRadius: '500px',
      }}
    />
  );
}
function smileyToLevel(smiley?: SmileyType): SmileyLevel | undefined {
  if (!smiley) return undefined;
  if (smiley === 'smiley-2') return -2;
  if (smiley === 'smiley-1') return -1;
  if (smiley === 'smiley0') return 0;
  if (smiley === 'smiley1') return 1;
  if (smiley === 'smiley2') return 2;
  return -2;
}

function SelfAssessmentPopup({
  dims,
  uri,
  smileys,
  htmlName,
  refetchSmileys,
}: {
  dims: BloomDimension[];
  uri: string;
  smileys: SmileyCognitiveValues | undefined;
  htmlName: string;
  refetchSmileys: () => void;
}) {
  return (
    <Box sx={{ background: SECONDARY_COL }} p="5px 0" borderRadius="5px">
      {dims.map((dim, idx) => (
        <Box mt={idx ? '5px' : '0'}>
          <SelfAssessmentDialogRow
            key={dim}
            dim={dim}
            uri={uri}
            htmlName={htmlName}
            selectedLevel={smileyToLevel(smileys?.[dim])}
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
  selectedLevel,
  refetchSmileys,
}: {
  dim: BloomDimension;
  uri: string;
  htmlName: string;
  selectedLevel?: number;
  refetchSmileys: () => void;
}) {
  return (
    <Box display="flex">
      <DimIcon dim={dim} white={true} />
      <Box>
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
        {ALL_SMILEY_LEVELS.map((l) => (
          <IconButton
            key={l}
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
        ))}
      </Box>
    </Box>
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
          p="5px"
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
