import axios from 'axios';
import preval from 'next-plugin-preval';
import { AI_1_COURSE_SECTIONS } from './course_info/ai-1-notes';
import { AI_1_PREVALUATED_VIDEO_INFO } from './course_info/ai-1-video';

const fromPrevaluated = true;

const CACHED_CLIP_INFO = new Map<string, any>();

async function getVideoInfo(clipId: string, timestampSec = 8) {
  const cachedInfo = CACHED_CLIP_INFO.get(clipId);
  if (cachedInfo) return { ...cachedInfo, timestampSec };

  const clipUrl = `https://www.fau.tv/clip/id/${clipId}`;
  const clipPageContent = (await axios.get(clipUrl)).data;
  const videoLinks = clipPageContent.match(
    /www.fau.tv\/webplayer\/id\/([^&]+)\S+maxheight=([0-9]+)/g
  );
  if (!videoLinks?.length) return;
  const videoInfo = { timestampSec };
  for (const link of videoLinks) {
    const group =
      /www.fau.tv\/webplayer\/id\/([^&]+)\S+maxheight=([0-9]+)/gm.exec(link);
    const res = group[2];
    const id = group[1];
    const embedableLink = `https://itunes.video.uni-erlangen.de/services/oembed/?url=https://www.fau.tv/webplayer/id/${id}`;
    const embedableLinkData = (await axios.get(embedableLink)).data;

    const matches = /http\S+m4v/gm.exec(embedableLinkData);
    videoInfo['r' + res] = matches[0];
  }
  CACHED_CLIP_INFO.set(clipId, videoInfo);
  return videoInfo;
}

async function getAiVideoInfo() {
  if (fromPrevaluated) return AI_1_PREVALUATED_VIDEO_INFO;

  // May need to uncomment this line when getting video info because of
  // 'Error: unable to verify the first certificate'
  // When building for serving in production, use the prevaluated video info
  // and keep this unsafe line commented.
  // process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  const allVidInfo = {};
  for (const section of Object.values(AI_1_COURSE_SECTIONS)) {
    for (const deckId in section) {
      const { clipId, timestampSec } = section[deckId];
      if (!clipId) continue;
      console.log(`Fetching info for clip: ${clipId} `);
      const v = await getVideoInfo(clipId, timestampSec);
      allVidInfo[deckId] = v;
    }
  }
  console.log(allVidInfo);

  return allVidInfo;
}

export default preval(getAiVideoInfo());
