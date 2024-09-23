import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import {
  getCourseInfo,
  getDocumentSections,
  getRagResponse,
  isSection,
  SectionsAPIData,
} from '@stex-react/api';
import {
  DocumentWidthSetter,
  ExpandableContent,
  mmtHTMLToReact,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import { PRIMARY_COL, XhtmlContentUrl } from '@stex-react/utils';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

interface Reference {
  archive: string;
  filepath: string;
  courseId: string;
}

function findNearestSection(
  archive: string,
  filepath: string,
  rootNode: SectionsAPIData | undefined
): SectionsAPIData {
  if (!rootNode) {
    return null;
  }
  const ancestors = findAncestorsForFile(archive, filepath, rootNode);
  if (!ancestors) {
    return null;
  }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (isSection(ancestors[i])) {
      return ancestors[i];
    }
  }
  return null;
}

function findAncestorsForFile(
  archive: string,
  filepath: string,
  rootNode: SectionsAPIData
): SectionsAPIData[] | null {
  if (archive === rootNode.archive && filepath === rootNode.filepath) {
    return [rootNode];
  }

  if (!rootNode.children?.length) {
    return null;
  }
  for (const child of rootNode.children) {
    const result = findAncestorsForFile(archive, filepath, child);
    if (result) {
      return [rootNode, ...result];
    }
  }
  return null;
}

function ResultDocument({
  reference,
  courseId,
  sectionData,
}: {
  reference: Reference;
  courseId: string;
  sectionData: SectionsAPIData;
}) {
  const parentIdData = findNearestSection(
    reference.archive,
    `${reference.filepath}.xhtml`,
    sectionData
  );
  return (
    <DocumentWidthSetter>
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
          <Link
            href={`https://courses.voll-ki.fau.de/course-notes/${courseId}?inDocPath=~${parentIdData?.id}`}
          >
            {mmtHTMLToReact(parentIdData?.title || '')}
          </Link>
        </Typography>
        <hr />

        <ExpandableContent
          contentUrl={XhtmlContentUrl(reference.archive, `${reference.filepath}.xhtml`)}
          noFurtherExpansion
        />
      </Box>
    </DocumentWidthSetter>
  );
}

const SearchPage: NextPage = () => {
  const router = useRouter();
  const { query, courseId } = router.query as { query?: string; courseId?: string };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [sectionData, setSectionData] = useState<SectionsAPIData | undefined>();

  useEffect(() => {
    const fetchSectionData = async () => {
      if (!mmtUrl || !courseId) return;
      try {
        const courseInfo = await getCourseInfo(mmtUrl);
        const { notesArchive: archive, notesFilepath: filepath } = courseInfo[courseId] || {};
        if (archive && filepath) {
          const sections = await getDocumentSections(mmtUrl, archive, filepath);
          setSectionData(sections);
        }
      } catch (error) {
        console.error('Error fetching section data:', error);
      }
    };

    fetchSectionData();
  }, [courseId, mmtUrl]);

  useEffect(() => {
    if (!query || !courseId) return;
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await getRagResponse(query, courseId);
        setReferences(response?.sources || []);
      } catch (error) {
        console.error('Error fetching RAG response:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, courseId]);

  const handleSearch = () => {
    if (searchQuery) {
      router.push(`/search/${courseId}?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <MainLayout title="Search">
      <Box m="0 auto" maxWidth="800px">
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
              alt="ai-1"
              style={{ borderRadius: '5px', cursor: 'pointer' }}
              onClick={() => router.push(`/course-home/${courseId}`)}
            />
          </Tooltip>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={`Search in ${courseId || 'the'} course`}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: 'white',
              borderRadius: '30px',
            }}
            onKeyDown={handleKeyDown}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        {references.length > 0 && (
          <Typography sx={{ textAlign: 'center' }}>
            Results for &quot;<span style={{ fontWeight: 'bold' }}>{query}</span>&quot;
          </Typography>
        )}

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
                  />
                ))}
              </Box>
            </Box>
          )
        )}
      </Box>
    </MainLayout>
  );
};

export default SearchPage;
