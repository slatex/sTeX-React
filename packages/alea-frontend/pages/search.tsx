import { Box } from '@mui/material';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import styles from '../styles/search.module.scss';
import { SearchBar } from '../components/SearchBar';
import { SearchResult, SearchResultView } from '../components/SearchResultView';
import MainLayout from '../layouts/MainLayout';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';

function getSearchRequest(query: string, types: string, ) {
  // TODO ALEA4-N12
  const url = `/:sTeX/search?query=${encodeURIComponent(query)}`;
  if (!types) return url;
  return url + `&types=${types}`;
}

export const SearchPage: NextPage = () => {
  const router = useRouter();
  const query = router.query.q as string;
  const types = router.query.t as string;
  const [results, setResults] = useState([] as SearchResult[]);
  const [totalHits, setTotalHits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    if (!query) {
      router.replace('/');
      return;
    }
    setIsLoading(true);
    setResults([]);
    axios.get(getSearchRequest(query, types)).then(
      (r) => {
        setIsLoading(false);
        setResults(r.data as SearchResult[]);
        setTotalHits(r.data.length);
      },
      (e) => {
        setIsLoading(false);
        console.log(e);
        setError(e);
      }
    );
  }, [query, types, router, router.isReady]);

  return (
    <MainLayout>
      <Box sx={{ m: '10px' }}>
        <Box sx={{ m: '0 auto', maxWidth: '800px' }}>
          <br />
          <Box width="100%" maxWidth="500px" m="auto">
            <SearchBar />
          </Box>
          <hr style={{ width: '90%' }} />
          {totalHits > 0 && (
            <span className={styles.info_line}>{totalHits} Results</span>
          )}
          {isLoading ? (
            <span className={styles.info_line}>Searching...</span>
          ) : (
            <>
              {!totalHits && (
                <span className={styles.no_results_line}>
                  <span>
                    There are no results for <b>{query}</b>
                  </span>
                </span>
              )}
            </>
          )}
          {results.map((result) => (
            <SearchResultView
              key={result.archive + result.filepath}
              result={result}
            />
          ))}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default SearchPage;
