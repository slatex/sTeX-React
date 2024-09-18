import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ProblemCard from './ProblemCard';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import {
  addReferences,
  ClickedButtons,
  extractQuestions,
  fetchAllVersions,
  fixDistractor,
  Problem,
  removeAmbiguity,
  ResponseData,
  VersionData,
} from '@stex-react/api';

const MCQComponent = ({ respData }) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showAllProblems, setShowAllProblems] = useState<boolean>(true);
  const [clickedButtons, setClickedButtons] = useState<ClickedButtons>({});
  const [currentProblems, setCurrentProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [versionsData, setVersionsData] = useState<VersionData[]>([]);
  const [matchingQuestionData, setMatchingQuestionData] = useState<VersionData | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [totalVersions, setTotalVersions] = useState<number>(1);
  const [responseData, setResponseData] = useState<ResponseData | null>(respData);

  function parseJsonString(jsonString: string): any[] {
    const cleanedString = jsonString.replace(/^[\s\S]*?###\s*|\s*###[\s\S]*$/g, '');

    try {
      const jsonObject = JSON.parse(cleanedString);
      return jsonObject;
    } catch (error) {
      console.error('throw new error', error);
      return [];
    }
  }

  useEffect(() => {
    if (respData !== responseData) {
      setResponseData(respData);
    }
  }, [respData]);

  useEffect(() => {
    if (versionsData && currentProblems.length > 0 && selectedVersion !== null) {
      const problemFound = versionsData.find(
        (item) =>
          item.version === selectedVersion &&
          item.id === Number(currentProblems[currentProblemIndex]?.id)
      );
      setMatchingQuestionData(problemFound);
    }
  }, [versionsData, currentProblems, selectedVersion, currentProblemIndex]);

  // useEffect(() => {
  //   //if extractQuestion property is false then we won't extract question and save it in db
  //   // We are saving all question for only new generartion otherwise only one modified question of phase 2
  //   if (responseData && responseData.extractQuestion) {
  //     const problems = parseJsonString(responseData.gptResponse);
  //      extractQuestions(problems, responseData);
  //   }
  // }, [responseData]);

  useEffect(() => {
    const extractAsyncQuestions = async () => {
      if (responseData && responseData.extractQuestion) {
        setLoading(true);
        try {
          const problems = parseJsonString(responseData.gptResponse);
          await extractQuestions(problems, responseData);
        } catch (error) {
          console.error('Error extracting questions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    extractAsyncQuestions();
  }, [responseData]);

  useEffect(() => {
    if (responseData.gptResponse) {
      let problems = parseJsonString(responseData.gptResponse);
      setCurrentProblemIndex(0);
      setSelectedVersion(1);
      if (!Array.isArray(problems)) {
        problems = [problems];
      }
      setCurrentProblems(problems);
    }
  }, [responseData.gptResponse]);

  useEffect(() => {
    const generationId = responseData?.generationId;
    if (currentProblems.length > 0 && generationId) {
      fetchAndSetVersions(generationId, setVersionsData);
    }
  }, [currentProblems, currentProblemIndex, responseData]);

  const fetchAndSetVersions = async (
    generationId: number,
    setVersionsData: (data: VersionData[]) => void
  ) => {
    try {
      const versionData = await fetchAllVersions(generationId);
      setVersionsData(versionData.questions);
    } catch (error) {
      console.error('Error in getting versions data ', error);
    }
  };

  const handleVersionClick = (version: number, matchingQuestion: VersionData) => {
    setSelectedVersion(version);
    setMatchingQuestionData(matchingQuestion);
  };
  const getUniqueVersions = (): number[] => {
    const problemId = currentProblems[currentProblemIndex]?.id;
    const versions = new Set<number>();
    versionsData?.forEach((item) => {
      if (item.id === Number(problemId)) {
        versions.add(item.version);
      }
    });
    return Array.from(versions).sort((a, b) => (a as number) - (b as number));
  };
  useEffect(() => {
    const uniqueVersions = getUniqueVersions();
    setTotalVersions(uniqueVersions.length);
  }, [currentProblems, currentProblemIndex, versionsData]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setSelectedOptions({
      ...selectedOptions,
      [index]: event.target.value,
    });
  };
  const handleNext = () => {
    if (currentProblemIndex < currentProblems.length - 1) {
      setCurrentProblemIndex((prevIndex) => prevIndex + 1);
      setSelectedVersion(1);
    }
  };

  const handlePrevious = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex((prevIndex) => prevIndex - 1);
      setSelectedVersion(1);
    }
  };

  const handleShowAll = () => {
    setShowAllProblems(!showAllProblems);
  };

  const handleButtonClick = async (index, buttonName) => {
    setLoading(true);
    setClickedButtons((prev) => ({
      ...prev,
      [index]: buttonName,
    }));

    const currentProblem = currentProblems[index];
    switch (buttonName) {
      case 'Add References':
        try {
          const generationId = responseData?.generationId;
          const response = await addReferences(currentProblem, generationId);
          const updatedGptResponse = response?.updatedGptResponse;
          const newProblems = parseJsonString(updatedGptResponse);
          await extractQuestions(newProblems, response.generationObj);
          if (currentProblems.length > 0 && generationId) {
            await fetchAndSetVersions(generationId, setVersionsData);
          }
          setSelectedVersion(totalVersions + 1);
        } catch (error) {
          console.error('Error updating problems:', error);
        } finally {
          setLoading(false);
        }
        break;

      case 'More Problems':
        setLoading(false);
        break;

      case 'Edit':
        setLoading(false);
        break;

      case 'Fix Distractor':
        try {
          const generationId = responseData?.generationId;
          if (!generationId) return;
          const response = await fixDistractor(currentProblem, generationId);
          const updatedGptResponse = response?.updatedGptResponse;
          if (!updatedGptResponse) return;
          const newProblems = parseJsonString(updatedGptResponse);
          await extractQuestions(newProblems, response.generationObj);
          if (currentProblems.length > 0 && generationId) {
            await fetchAndSetVersions(generationId, setVersionsData);
          }
          setSelectedVersion(totalVersions + 1);
        } catch (error) {
          console.error('Error updating problems:', error);
        } finally {
          setLoading(false);
        }
        break;
      case 'Remove Ambiguity':
        try {
          const generationId = responseData?.generationId;
          const response = await removeAmbiguity(currentProblem, generationId);
          const updatedGptResponse = response?.updatedGptResponse;
          const newProblems = parseJsonString(updatedGptResponse);
          await extractQuestions(newProblems, response.generationObj);
          if (currentProblems.length > 0 && generationId) {
            await fetchAndSetVersions(generationId, setVersionsData);
          }
          setSelectedVersion(totalVersions + 1);
        } catch (error) {
          console.error('Error updating problems:', error);
        } finally {
          setLoading(false);
        }
        break;

      default:
        console.log('Unknown button clicked');
        break;
    }
  };

  const buttons = [
    { name: 'More Problems', label: 'More Problems' },
    { name: 'Add References', label: 'Add References' },
    { name: 'Edit', label: 'Edit' },
    { name: 'Fix Distractor', label: 'Fix Distractor' },
    { name: 'Remove Ambiguity', label: 'Remove Ambiguity' },
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 3 }}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Box
          sx={{
            opacity: loading ? 0.5 : 1,
            pointerEvents: loading ? 'none' : 'auto',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '600px',
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: 'background.paper',
              display: showAllProblems ? 'block' : 'none',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Question {currentProblemIndex + 1} of {currentProblems?.length}
            </Typography>

            <Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={handlePrevious}
                disabled={currentProblemIndex === 0}
                sx={{ mr: 1 }}
              >
                <ArrowBackIosIcon fontSize="small" />
                Prev
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleNext}
                disabled={currentProblemIndex === currentProblems?.length - 1}
              >
                Next
                <ArrowForwardIosIcon sx={{ ml: 0.3 }} fontSize="small" />
              </Button>
            </Box>

            {getUniqueVersions().map((version) => {
              const currentProblem = currentProblems[currentProblemIndex];
              const matchingQuestion = versionsData.find(
                (item) => item.version === version && item.id === Number(currentProblem?.id)
              );

              // const questionText = matchingQuestion
              //   ? JSON.parse(matchingQuestion.question)?.question
              //   : 'No question found';

              return (
                <Button
                  key={version}
                  variant={version === selectedVersion ? 'contained' : 'outlined'} // Conditional variant
                  sx={{ m: 1 }}
                  onClick={() => handleVersionClick(version, matchingQuestion)}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body1">Version {version}</Typography>

                    <Typography variant="caption" color="secondary" style={{ fontSize: '0.65rem' }}>
                      {matchingQuestion?.modificationType}
                    </Typography>
                  </div>
                </Button>
              );
            })}

            {/* {selectedVersion !== null && ( */}
            {versionsData.length > 0 && selectedVersion !== null && (
              <Box sx={{ mt: 2 }}>
                {matchingQuestionData && matchingQuestionData.question ? (
                  <ProblemCard
                    key={currentProblemIndex}
                    problem={JSON.parse(matchingQuestionData.question)}
                    selectedOption={selectedOptions[currentProblemIndex]}
                    onOptionChange={(e) => handleOptionChange(e, currentProblemIndex)}
                  />
                ) : (
                  <Typography variant="body1" color="error">
                    Faced some problem , Click Next or Try Again!
                  </Typography>
                )}
              </Box>
            )}
            <Box display="flex" flexDirection="row" gap={1} sx={{ mt: 2 }}>
              {buttons.map((btn) => (
                <Button
                  key={btn.name}
                  variant={
                    clickedButtons[currentProblemIndex] === btn.name ? 'contained' : 'outlined'
                  }
                  onClick={() => handleButtonClick(currentProblemIndex, btn.name)}
                  sx={{
                    backgroundColor:
                      clickedButtons[currentProblemIndex] === btn.name
                        ? 'rgb(32, 51, 96)'
                        : 'white',
                    color:
                      clickedButtons[currentProblemIndex] === btn.name
                        ? 'white'
                        : 'rgb(32, 51, 96)',
                    borderColor: 'rgb(32, 51, 96)',
                  }}
                >
                  {btn.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleShowAll}
            sx={{
              mt: 2,
              backgroundColor: 'rgb(32, 51, 96)',
              color: 'white',
              borderColor: 'rgb(32, 51, 96)',
              '&:hover': {
                backgroundColor: showAllProblems ? 'rgba(32, 51, 96, 0.1)' : 'rgb(32, 51, 96)',
                color: showAllProblems ? 'rgb(32, 51, 96)' : 'white',
              },
              '&:focus': {
                backgroundColor: 'rgb(32, 51, 96)',
                color: 'white',
              },
            }}
          >
            {showAllProblems ? 'Hide Problems' : 'Show Problems'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MCQComponent;
