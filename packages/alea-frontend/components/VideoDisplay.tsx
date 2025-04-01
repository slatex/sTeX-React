import { FastForward, InfoOutlined, MusicNote, OpenInNew } from '@mui/icons-material';
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
import {
  ClipDetails,
  ClipInfo,
  getAncestors,
  getDefiniedaInDoc,
  lastFileNode,
  SectionsAPIData,
} from '@stex-react/api';
import { localStore, PathToTour2 } from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

import { ClipData, setSlideNumAndSectionId } from '../pages/course-view/[courseId]';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import Link from 'next/link';
import Image from 'next/image';

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
            margin: '5px',
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
    <Box display="flex" alignItems="center" border={'1px solid #CCC'} zIndex="1" sx={{ mb: 1 }}>
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
  clipId,
  clipIds,
  courseDocSections,
  autoSync,
}: {
  audioOnly: boolean;
  videoId: string;
  clipId: string;
  clipIds: { [sectionId: string]: string };
  sub?: string;
  timestampSec?: number;
  markers?: Marker[];
  courseDocSections?: SectionsAPIData;
  autoSync?: boolean;
}) => {
  const playerRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const videoPlayer = useRef<any>(null);
  const [tooltip, setTooltip] = useState<string>('');
  const [overlay, setOverlay] = useState<{ title: string; description: string } | null>(null);
  const lastMarkerRef = useRef<number | null>(null);
  const autoSyncRef = useRef(autoSync);
  const prevAutoSyncRef = useRef(false);
  const router = useRouter();
  const [concepts, setConcepts] = useState<string[]>([]);
  const { mmtUrl } = useContext(ServerLinksContext);

  const getDefinedConcepts = async (sectionId: string) => {
    if (!sectionId || !courseDocSections) return [];
    const ancestors = getAncestors(undefined, undefined, String(sectionId), courseDocSections);
    //const sectionParentInfo = lastFileNode(ancestors);
    //const { archive, filepath } = sectionParentInfo;
    const definedConcepts = []; // todo alea4 await getDefiniedaInDoc(mmtUrl, archive, filepath);
    if (!definedConcepts || definedConcepts.length === 0) return [];
    return [...new Set(definedConcepts.flatMap((data) => data.symbols))];
  };

  const handleMarkerClick = async (marker: any) => {
    const definedConcepts = await getDefinedConcepts(marker.data.sectionId);
    setConcepts(definedConcepts ?? []);
    setOverlay({
      title: marker.label ?? 'Untitled',
      description: marker.data.description ?? 'No Description Available',
    });
  };

  useEffect(() => {
    autoSyncRef.current = autoSync;
  }, [autoSync]);

  useEffect(() => {
    if (audioOnly) {
      return;
    } else {
      if (playerRef.current) {
        videoPlayer.current = videojs(playerRef.current, {
          controls: !audioOnly,
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
              markerElement.addEventListener('click', () => handleMarkerClick(marker));

              progressHolder.appendChild(markerElement);
            }
          });
        });
        const markersInDescOrder: Marker[] = markers.sort((a, b) => b.time - a.time);
        videoPlayer.current.on('playing', () => {
          setOverlay(null);
        });
        videoPlayer.current.on('pause', () => {
          const currentTime = videoPlayer.current.currentTime();
          const markerIndex = markersInDescOrder.findIndex((marker) => marker.time <= currentTime);
          if (markerIndex < 0) return;
          const newMarker = markersInDescOrder[markerIndex];
          handleMarkerClick(newMarker);
        });

        videoPlayer.current.on('timeupdate', () => {
          const currentTime = videoPlayer.current.currentTime();
          const availableMarkers = Array.from(
            document.querySelectorAll('.custom-marker')
          ) as HTMLElement[];

          let latestMarker: HTMLElement | null = null;
          for (const marker of availableMarkers) {
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
          if (markersInDescOrder.length === 0) return;
          const markerIndex = markersInDescOrder.findIndex((marker) => marker.time <= currentTime);
          if (markerIndex < 0) return;
          const newMarker = markersInDescOrder[markerIndex];
          if (
            lastMarkerRef.current !== newMarker.time ||
            (prevAutoSyncRef.current === false && autoSyncRef.current === true)
          ) {
            lastMarkerRef.current = newMarker.time;
            if (autoSyncRef.current && clipIds?.[newMarker?.data?.sectionId] === clipId) {
              setSlideNumAndSectionId(
                router,
                newMarker?.data?.slideIndex,
                newMarker?.data?.sectionId
              );
            }
          }
          prevAutoSyncRef.current = autoSyncRef.current;
        });
      }
    }
    return () => {
      playerRef.current?.pause();
    };
  }, [markers, timestampSec, videoId]);

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

  if (audioOnly) {
    return (
      <audio
        autoPlay={true}
        src={videoId}
        preload="auto"
        controls
        onLoadedMetadata={() => {
          if (timestampSec) playerRef.current.currentTime = timestampSec;
        }}
        style={{ width: '100%', background: '#f1f3f4' }}
        ref={playerRef}
      ></audio>
    );
  }
  return (
    <Box style={{ marginBottom: '7px', position: 'relative' }}>
      <video
        key="videoPlayer"
        ref={playerRef as MutableRefObject<HTMLVideoElement>}
        className="video-js vjs-fluid vjs-styles=defaults vjs-big-play-centered"
        style={{ border: '0.5px solid black', borderRadius: '8px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {sub && <track src={sub} label="English" kind="captions" srcLang="en-us" default />}
      </video>

      {tooltip && (
        <Box
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
        </Box>
      )}

      {overlay && (
        <Box
          style={{
            position: 'absolute',
            top: '47%',
            left: '0',
            width: '35%',
            height: '38%',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            zIndex: '100',

            padding: '10px ',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {concepts && concepts.length > 0 ? (
            <>
              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '1rem',
                  color: '#d7e4fa',
                  marginBottom: '8px',
                }}
              >
                Concepts in this slide
              </Typography>

              {concepts.map((uri, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '90%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    display: 'flex',
                    marginBottom: '10px',
                    transition: 'transform 0.5s ease-in-out',
                    '&:hover': {
                      transform: 'rotateY(10deg)',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: '600',

                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      width: '85%',
                    }}
                    title={uri}
                  >
                    {uri.split('?').pop()}
                  </Typography>
                  <Link href={PathToTour2(uri)} target="_blank" style={{ textDecoration: 'none' }}>
                    <Tooltip title="Take a guided tour" arrow>
                      <IconButton
                        sx={{
                          backgroundColor: '#fff',
                          borderRadius: '50%',
                          padding: '2px',
                          '&:hover': {
                            backgroundColor: '#f0f0f0',
                            transform: 'scale(1.2)',
                            transition: 'transform 0.2s ease-in-out',
                          },
                        }}
                      >
                        <Image
                          src="/guidedTour.png"
                          alt="Tour Logo"
                          width={25}
                          height={25}
                          priority
                        />
                      </IconButton>
                    </Tooltip>
                  </Link>
                </Box>
              ))}
            </>
          ) : (
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#ccc',
                marginTop: '12px',
              }}
            >
              No concepts available for the current slide
            </Typography>
          )}

          <IconButton
            onClick={() => setOverlay(null)}
            sx={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              color: '#fff',
              borderRadius: '50%',
              padding: '5px',
              '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.9)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}
    </Box>
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
  clipIds,
  setCurrentClipId,
  timestampSec,
  setTimestampSec,
  currentSlideClipInfo,
  audioOnly,
  videoExtractedData,
  courseDocSections,
  autoSync,
  onVideoLoad,
}: {
  clipId: string;
  clipIds: { [sectionId: string]: string };
  setCurrentClipId: Dispatch<SetStateAction<string>>;
  timestampSec?: number;
  setTimestampSec?: Dispatch<SetStateAction<number>>;
  currentSlideClipInfo?: ClipInfo;
  audioOnly: boolean;
  videoExtractedData?: {
    [timestampSec: number]: ClipData;
  };
  courseDocSections?: SectionsAPIData;
  autoSync?: boolean;
  onVideoLoad: (status: boolean) => void;
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
  useEffect(() => {
    const isVideoLoaded = !isLoading && !!videoId;
    onVideoLoad(isVideoLoaded);
  }, [isLoading, videoId, onVideoLoad]);

  if (isLoading) return <CircularProgress sx={{ mb: '15px' }} />;
  if (!videoId)
    return (
      <Box sx={{ mb: '25px', position: 'relative' }}>
        <i> Video not available for this section</i>
      </Box>
    );

  return (
    <>
      <Box
        style={{
          width: '100%',
          position: 'relative',
        }}
      >
        <MediaItem
          videoId={videoId}
          clipId={clipId}
          clipIds={clipIds}
          timestampSec={timestampSec}
          audioOnly={audioOnly}
          sub={clipDetails?.sub}
          markers={markers}
          courseDocSections={courseDocSections}
          autoSync={autoSync}
        />
        <Box sx={{ display: 'flex', m: '-4px 0 10px' }}>
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
          {!audioOnly && (
            <SeekVideo
              currentSlideClipInfo={currentSlideClipInfo}
              setTimestampSec={setTimestampSec}
              setCurrentClipId={setCurrentClipId}
            />
          )}
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
    </>
  );
}
