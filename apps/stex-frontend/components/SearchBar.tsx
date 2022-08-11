import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { Box } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/router';
import { useState } from 'react';

export function SearchBar() {
  const router = useRouter();
  const initialQuery = router.query.q as string;
  const [query, setQuery] = useState(initialQuery || '');

  function getEndAdornment() {
    if (!query) return null;
    return (
      <>
        <IconButton aria-label="Clear" onClick={() => setQuery('')}>
          <CloseIcon />
        </IconButton>
        <IconButton aria-label="Search" onClick={search}>
          <SearchIcon />
        </IconButton>
      </>
    );
  }

  function search() {
    if (!query) return;
    router.push(`/search?q=${query}`); //&types=${datasetId}
  }
  return (
    <Box display="block" sx={{ textAlign: 'center' }}>
      <FormControl variant="outlined" style={{ width: '100%' }}>
        <TextField
          type="text"
          sx={{ m: '0 auto', width: '100%' }}
          placeholder='Search articles...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            endAdornment: getEndAdornment(),
          }}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') search();
          }}
        />
      </FormControl>
    </Box>
  );
}
