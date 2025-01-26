import { MusicNote } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Box, CircularProgress, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { ClipDetails } from '@stex-react/api';
import { localStore } from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

function ToggleResolution({
  audioOnly,
  setAudioOnly,
  resolution,
  setResolution,
  availableResolutions,
}: {
  audioOnly: boolean;
  setAudioOnly: Dispatch<SetStateAction<boolean>>;
  resolution: number;
  setResolution: Dispatch<SetStateAction<number>>;
  availableResolutions: number[];
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <Box display="inline-block" border={audioOnly ? undefined : '1px solid #CCC'} zIndex="1">
      <IconButton onClick={() => setAudioOnly(!audioOnly)}>
        <Tooltip title={audioOnly ? 'Show Video' : 'Audio Only'}>
          {audioOnly ? <VideocamIcon /> : <MusicNote />}
        </Tooltip>
      </IconButton>
      {!audioOnly && (
        <>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <SettingsIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            {availableResolutions.map((res) => (
              <MenuItem key={res} onClick={() => setResolution(res)}>
                <CheckIcon
                  fontSize="small"
                  sx={{ color: res === resolution ? undefined : '#00000000' }}
                />
                &nbsp;{res}p
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Box>
  );
}

function getAvailableRes(info?: ClipDetails) {
  if (!info) return [];
  return Object.keys(info)
    .map((k) => {
      if (k.startsWith('r') && info[k]) return +k.slice(1);
    })
    .filter((v) => !!v)
    .sort((a, b) => a - b);
}

function getVideoId(info: ClipDetails, needRes: number, availableRes: number[]) {
  if (!info || !availableRes?.length) return;
  const res = availableRes.includes(needRes) ? needRes : availableRes[0];
  return info[`r${res}`];
}

function MediaItem({
  audioOnly,
  videoId,
  sub,
  timestampSec,
}: {
  audioOnly: boolean;
  videoId: string;
  sub?: string;
  timestampSec: number;
}) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  useEffect(() => {
    if (timestampSec) mediaRef.current.currentTime = timestampSec;
  }, [timestampSec]);
  if (audioOnly) {
    return (
      <audio
        autoPlay={true}
        src={videoId}
        preload="auto"
        controls
        onLoadedMetadata={() => {
          if (timestampSec) mediaRef.current.currentTime = timestampSec;
        }}
        style={{ width: '100%', background: '#f1f3f4' }}
        ref={mediaRef}
      ></audio>
    );
  }
  return (
    <video
      autoPlay={true}
      src={videoId}
      crossOrigin="anonymous"
      preload="auto"
      controls
      onLoadedMetadata={() => {
        if (timestampSec) mediaRef.current.currentTime = timestampSec;
      }}
      style={{
        width: '100%',
        border: '1px solid black',
        borderRadius: '5px',
      }}
      ref={mediaRef as any}
    >
      {sub && <track src={sub} label="English" kind="captions" srcLang="en-us" default></track>}
    </video>
  );
}

export function VideoDisplay({
  clipId,
  timestampSec,
  audioOnly,
}: {
  clipId: string;
  timestampSec?: number;
  audioOnly: boolean;
}) {
  const [resolution, setResolution] = useState(720);
  const [clipDetails, setClipDetails] = useState(undefined as ClipDetails);
  const availableRes = getAvailableRes(clipDetails);
  const videoId = getVideoId(clipDetails, resolution, availableRes);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!clipId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    axios.get(`/api/get-fau-clip-info/${clipId}`).then((resp) => {
      setIsLoading(false);
      setClipDetails(resp.data);
    });
  }, [clipId]);

  useEffect(() => {
    setResolution(+(localStore?.getItem('defaultResolution') || '720'));
  }, []);
  if (isLoading) return <CircularProgress />;
  if (!videoId) return <i>Video not available for this section</i>;
  return (
    <>
      <MediaItem
        videoId={videoId}
        timestampSec={timestampSec}
        audioOnly={audioOnly}
        sub={clipDetails?.sub}
      />
      <Box sx={{ m: '-4px 0 5px' }}>
        <ToggleResolution
          audioOnly={audioOnly}
          setAudioOnly={(v: boolean) => {
            const audioOnlyStr = v.toString();
            localStore?.setItem('audioOnly', audioOnlyStr);
            router.query.audioOnly = audioOnlyStr;
            router.replace(router);
          }}
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
