import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Typography,
  Card,
  Chip,
  FormControl,
  Checkbox,
  ListItemText,
  Button,
  Paper,
} from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import { PRIMARY_COL } from '@stex-react/utils';
import { sparqlQuery } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import ProblemFetcher from '../components/ProblemFetcher';
import DefinitionFetcher from '../components/DefinitionFetcher';
import { PracticeQuestions } from 'packages/stex-react-renderer/src/lib/PracticeQuestions';
import DefinitionsViewer from '../components/DefinitionsViewer';
import ExamplesViewer from '../components/ExamplesViewer';

const FilterPage = () => {
  const [concept, setConcept] = useState('');
  const [conceptMode, setConceptMode] = useState([]);
  const [learningObject, setLearningObject] = useState([]);
  const [course, setCourse] = useState([]);

  const [selectedUri, setSelectedUri] = useState(null);

  const conceptModes = ['Appears Anywhere', 'Annotated as Prerequisite', 'Annotated as Objective'];
  const learningObjects = ['Example', 'Problem', 'Definition', 'Slides', 'Video Snippets'];
  const courses = ['AI1', 'AI2'];
  const [clickedButton, setClickedButton] = useState(null);

  const { mmtUrl } = useContext(ServerLinksContext);
  const handleSelectAll = (setState, items) => {
    setState((prev) => (prev.length === items.length ? [] : items));
  };

  const [uris, setUris] = useState([]);
  console.log({ uris });
  const fetchLearningObjects = async (concept) => {
    if (!concept.trim()) {
      alert('Please enter a concept!');
      return;
    }

    const query = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ulo: <http://mathhub.info/ulo#>

SELECT DISTINCT ?learningObject ?type
WHERE {
  ?learningObject rdf:type ?type .
  FILTER(?type IN (ulo:definition, ulo:problem, ulo:example)).
  FILTER(CONTAINS(STR(?learningObject), "${concept}")).
}
`;

    try {
      const response = await sparqlQuery(mmtUrl, query);
      console.log({ response });

      const bindings = response.results.bindings;
      const typeMap = {};

      bindings.forEach(({ learningObject, type }) => {
        const typeKey = type.value.split('#')[1];
        if (!typeMap[typeKey]) {
          typeMap[typeKey] = [];
        }
        typeMap[typeKey].push(learningObject.value);
      });

      console.log('Grouped URIs:', typeMap);
      setUris(typeMap);
    } catch (error) {
      console.error('Error fetching learning objects:', error);
      alert('Failed to fetch learning objects. Please try again.');
    }
  };

  const handleClick = () => {
    fetchLearningObjects(concept);
  };
  console.log({ clickedButton });
  const renderDropdownLabel = (selected) =>
    selected.length > 0 ? selected.slice(0, 2).join(', ') + (selected.length > 2 ? '...' : '') : '';

  const renderChips = (label, items, setItems) =>
    items.map((item) => (
      <Chip
        key={item}
        label={`${label}: ${item}`}
        onDelete={() => setItems((prev) => prev.filter((i) => i !== item))}
        sx={{
          margin: '4px',
          padding: '4px 8px',
          backgroundColor:
            label === 'Concept Mode'
              ? '#b3e5fc'
              : label === 'Learning Object'
              ? '#fbe9e7'
              : label === 'Course'
              ? '#c8e6c9'
              : 'rgba(224, 224, 224, 0.4)',

          fontSize: '0.875rem',
          borderRadius: '16px',
        }}
      />
    ));

  return (
    <MainLayout title="LearningObjects">
      <Paper
        elevation={3}
        sx={{
          margin: '16px',
        }}
      >
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            color: '#333',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              marginBottom: '20px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: PRIMARY_COL,
            }}
          >
            Filter Learning Objects
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {/* First Row: TextField and Button */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: '10px',
                width: '100%',
              }}
            >
              <TextField
                fullWidth
                label="Enter Concept"
                variant="outlined"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
              />
              <Button variant="contained" sx={{ width: '250px' }} onClick={handleClick}>
                Submit
              </Button>
            </Box>

            {/* Second Row: Dropdowns */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: '16px',
                width: '100%',
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="concept-mode-label">Concept Modes</InputLabel>
                <Select
                  labelId="concept-mode-label"
                  label="Concept Modes"
                  multiple
                  value={conceptMode}
                  onChange={(e) => setConceptMode(e.target.value)}
                  displayEmpty
                  renderValue={() => renderDropdownLabel(conceptMode)}
                >
                  {conceptModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      <Checkbox checked={conceptMode.includes(mode)} />
                      <ListItemText primary={mode} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="learning-object-type-label">Learning Object Types</InputLabel>
                <Select
                  labelId="learning-object-type-label"
                  label="Learning Object Types"
                  multiple
                  value={learningObject}
                  displayEmpty
                  onChange={(e) => setLearningObject(e.target.value)}
                  renderValue={() => renderDropdownLabel(learningObject)}
                >
                  {learningObjects.map((object) => (
                    <MenuItem key={object} value={object}>
                      <Checkbox checked={learningObject.includes(object)} />
                      <ListItemText primary={object} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="courses-label">Courses</InputLabel>
                <Select
                  labelId="courses-label"
                  label="Courses"
                  multiple
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  displayEmpty
                  renderValue={() => renderDropdownLabel(course)}
                >
                  {courses.map((item) => (
                    <MenuItem key={item} value={item}>
                      <Checkbox checked={course.includes(item)} />
                      <ListItemText primary={item} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box
            sx={{
              marginBottom: '20px',
              display: 'flex',
              overflowX: 'auto',
              maxHeight: '40px',
              borderRadius: '8px',
              padding: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#f9f9f9',
            }}
          >
            {renderChips('Concept Mode', conceptMode, setConceptMode)}
            {renderChips('Learning Object', learningObject, setLearningObject)}
            {renderChips('Course', course, setCourse)}
          </Box>

          {/* <Box sx={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap' }}>
            {renderChips('Concept Mode', conceptMode, setConceptMode)}
            {renderChips('Learning Object', learningObject, setLearningObject)}
            {renderChips('Course', course, setCourse)}
          </Box> */}

          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            {learningObject.map((lo) => (
              <Button
                key={lo}
                variant={clickedButton === lo ? 'contained' : 'outlined'}
                sx={{
                  // width: '100%',
                  backgroundColor: clickedButton === lo ? 'primary.main' : 'transparent',
                  color: clickedButton === lo ? 'white' : 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                  },
                }}
                onClick={() => setClickedButton(lo)}
              >
                {lo}
              </Button>
            ))}
          </Box>

          <Box>
            {/* For Problems */}
            {clickedButton === 'Problem' && uris?.problem?.length > 0 ? (
              <Box sx={{ margin: '40px' }}>
                <PracticeQuestions problemIds={uris.problem} />
              </Box>
            ) : (
              clickedButton === 'Problem' && <Typography>No Problems Available</Typography>
            )}

            {/* For Definitions */}
            {clickedButton === 'Definition' && uris?.definition?.length > 0 ? (
              <Box sx={{ margin: '40px' }}>
                <DefinitionsViewer uris={uris.definition} />
              </Box>
            ) : (
              clickedButton === 'Definition' && <Typography>No Definitions Available</Typography>
            )}

            {/* For Examples */}
            {clickedButton === 'Example' && uris?.example?.length > 0 ? (
              <Box sx={{ margin: '40px' }}>
                <ExamplesViewer uris={uris.example} />
              </Box>
            ) : (
              clickedButton === 'Example' && <Typography>No Examples Available</Typography>
            )}
          </Box>
          {/* URI Boxes */}
          {/* <Box sx={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
            <Box
              sx={{
                flex: 1,
                background: 'rgba(240, 240, 255, 0.9)',
                borderRadius: '8px',
                padding: '16px',
                overflowY: 'auto',
                height: '300px',
                boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6">Filtered URIs</Typography>
              {uris.map((uri, index) => (
                <Typography
                  key={index}
                  onClick={() => setSelectedUri(uri)}
                  sx={{
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    '&:hover': { background: '#eef', fontWeight: 'bold' },
                  }}
                >
                  {uri}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                flex: 1,
                background: 'rgba(240, 255, 240, 0.9)',
                borderRadius: '8px',
                padding: '16px',
                height: '300px',
                boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6">Details</Typography>
              {selectedUri ===
              'http://mathhub.info/courses/FAU/AI/problems/planning/quiz/planning8.en.omdoc?en?341bd3d5' ? (
                <PracticeQuestions problemIds={[selectedUri]} />
              ) : (
                // <ProblemFetcher link={selectedUri} onSubmit={null} />
                <DefinitionFetcher link={selectedUri} />
                // <Card sx={{ padding: '16px', background: 'white' }}>
                //   <Typography>{`Details for ${selectedUri}`}</Typography>
                // </Card>
                // <Typography>Select a URI to view details</Typography>
              )}
            </Box>
          </Box> */}

          {/* Filter Button */}
          {/* <Box sx={{ textAlign: 'right', marginTop: '20px' }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                padding: '10px 20px',
                borderRadius: '20px',
              }}
            >
              Apply Filters
            </Button>
          </Box> */}
        </Box>
      </Paper>
    </MainLayout>
  );
};

export default FilterPage;
