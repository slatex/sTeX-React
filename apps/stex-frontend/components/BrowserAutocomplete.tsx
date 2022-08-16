import {
  Autocomplete,
  Box,
  createFilterOptions,
  TextField,
} from '@mui/material';
import { fixDuplicateLabels, PathToArticle } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { ARTICLE_LIST } from '../article-list';
import styles from '../index.module.scss';

interface BrowserItem {
  project: string;
  filepath: string;
  label: string;
  language: string;
}

function getBrowserItems(browserItems: { [project: string]: string[] }) {
  const items: BrowserItem[] = [];
  for (const [project, files] of Object.entries(browserItems)) {
    for (const filepath of files) {
      const filename = filepath.substring(filepath.lastIndexOf('/') + 1);
      let label = filename.substring(0, filename.length - 6);

      const langStart = label.lastIndexOf('.');
      const language = langStart === -1 ? '' : label.substring(langStart + 1);

      if (langStart !== -1) {
        label = label.substring(0, langStart) + ` (${language})`;
      }

      items.push({ project, filepath, label, language });
    }
  }
  return fixDuplicateLabels(items);
}

const BROWSER_ITEMS = getBrowserItems(ARTICLE_LIST);

function OptionDisplay({ item }: { item: BrowserItem }) {
  const flag =
    { de: 'de', en: 'gb', zhs: 'cn', fr: 'fr' }[item.language] || 'gb';
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element*/}
      <img
        loading="lazy"
        width="20"
        src={`https://flagcdn.com/w20/${flag}.png`}
        srcSet={`https://flagcdn.com/w40/${flag}.png 2x`}
        alt=""
        style={{ marginRight: '10px' }}
      />
      <span>{item.label}</span>
      <span className={styles['brower_autocomplete_project']}>
        {item.project}
      </span>
    </>
  );
}

// Limit number of options rendered at a time to improve performance.
const filterOptions = createFilterOptions({
  matchFrom: 'any',
  limit: 70,
});

export function BrowserAutocomplete() {
  const router = useRouter();

  return (
    <Autocomplete
      size="small"
      id="combo-box-demo"
      filterOptions={filterOptions}
      options={BROWSER_ITEMS}
      className={styles['browser_autocomplete']}
      renderInput={(params) => <TextField {...params} label="Open Article" />}
      renderOption={(props, option) => {
        return (
          <Box component="li" {...props}>
            {<OptionDisplay item={option as BrowserItem} />}
          </Box>
        );
      }}
      onChange={(_e, n) => {
        if (!n) return;
        const item = n as BrowserItem;
        router.push(PathToArticle(item.project, item.filepath));
      }}
    />
  );
}
