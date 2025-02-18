import { FastForward, MusicNote } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import VideocamIcon from '@mui/icons-material/Videocam';
import { Box, CircularProgress, Divider, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { ClipDetails, SlideClipInfo } from '@stex-react/api';
import { localStore } from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

export default function SeekVideo({
  currentSlideClipInfo,
  setTimestampSec,
  setCurrentClipId,
}: {
  currentSlideClipInfo: SlideClipInfo;
  setTimestampSec: React.Dispatch<React.SetStateAction<number>>;
  setCurrentClipId: Dispatch<SetStateAction<string>>;
}) {
  const handleSeek = () => {
    if (currentSlideClipInfo) {
      const { startTimeSec, clipId } = currentSlideClipInfo;
      setCurrentClipId(clipId);
      if (startTimeSec) {
        setTimestampSec((prev) => (prev === startTimeSec ? prev + 0.001 : startTimeSec));
      } else setTimestampSec(0);
    }
  };
  if (!currentSlideClipInfo) return null;
  return (
    <Box display="inline-block" zIndex="1">
      <Tooltip title={`Seek Video to current slide`} arrow>
        <IconButton
          onClick={handleSeek}
          sx={{
            padding: '5px',
            backgroundColor: '#1976d2',
            color: 'white',
            margin: '10px',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          <FastForward />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

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
    <Box display="flex" alignItems="center" border={'1px solid #CCC'} zIndex="1">
      <IconButton onClick={() => setAudioOnly(!audioOnly)}>
        <Tooltip title={audioOnly ? 'Show Video' : 'Audio Only'}>
          {audioOnly ? <VideocamIcon /> : <MusicNote />}
        </Tooltip>
      </IconButton>
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
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
  setCurrentClipId,
  timestampSec,
  setTimestampSec,
  currentSlideClipInfo,
  audioOnly,
}: {
  clipId: string;
  setCurrentClipId: Dispatch<SetStateAction<string>>;
  timestampSec?: number;
  setTimestampSec?: Dispatch<SetStateAction<number>>;
  currentSlideClipInfo?: SlideClipInfo;
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
      <Box sx={{ display: 'flex', m: '-4px 0 5px' }}>
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
        <SeekVideo
          currentSlideClipInfo={currentSlideClipInfo}
          setTimestampSec={setTimestampSec}
          setCurrentClipId={setCurrentClipId}
        />
      </Box>
    </>
  );
}
