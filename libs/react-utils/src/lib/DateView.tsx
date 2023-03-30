import { useRouter } from 'next/router';
import { useEffect, useReducer } from 'react';
import { getLocaleObject } from './lang/utils';

const SECOND_MS = 1000;
const MIN_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30.416 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

// https://github.com/AndrewPoyntz/time-ago-pipe/blob/master/time-ago.pipe.ts

function replaceMarker(s: string, n: number) {
  return s.replace('$1', n.toString());
}

function fromNow(d: Date, t: any) {
  const now = new Date();
  const fromNowMs = Math.round(Math.abs(now.getTime() - d.getTime()));

  if (Number.isNaN(fromNowMs)) {
    return '';
  } else if (fromNowMs <= 45 * SECOND_MS) {
    return t.fewSecondsAgo;
  } else if (fromNowMs <= 90 * SECOND_MS) {
    return t.aMinuteAgo;
  } else if (fromNowMs <= 45 * MIN_MS) {
    return replaceMarker(t.xMinutesAgo, Math.round(fromNowMs / MIN_MS));
  } else if (fromNowMs <= 90 * MIN_MS) {
    return t.anHourAgo;
  } else if (fromNowMs <= 22 * HOUR_MS) {
    return replaceMarker(t.xHoursAgo, Math.round(fromNowMs / HOUR_MS));
  } else if (fromNowMs <= 36 * HOUR_MS) {
    return t.aDayAgo;
  } else if (fromNowMs <= 25 * DAY_MS) {
    return replaceMarker(t.xDaysAgo, Math.round(fromNowMs / DAY_MS));
  } else if (fromNowMs <= 45 * DAY_MS) {
    return t.aMonthAgo;
  } else if (fromNowMs <= 345 * DAY_MS) {
    return replaceMarker(t.xMonthsAgo, Math.round(fromNowMs / MONTH_MS));
  } else if (fromNowMs <= 545) {
    return t.aYearAgo;
  } else {
    // (days > 545)
    return replaceMarker(t.xYearsAgo, Math.round(fromNowMs / YEAR_MS));
  }
}

function getMsUntilUpdate(secondsBeforeNow: number) {
  return (
    minMsUntilUpdate(secondsBeforeNow) * 1000 + Math.floor(Math.random() * 1000)
  );
}

function minMsUntilUpdate(msBeforeNow: number) {
  if (msBeforeNow < MIN_MS) {
    // less than 1 min, update every 5 secs
    return 5;
  } else if (msBeforeNow < HOUR_MS) {
    // less than an hour, update every 30 secs
    return 30;
  } else if (msBeforeNow < DAY_MS) {
    return 600;
  } else {
    return 3600;
  }
}

export function DateView({
  timestampMs,
  style,
}: {
  timestampMs: number;
  style?: any;
}) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const msSinceUpdate = Math.round(
    Math.abs(new Date().getTime() - timestampMs)
  );
  const t = getLocaleObject(useRouter());
  const date = new Date(timestampMs);
  const fromNowString = fromNow(date, t);
  const hoverString = date.toLocaleTimeString('en-us', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  useEffect(() => {
    const timer = setInterval(
      (_) => forceUpdate(),
      getMsUntilUpdate(msSinceUpdate)
    );
    return () => clearInterval(timer);
  }, [msSinceUpdate]);

  return (
    <span
      title={hoverString}
      style={style || { display: 'inline', fontSize: '12px', color: 'grey' }}
    >
      {fromNowString}
    </span>
  );
}
