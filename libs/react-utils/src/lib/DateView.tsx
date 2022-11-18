import { useEffect, useReducer } from 'react';

const SECOND_MS = 1000;
const MIN_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30.416 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

// https://github.com/AndrewPoyntz/time-ago-pipe/blob/master/time-ago.pipe.ts

function fromNow(d: Date) {
  const now = new Date();
  const fromNowMs = Math.round(Math.abs(now.getTime() - d.getTime()));

  if (Number.isNaN(fromNowMs)) {
    return '';
  } else if (fromNowMs <= 45 * SECOND_MS) {
    return 'a few seconds ago';
  } else if (fromNowMs <= 90 * SECOND_MS) {
    return 'a minute ago';
  } else if (fromNowMs <= 45 * MIN_MS) {
    return Math.round(fromNowMs / MIN_MS) + ' minutes ago';
  } else if (fromNowMs <= 90 * MIN_MS) {
    return 'an hour ago';
  } else if (fromNowMs <= 22 * HOUR_MS) {
    return Math.round(fromNowMs / HOUR_MS) + ' hours ago';
  } else if (fromNowMs <= 36 * HOUR_MS) {
    return 'a day ago';
  } else if (fromNowMs <= 25 * DAY_MS) {
    return Math.round(fromNowMs / DAY_MS) + ' days ago';
  } else if (fromNowMs <= 45 * DAY_MS) {
    return 'a month ago';
  } else if (fromNowMs <= 345 * DAY_MS) {
    return Math.round(fromNowMs / MONTH_MS) + ' months ago';
  } else if (fromNowMs <= 545) {
    return 'a year ago';
  } else {
    // (days > 545)
    return Math.round(fromNowMs / YEAR_MS) + ' years ago';
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
  const date = new Date(timestampMs);
  const fromNowString = fromNow(date);
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
