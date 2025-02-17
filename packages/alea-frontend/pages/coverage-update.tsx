import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import {
  SectionsAPIData,
  getAuthHeaders,
  getCourseInfo,
  getDocumentSections,
} from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  CourseInfo,
  CoverageSnap,
  CoverageTimeline,
  convertHtmlStringToPlain,
} from '@stex-react/utils';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { CoverageUpdater } from '../components/CoverageUpdater';
import MainLayout from '../layouts/MainLayout';

function getSectionNames(data: SectionsAPIData, level = 0): string[] {
  const names = [];
  if (data.title?.length)
    names.push('\xa0'.repeat(level * 4) + convertHtmlStringToPlain(data.title));
  for (const c of data.children || []) {
    names.push(...getSectionNames(c, level + (data.title?.length ? 1 : 0)));
  }
  return names;
}

const CoverageUpdatePage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const [allSectionNames, setAllSectionNames] = useState<{
    [courseId: string]: string[];
  }>({});
  const [sectionNames, setSectionNames] = useState<string[]>([]);
  const [snaps, setSnaps] = useState<CoverageSnap[]>([]);
  const [coverageTimeline, setCoverageTimeline] = useState<CoverageTimeline>({});
  const { mmtUrl } = useContext(ServerLinksContext);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});

  useEffect(() => {
    axios.get('/api/get-coverage-timeline').then((resp) => setCoverageTimeline(resp.data));
  }, []);

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    async function getSections() {
      const secNames: { [courseId: string]: string[] } = {};
      for (const courseId of Object.keys(courses)) {
        const { notesArchive: a, notesFilepath: f } = courses[courseId];
        const docSections = await getDocumentSections(mmtUrl, a, f);
        secNames[courseId] = getSectionNames(docSections);
      }
      setAllSectionNames(secNames);
    }
    getSections();
  }, [mmtUrl, courses]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    setSnaps(coverageTimeline[courseId] || []);
  }, [coverageTimeline, courseId, router.isReady]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    setSectionNames(allSectionNames[courseId] || []);
  }, [allSectionNames, courseId, router.isReady]);

  return (
    <MainLayout title="Coverage Update | ALeA">
      <Box px="10px" m="auto" maxWidth="1200px" display="flex" flexDirection="column">
        <FormControl sx={{ my: '10px', width: '150px' }}>
          <InputLabel id="course-select-label">Course</InputLabel>
          <Select
            labelId="course-select-label"
            value={courseId ?? 'ai-2'}
            onChange={(e) => {
              const { pathname, query } = router;
              query.courseId = e.target.value;
              router.replace({ pathname, query });
            }}
            label="Course"
          >
            {Object.keys(courses).map((courseId) => (
              <MenuItem key={courseId} value={courseId}>
                {courseId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <CoverageUpdater snaps={snaps} setSnaps={setSnaps} sectionNames={sectionNames} />
        <Button
          variant="contained"
          onClick={() => {
            const confirmText =
              "Did you make sure to click 'Add' button to add entries to the table?";
            if (!confirm(confirmText)) return;

            const body = { courseId, snaps };
            const headers = getAuthHeaders();
            axios.post('/api/set-coverage-timeline', body, { headers }).then(
              () => console.log('Saved coverage.'),
              (e) => alert(e)
            );
          }}
          sx={{ mt: '15px' }}
        >
          Save
        </Button>
        <span style={{ color: 'red', display: 'flex', marginTop: '10px' }}>
          Your changes will not be saved till you click &apos;Save&apos;.
        </span>
      </Box>
    </MainLayout>
  );
};

export default CoverageUpdatePage;
