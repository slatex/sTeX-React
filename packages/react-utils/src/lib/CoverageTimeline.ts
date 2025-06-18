import { CoverageTimeline } from '@stex-react/utils';
import axios from 'axios';

let coverageTimelineCache: CoverageTimeline | undefined = undefined;
let coverageTimelineCacheTS: number | undefined = undefined;
const COVERAGE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function isCacheValid(): boolean {
  if (!coverageTimelineCache || !coverageTimelineCacheTS) return false;
  return Date.now() < coverageTimelineCacheTS + COVERAGE_CACHE_TTL;
}

export default async function getCachedCoverageTimeline(): Promise<CoverageTimeline | undefined> {
  if (isCacheValid()) {
    console.log('Using cached coverage timeline');
    return coverageTimelineCache;
  }

  console.log('Fetching new coverage timeline');
  const response = await axios.get('/api/get-coverage-timeline');
  coverageTimelineCache = response.data as CoverageTimeline;
  coverageTimelineCacheTS = Date.now();
  return coverageTimelineCache;
}
