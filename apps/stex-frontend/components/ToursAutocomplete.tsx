import { Autocomplete, Box, createFilterOptions, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { fixDuplicateLabels } from "../utils";
import { RAW_TOURS } from "../tours";
import { mmtHTMLToReact } from "@stex-react/stex-react-renderer";

export const TOURS = fixDuplicateLabels(RAW_TOURS);

// Limit number of options rendered at a time to improve performance.
const filterOptions = createFilterOptions({
  matchFrom: "any",
  limit: 300,
});

export function ToursAutocomplete() {
  const router = useRouter();
  return (
    <Autocomplete
      size="small"
      id="combo-box-demo"
      filterOptions={filterOptions}
      options={TOURS}
      renderInput={(params) => <TextField {...params} label="Start Tour" />}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {mmtHTMLToReact((option as any).label)}
        </Box>
      )}
      onChange={(_e, n: any) => {
        const encoded = encodeURIComponent(n.value);
        if (encoded) router.push("/guided-tour/" + encoded);
      }}
    />
  );
}
