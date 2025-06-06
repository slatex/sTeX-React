import { Box } from '@mui/material';
import { SafeHtml } from '@stex-react/react-utils';
import { convertHtmlStringToPlain } from '@stex-react/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../styles/search.module.scss';

export interface SearchResult {
  title: string;
  html: string;
}

interface SnippetPart {
  text: string;
  isEm: boolean;
}

export function SearchResultView({ result }: { result: SearchResult }) {
  const [plainBody, setPlainBody] = useState('');
  const [snippetParts, setSnippetParts] = useState([] as SnippetPart[]);
  useEffect(() => {
    const plain = convertHtmlStringToPlain(result.html);
    setPlainBody(plain);
    setSnippetParts([{ text: plain, isEm: false }]);
  }, [result.html]);

  return (
    <>
      {/* TODO ALEA4-N12 */}
      {/* <span className={styles.result_header_project}>{result.archive}</span>
      <i className={styles.result_header_sourcefile}>{result.filepath}</i> */}
      <Link
        href={
          // TODO ALEA4-N12
          // PathToArticle({
          //   archive: result.archive,
          //   filepath: texPathToXhtml(result.filepath),
          // })}
          ''
        }
        passHref
      >
        <a className={styles.result_title}>{result.title}</a>
      </Link>

      <Box sx={{ mb: '20px' }}>
        <SafeHtml html={result.html} />
        {snippetParts.map((part, idx) => (
          <span key={idx} style={{ fontWeight: part.isEm ? 'bold' : 'regular' }}>
            {part.text}&nbsp;
          </span>
        ))}
      </Box>
    </>
  );
}
