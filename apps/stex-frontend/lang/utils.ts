import { de } from "./de";
import { en } from "./en";

export function getLocaleObject({ locale }: { locale?: string }) {
  return locale === 'en' ? en : de;
}
