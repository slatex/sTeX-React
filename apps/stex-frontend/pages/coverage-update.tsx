import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { NextPage } from 'next';
import { useContext, useEffect, useRef, useState } from 'react';
import { CoverageUpdater } from '../components/CoverageUpdater';
import MainLayout from '../layouts/MainLayout';
import axios from 'axios';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { SectionsAPIData } from 'libs/stex-react-renderer/src/lib/ContentDashboard';
import {
  COURSES_INFO,
  CoverageSnap,
  CoverageTimeline,
  convertHtmlStringToPlain,
} from '@stex-react/utils';
import { getAuthHeaders } from '@stex-react/api';

const courseIds = Object.keys(COURSES_INFO);

function getSectionNames(data: SectionsAPIData): string[] {
  const names = [];
  if (data.title?.length) names.push(convertHtmlStringToPlain(data.title));
  for (const c of data.children || []) {
    names.push(...getSectionNames(c));
  }
  return names;
}

const CoverageUpdatePage: NextPage = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ai-2');
  const [allSectionNames, setAllSectionNames] = useState<{
    [courseId: string]: string[];
  }>({});
  const [sectionNames, setSectionNames] = useState<string[]>([]);
  const [snaps, setSnaps] = useState<CoverageSnap[]>([]);
  const [coverageTimeline, setCoverageTimeline] = useState<CoverageTimeline>(
    {}
  );
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    axios
      .get('/api/get-coverage-timeline')
      .then((resp) => setCoverageTimeline(resp.data));
  }, []);

  useEffect(() => {
    async function getSections() {
      const secNames: { [courseId: string]: string[] } = {};
      for (const courseId of courseIds) {
        const { notesArchive, notesFilepath } = COURSES_INFO[courseId];
        const resp = await axios.get(
          `${mmtUrl}/:sTeX/sections?archive=${notesArchive}&filepath=${notesFilepath}`
        );
        secNames[courseId] = getSectionNames(resp.data as SectionsAPIData);
      }
      setAllSectionNames(secNames);
    }
    getSections();
  }, []);

  useEffect(() => {
    setSnaps(coverageTimeline[selectedCourseId] || []);
  }, [coverageTimeline, selectedCourseId]);

  useEffect(() => {
    setSectionNames(allSectionNames[selectedCourseId] || []);
  }, [allSectionNames, selectedCourseId]);

  return (
    <MainLayout title="Coverage Update | VoLL-KI">
      <Box px="10px" m="auto" maxWidth="800px">
        <FormControl sx={{ my: '10px' }}>
          <InputLabel id="course-select-label">Course</InputLabel>
          <Select
            labelId="course-select-label"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            label="Course"
          >
            {courseIds.map((courseId) => (
              <MenuItem key={courseId} value={courseId}>
                {courseId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <CoverageUpdater
          snaps={snaps}
          setSnaps={setSnaps}
          sectionNames={sectionNames}
        />
        <Button
          variant="contained"
          onClick={() => {
            const body = { courseId: selectedCourseId, snaps };
            const headers = getAuthHeaders();
            axios.post('/api/set-coverage-timeline', body, { headers }).then(
              () => alert('Saved'),
              (e) => alert(e)
            );
          }}
          sx={{ mt: '15px' }}
        >
          Save
        </Button>
      </Box>
    </MainLayout>
  );
};

export default CoverageUpdatePage;
