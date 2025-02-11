import { FastForward, InfoOutlined, MusicNote } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import VideocamIcon from '@mui/icons-material/Videocam';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { ClipDetails, ClipInfo } from '@stex-react/api';
import { localStore } from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '../styles/mediafile.module.scss';

import { ClipData, setSlideNumAndSectionId } from '../pages/course-view/[courseId]';

export default function SeekVideo({
  currentSlideClipInfo,
  setTimestampSec,
  setCurrentClipId,
}: {
  currentSlideClipInfo: ClipInfo;
  setTimestampSec: React.Dispatch<React.SetStateAction<number>>;
  setCurrentClipId: Dispatch<SetStateAction<string>>;
}) {
  const handleSeek = () => {
    if (currentSlideClipInfo) {
      const { start_time, video_id } = currentSlideClipInfo;
      setCurrentClipId(video_id);
      if (start_time) {
        setTimestampSec((prev) => (prev === start_time ? prev + 0.001 : start_time));
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
      {!audioOnly && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
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

interface Marker {
  time: number;
  label: string;
  data: {
    title?: string;
    description?: string;
    thumbnail?: string;
    sectionId?: string;
    slideIndex?: number;
    ocr_slide_content?: string;
  };
}

const MediaItem = ({
  audioOnly,
  videoId,
  sub,
  timestampSec,
  markers,
  onTimeUpdate,
}: {
  audioOnly: boolean;
  videoId: string;
  sub?: string;
  timestampSec?: number;
  markers: Marker[];
  onTimeUpdate?: (slideIndex: number, sectionId: string) => void;
}) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const videoPlayer = useRef<any>(null);
  const [tooltip, setTooltip] = useState<string>('');
  const [overlay, setOverlay] = useState<{ title: string; description: string } | null>(null);
  const lastMarkerRef = useRef<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (playerRef.current) {
      videoPlayer.current = videojs(playerRef.current, {
        controls: true,
        preload: 'auto',
        autoplay: true,
        sources: [{ src: videoId, type: 'video/mp4' }],
      });
      const controlBar = playerRef.current.parentNode.querySelector(
        '.vjs-control-bar'
      ) as HTMLElement;
      if (controlBar) {
        controlBar.style.paddingBottom = '30px';
        controlBar.style.paddingTop = '10px';
        controlBar.style.position = 'absolute';
        controlBar.style.zIndex = '9999';
      }

      const progressBar = playerRef.current.parentNode.querySelector(
        '.vjs-progress-holder'
      ) as HTMLElement;
      if (progressBar) {
        progressBar.style.marginTop = '20px';
      }

      const bigPlayButton = playerRef.current.parentNode.querySelector('.vjs-big-play-button');
      if (bigPlayButton) {
        const playIcon = bigPlayButton.querySelector('.vjs-icon-placeholder') as HTMLElement;
        if (playIcon) {
          playIcon.style.bottom = '5px';
          playIcon.style.paddingRight = '25px';
        }
      }

      const textTrackDisplay = playerRef.current.parentNode.querySelector(
        '.vjs-text-track-display'
      ) as HTMLElement;
      if (textTrackDisplay) {
        Object.assign(textTrackDisplay.style, {
          insetBlock: '0px',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          margin: '0',
          padding: '0',
        });
      }

      videoPlayer.current.on('loadedmetadata', () => {
        const progressHolder = videoPlayer.current.controlBar.progressControl.seekBar.el();
        const videoDuration = videoPlayer.current.duration();
        if (timestampSec) videoPlayer.current.currentTime(timestampSec);

        markers.forEach((marker) => {
          if (marker.time < videoDuration) {
            const markerElement = document.createElement('div');
            markerElement.className = 'custom-marker';
            markerElement.dataset.label = marker.label;
            markerElement.dataset.time = marker.time.toString();
            markerElement.dataset.sectionId = marker.data.sectionId;
            markerElement.dataset.slideIndex = String(marker.data.slideIndex);

            Object.assign(markerElement.style, {
              position: 'absolute',
              top: '0',
              width: '6px',
              height: '100%',
              backgroundColor: 'yellow',
              left: `${(marker.time / videoDuration) * 100}%`,
              zIndex: '10',
              cursor: 'pointer',
            });

            markerElement.addEventListener('mouseenter', () =>
              setTooltip(`${marker.label} - ${marker.time}s`)
            );
            markerElement.addEventListener('mouseleave', () => setTooltip(''));
            markerElement.addEventListener('click', () =>
              setOverlay({
                title: marker.data.title ?? 'Untitled',
                description: marker.data.description ?? 'No Description Available',
              })
            );

            progressHolder.appendChild(markerElement);
          }
        });
      });
      videoPlayer.current.on('timeupdate', () => {
        const currentTime = videoPlayer.current.currentTime();
        const markers = Array.from(document.querySelectorAll('.custom-marker')) as HTMLElement[];
        let latestMarker: HTMLElement | null = null;
        for (const marker of markers) {
          const markerTime = parseInt(marker.dataset.time, 10);
          if (currentTime >= markerTime) {
            marker.style.backgroundColor = 'green';
            if (!latestMarker) {
              latestMarker = marker;
            }
          } else {
            marker.style.backgroundColor = 'yellow';
          }
        }

        if (latestMarker) {
          const sectionId = latestMarker.dataset.sectionId || '';
          const slideIndex = latestMarker.dataset.slideIndex
            ? parseInt(latestMarker.dataset.slideIndex, 10)
            : 0;

          const markerId = `${sectionId}-${slideIndex}`;

          if (lastMarkerRef.current !== markerId) {
            lastMarkerRef.current = markerId;
            const safeSlideIndex = isNaN(slideIndex) || slideIndex === null ? 1 : slideIndex;
            //causing the issue of sync video either directly will set sectionId and slideIndex here
            //  or using onTimeUpdate
            // setSlideNumAndSectionId(router, safeSlideIndex, sectionId);
          }
        }
      });
    }
  }, [markers, timestampSec, videoId, onTimeUpdate]);
  useEffect(() => {
    if (videoPlayer.current && timestampSec !== undefined) {
      videoPlayer.current.currentTime(timestampSec);
    }
  }, [timestampSec]);
  const handleMouseMove = (e: React.MouseEvent) => {
    const progressBar = videoPlayer.current?.controlBar.progressControl.seekBar.el() as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const timeAtCursor = (mouseX / rect.width) * videoPlayer.current?.duration();

    const closestMarker = markers.find((marker) => Math.abs(marker.time - timeAtCursor!) < 1);

    if (closestMarker) {
      setTooltip(`${closestMarker.label} - ${closestMarker.time}s`);
    }
  };

  const handleMouseLeave = () => setTooltip('');

  return (
    <div style={{ marginBottom: '7px', position: 'relative' }}>
      <video
        ref={playerRef}
        className="video-js vjs-fluid vjs-styles=defaults vjs-big-play-centered"
        style={{ border: '0.5px solid black', borderRadius: '8px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {sub && <track src={sub} label="English" kind="captions" srcLang="en-us" default />}
      </video>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '4px',
            zIndex: '100',
          }}
        >
          {tooltip}
        </div>
      )}

      {overlay && (
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            borderRadius: '8px',
            zIndex: '100',
            display: 'block',
          }}
        >
          <h3>{overlay.title}</h3>
          <p>{overlay.description}</p>
          <button onClick={() => setOverlay(null)} style={{ background: '#f00', color: '#fff' }}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

function DraggableOverlay({ showOverlay, setShowOverlay, data }) {
  const overlayRef = useRef(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsLeft = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours} hr ${minutes} min ${secondsLeft} sec`;
    } else {
      return `${minutes} min ${secondsLeft} sec`;
    }
  };
  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => setDragging(false);
  const { parentClipId, currentSlideClipInfo } = data;

  return showOverlay ? (
    <Box
      ref={overlayRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'fixed',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '300px',
        padding: '10px',
        cursor: 'grab',
        zIndex: 1000,
      }}
    >
      <Paper elevation={3} sx={{ p: 2, position: 'relative', bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
        <IconButton
          onClick={() => setShowOverlay(false)}
          sx={{ position: 'absolute', right: 5, top: 5, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          🔍 Video Infos:
        </Typography>
        <Typography variant="body2">Parent Clip Id: {parentClipId}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Current slide Clip Infos:
        </Typography>
        <Typography variant="body2">Clip ID: {currentSlideClipInfo?.video_id}</Typography>
        <Typography variant="body2">
          Start Time: {formatTime(currentSlideClipInfo?.start_time)}
        </Typography>
        <Typography variant="body2">
          End Time: {formatTime(currentSlideClipInfo?.end_time)}
        </Typography>
      </Paper>
    </Box>
  ) : null;
}

export function VideoDisplay({
  clipId,
  setCurrentClipId,
  timestampSec,
  setTimestampSec,
  currentSlideClipInfo,
  audioOnly,
  videoExtractedData,
  onTimeUpdate,
}: {
  clipId: string;
  setCurrentClipId: Dispatch<SetStateAction<string>>;
  timestampSec?: number;
  setTimestampSec?: Dispatch<SetStateAction<number>>;
  currentSlideClipInfo?: ClipInfo;
  audioOnly: boolean;
  videoExtractedData?: {
    [timestampSec: number]: ClipData;
  };
  onTimeUpdate?: (slideIndex: number, sectionId: string) => void;
}) {
  const [resolution, setResolution] = useState(720);
  const [clipDetails, setClipDetails] = useState(undefined as ClipDetails);
  const availableRes = getAvailableRes(clipDetails);
  const videoId = getVideoId(clipDetails, resolution, availableRes);
  const [isLoading, setIsLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [reveal, setReveal] = useState(false);
  const router = useRouter();
  const extractedValues = Object.values(videoExtractedData || {});
  const markers = extractedValues
    .filter((item: any) => {
      return (item.sectionId || '').trim() !== '' && item.slideIndex !== null;
    })
    .map((item: any) => ({
      time: Math.floor(item.start_time ?? 0),
      label: item.title || 'Untitled',
      data: {
        thumbnail: item.thumbnail || null,
        ocr_slide_content: item.ocr_slide_content || null,
        sectionId: item.sectionId,
        slideIndex: item.slideIndex,
      },
    }));

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
  const handleKeyPress = (e) => {
    if (e.key === 'Shift') setReveal(true);
  };

  const handleKeyRelease = (e) => {
    if (e.key === 'Shift') setReveal(false);
  };
  if (isLoading) return <CircularProgress />;
  if (!videoId) return <i>Video not available for this section</i>;
  return (
    <>
      <Box
        style={{
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <MediaItem
          videoId={videoId}
          timestampSec={timestampSec}
          audioOnly={audioOnly}
          sub={clipDetails?.sub}
          markers={markers}
          onTimeUpdate={onTimeUpdate}
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
          <Box
            onKeyDown={handleKeyPress}
            onKeyUp={handleKeyRelease}
            tabIndex={0}
            sx={{
              display: 'inline-block',
            }}
          >
            <Button
              onDoubleClick={() => setShowOverlay((prev) => !prev)}
              style={{
                cursor: 'pointer',
                opacity: reveal ? 1 : 0,
                pointerEvents: reveal ? 'auto' : 'none',
              }}
            >
              <InfoOutlined />
            </Button>
          </Box>
          {showOverlay && (
            <DraggableOverlay
              showOverlay={showOverlay}
              setShowOverlay={setShowOverlay}
              data={{ parentClipId: clipId, currentSlideClipInfo: currentSlideClipInfo }}
            />
          )}
        </Box>
      </Box>
      <div style={{ height: '20px' }} />
    </>
  );
}
