import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { localStore } from '@stex-react/utils';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { DeckAndVideoInfo } from '../shared/slides';

function ToggleResolution({
  resolution,
  setResolution,
  availableResolutions,
}: {
  resolution: number;
  setResolution: Dispatch<SetStateAction<number>>;
  availableResolutions: number[];
}) {
  return (
    <ToggleButtonGroup
      size="small"
      value={resolution}
      exclusive
      onChange={(_event, newVal) => {
        if (newVal !== null) setResolution(newVal);
      }}
    >
      {availableResolutions.map((res) => (
        <ToggleButton value={res} key={res}>
          {res}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function getAvailableRes(info?: DeckAndVideoInfo) {
  if (!info) return [];
  return Object.keys(info)
    .map((k) => {
      if (k.startsWith('r') && info[k]) return +k.slice(1);
    })
    .filter((v) => !!v)
    .sort((a, b) => a - b);
}

function getVideoId(
  info: DeckAndVideoInfo,
  needRes: number,
  availableRes: number[]
) {
  if (!availableRes?.length) return;
  const res = availableRes.includes(needRes) ? needRes : availableRes[0];
  return info[`r${res}`];
}

export function VideoDisplay({ deckInfo }: { deckInfo: DeckAndVideoInfo }) {
  const [resolution, setResolution] = useState(720);
  const videoRef = useRef<HTMLVideoElement>(null);
  const availableRes = getAvailableRes(deckInfo);
  const videoId = getVideoId(deckInfo, resolution, availableRes);

  useEffect(
    () => setResolution(+(localStore?.getItem('defaultResolution') || '720')),
    []
  );
  if (!videoId) return <span>Video not available for this section</span>;
  return (
    <>
      <video
        autoPlay={true}
        src={videoId}
        preload="auto"
        controls
        onLoadedMetadata={() => {
          if (deckInfo.timestampSec)
            videoRef.current.currentTime = deckInfo.timestampSec;
        }}
        style={{ width: '100%', height: '100%', border: '1px solid black', borderRadius: '5px' }}
        ref={videoRef}
      ></video>
      <Box sx={{ display: 'flex', m: '-5px 0 5px' }}>
        <ToggleResolution
          resolution={resolution}
          setResolution={(res: number) => {
            setResolution(res);
            localStore?.setItem('defaultResolution', res.toString());
          }}
          availableResolutions={availableRes}
        />
      </Box>
    </>
  );
}
