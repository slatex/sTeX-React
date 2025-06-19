import { CoverageTimeline } from '@stex-react/utils';
import axios from 'axios';

let coverageTimelineCache: CoverageTimeline | undefined = undefined;
let coverageTimelineCacheTS: number | undefined = undefined;
const COVERAGE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function isCacheValid(): boolean {
  if (!coverageTimelineCache || !coverageTimelineCacheTS) return false;
  return Date.now() < coverageTimelineCacheTS + COVERAGE_CACHE_TTL;
}

export async function getCoverageTimeline(forceRefresh = false): Promise<CoverageTimeline> {
  if (!forceRefresh && isCacheValid()) {
    return coverageTimelineCache!;
  }

  const response = await axios.get('/api/get-coverage-timeline');
  const coverageTimeline = response.data as CoverageTimeline;
  coverageTimelineCache = coverageTimeline;
  coverageTimelineCacheTS = Date.now();
  return coverageTimeline;
}
