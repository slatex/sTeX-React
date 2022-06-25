import { Autocomplete, Box, createFilterOptions, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { fixDuplicateLabels } from "../utils";
import { BROWSER_FILES } from "../files";

interface BrowserItem {
  project: string;
  filepath: string;
  label: string;
  language: string;
}

function getBrowserItems() {
  const items: BrowserItem[] = [];
  for (const [project, files] of Object.entries(BROWSER_FILES)) {
    for (const filepath of files) {
      const filename = filepath.substring(filepath.lastIndexOf("/") + 1);
      let label = filename.substring(0, filename.length - 4);

      const langStart = label.lastIndexOf(".");
      const language = langStart === -1 ? "" : label.substring(langStart + 1);

      if (langStart !== -1) {
        label = label.substring(0, langStart) + ` (${language})`;
      }

      items.push({ project, filepath, label, language });
    }
  }
  return fixDuplicateLabels(items);
}

const BROWSER_ITEMS = getBrowserItems();

function OptionDisplay({ item }: { item: BrowserItem }) {
  const flag = { de: "de", en: "gb", zhs: "cn", fr: "fr" }[item.language] || "gb";
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element*/}
      <img
        loading="lazy"
        width="20"
        src={`https://flagcdn.com/w20/${flag}.png`}
        srcSet={`https://flagcdn.com/w40/${flag}.png 2x`}
        alt=""
        style={{ marginRight: "10px" }}
      />
      <span>{item.label}</span>
      <span
        style={{
          color: "white",
          backgroundColor: "gray",
          display: "inline",
          borderRadius: "5px",
          fontSize: "10px",
          padding: "4px",
          marginLeft: "10px",
        }}
      >
        {item.project}
      </span>
    </>
  );
}

// Limit number of options rendered at a time to improve performance.
const filterOptions = createFilterOptions({
  matchFrom: "any",
  limit: 300,
});

export function BrowserAutocomplete() {
  const router = useRouter();
  return (
    <Autocomplete
      id="combo-box-demo"
      filterOptions={filterOptions}
      options={BROWSER_ITEMS}
      sx={{ minWidth: 300, maxWidth: 600, m: "auto" }}
      renderInput={(params) => <TextField {...params} label="Browse Article" />}
      renderOption={(props, option) => {
        return (
          <Box component="li" {...props}>
            {<OptionDisplay item={option as BrowserItem} />}
          </Box>
        );
      }}
      onChange={(_e, n) => {
        const item = n as BrowserItem;
        const fPath = item.filepath.substring(1, item.filepath.length - 3) + "xhtml";
        const path = `:sTeX/document?archive=${item.project}&filepath=${fPath}`;
        const encoded = encodeURIComponent(path);
        router.push("/browser/" + encoded);
      }}
    />
  );
}
