import { Autocomplete, Box, createFilterOptions, TextField } from "@mui/material";
import { mmtHTMLToReact } from "mmtParser";
import { useRouter } from "next/router";
import { fixDuplicateLabels } from "utils";
import { RAW_TOURS } from "../tours";

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
      id="combo-box-demo"
      filterOptions={filterOptions}
      options={TOURS}
      renderInput={(params) => <TextField {...params} label="Browse Tour" />}
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
