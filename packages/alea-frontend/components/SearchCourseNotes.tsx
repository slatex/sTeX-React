import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { getCourseInfo, GptSearchResult, searchCourseNotes } from '@stex-react/api';
import { SafeHtml } from '@stex-react/react-utils';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { PRIMARY_COL } from '@stex-react/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useContext, useEffect, useState } from 'react';

function findAncestorsForFile<T>(
  archive: string,
  filepath: string,
  rootNode: T // SectionsAPIData
): T[] | null {
  // TODO ALEA4-N12
  // if (archive === rootNode.archive && filepath === rootNode.filepath) {
  //   return [rootNode];
  // }
  // if (!rootNode.children?.length) return null;
  // for (const child of rootNode.children) {
  //   const result = findAncestorsForFile(archive, filepath, child);
  //   if (result) return [rootNode, ...result];
  // }
  return null;
}

function ResultDocument({
  reference,
  courseId,
  sectionData,
  onClose,
}: {
  reference: GptSearchResult;
  courseId: string;
  sectionData: any; // SectionsAPIData;
  onClose?: any;
}) {
  const parentIdData = null;
  // TODO ALEA4-N12
  //  = findNearestSection(
  //   reference.archive,
  //   `${reference.filepath}.xhtml`,
  //   sectionData
  // );
  return (
    <Box
      sx={{
        borderRadius: '5px',
        my: '20px',
        p: '5px',
        boxShadow: '5px 5px 10px gray',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          my: '10px',
          color: PRIMARY_COL,
          textAlign: 'center',
        }}
      >
        <Link href={`/course-notes/${courseId}?inDocPath=~${parentIdData?.id}`} onClick={onClose}>
          <SafeHtml html={parentIdData?.title || ''} />
        </Link>
      </Typography>
      <hr />
      {/* TODO ALEA4-N12
        <ExpandableContent
          contentUrl={"we will use FTMLVIEWER"}
          noFurtherExpansion
        />
        */}
    </Box>
  );
}

const SearchCourseNotes = ({
  courseId,
  query,
  onClose,
}: {
  courseId: string;
  query?: string;
  onClose?: any;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>(query);
  const [references, setReferences] = useState<GptSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sectionData, setSectionData] = useState<undefined>();

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    const fetchSectionData = async () => {
      if (!courseId) return;
      try {
        const courseInfo = await getCourseInfo();
        //TODO ALEA4-N12
        // const { notesArchive: archive, notesFilepath: filepath } = courseInfo[courseId] || {};
        // if (archive && filepath) {
        //   const sections = await getDocumentSections( archive, filepath);
        //   setSectionData(sections);
        // }
      } catch (error) {
        console.error('Error fetching section data:', error);
      }
    };

    fetchSectionData();
  }, [courseId]);

  async function handleSearch() {
    if (!searchQuery || !courseId) return;
    setIsLoading(true);
    try {
      const response = await searchCourseNotes(searchQuery, courseId);
      setReferences(response?.sources || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px',
          maxWidth: '800px',
          margin: '0 auto',
          gap: '10px',
        }}
      >
        <Tooltip title={courseId}>
          <img
            height="60px"
            src={`\\${courseId}.jpg`}
            alt={courseId}
            style={{ borderRadius: '5px', cursor: 'pointer' }}
            onClick={() => router.push(`/course-home/${courseId}`)}
          />
        </Tooltip>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={`Search in ${courseId.toUpperCase() || 'the'} notes`}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          onKeyDown={handleKeyDown}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        references.length > 0 && (
          <Box bgcolor="white" borderRadius="5px" mb="15px" p="10px">
            <Box maxWidth="800px" m="0 auto" p="10px">
              {references.map((reference, idx) => (
                <ResultDocument
                  reference={reference}
                  courseId={courseId}
                  key={idx}
                  sectionData={sectionData}
                  onClose={onClose}
                />
              ))}
            </Box>
          </Box>
        )
      )}
    </Box>
  );
};

export default SearchCourseNotes;
