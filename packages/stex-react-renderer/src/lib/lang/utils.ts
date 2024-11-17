import { Window } from '@stex-react/utils';
import { NextRouter } from 'next/router';
import { de } from './de';
import { en } from './en';

export function getLocaleObject(router?: NextRouter) {
  const locale = router?.locale ?? (Window as any)?.LANGUAGE;
  return locale === 'de' ? de : en;
}
export const toUserFriendlyName = (tabName: string) => {
  return tabName
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\b\w/g, (str) => str.toUpperCase()); // Capitalize the first letter of each word
};
export interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}