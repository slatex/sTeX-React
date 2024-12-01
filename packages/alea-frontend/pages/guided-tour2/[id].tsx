import { Box, Typography } from '@mui/material';
import { getLeafConcepts, getLearningObjects, LoType } from '@stex-react/api';
import { useRouter } from 'next/router';
import DefinitionFetcher from 'packages/alea-frontend/components/DefinitionFetcher';
import DiagnosticTool from 'packages/alea-frontend/components/DiagnosticTool';
import ExampleFetcher from 'packages/alea-frontend/components/ExampleFetcher';
import ProblemFetcher from 'packages/alea-frontend/components/ProblemFetcher';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { useEffect, useRef, useState } from 'react';
import styles from './guided-tour.module.scss';
import {
  comfortPrompts,
  definitionComfortPrompts,
  definitionMessages,
  exampleComfortPrompts,
  exampleMessages,
  feedbackMessages,
  initializeMessages,
  negativeResponses,
  nextConceptsPrompts,
  positiveResponses,
  problemComfortPrompts,
  problemMessages,
  responseOptions,
  unsureResponses,
} from './messages';

const STATES = {
  COMFORT: 'comfort',
  DEFINITION: 'definition',
  PROBLEM: 'problem',
  EXAMPLE: 'example',
  NEXT_CONCEPT: 'next_concept',
};
const categorizeResponse = (response: string): 'yes' | 'no' | 'notSure' => {
  const normalizedResponse = response.toLowerCase().trim();
  if (positiveResponses.some((word) => normalizedResponse === word)) {
    return 'yes';
  }

  if (negativeResponses.some((word) => normalizedResponse === word)) {
    return 'no';
  }

  if (unsureResponses.some((word) => normalizedResponse === word)) {
    return 'notSure';
  }

  if (positiveResponses.some((word) => normalizedResponse.includes(word))) {
    return 'yes';
  }

  if (negativeResponses.some((word) => normalizedResponse.includes(word))) {
    return 'no';
  }

  if (unsureResponses.some((word) => normalizedResponse.includes(word))) {
    return 'notSure';
  }

  return 'notSure';
};

export const getRandomMessage = (messagesArray, context) => {
  const template = messagesArray[Math.floor(Math.random() * messagesArray.length)];
  return template.replace('{{concept}}', context);
};

const getRandomMessage2 = (messagesArray, title, currentConcept) => {
  const template = messagesArray[Math.floor(Math.random() * messagesArray.length)];
  return template.replace(/{{title}}/g, title).replace(/{{currentConcept}}/g, currentConcept);
};
const structureLearningObjects = (
  learningObjects: { 'learning-object': string; type: LoType }[]
) => {
  const structured = {};

  learningObjects.forEach((item) => {
    const { type } = item;
    const learningObject = item['learning-object'];
    if (!structured[type]) {
      structured[type] = {
        uris: [],
        currentIndex: 0,
      };
    }

    structured[type].uris.push(learningObject);
  });

  return structured;
};
const GuidedTours = () => {
  const [tourState, setTourState] = useState();
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [shouldShowDiagnosticTool, setShouldShowDiagnosticTool] = useState(false);
  const [diagnosticType, setDiagnosticType] = useState('comforts');

  const [leafConceptData, setLeafConceptData] = useState([]);
  const [currentConcept, setCurrentConcept] = useState({});

  const [refreshKey, setRefreshKey] = useState(0);

  const messagesEndRef = useRef(null);
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

  // (For title anyone approach can be used from below, not sure left for review)
  // const title = router.query.id?.split('&title=')[1];
  const title = id?.match(/&title=([^&]*)/)?.[1] || '';
  const leafConceptUri = id?.split('&title=')[0] || '';

  useEffect(() => {
    const fetchLeafConcepts = async () => {
      try {
        const leafConceptLinks = await getLeafConcepts(leafConceptUri);
        const conceptArray = [];
        (leafConceptLinks['leaf-concepts'] ?? []).map((link) => {
          const segments = link.split('?');
          const conceptName = segments[segments.length - 1];
          const obj = {};
          obj[conceptName] = link;
          conceptArray.push(obj);
        });
        setLeafConceptData(conceptArray);
      } catch (error) {
        console.error('Error fetching leaf concepts:', error);
      }
    };
    fetchLeafConcepts();
  }, [leafConceptUri]);
  useEffect(() => {
    if (leafConceptData.length > 0 && currentConceptIndex >= 0) {
      const conceptObj = leafConceptData[currentConceptIndex];
      setCurrentConcept(conceptObj);
    }
  }, [currentConceptIndex, leafConceptData]);
  const [learningObjectsData, setLearningObjectsData] = useState({});

  useEffect(() => {
    const fetchLearningObjects = async () => {
      if (!currentConcept) return;
      try {
        const conceptName = Object.keys(currentConcept)[0];
        const conceptUri = currentConcept[conceptName];

        const response = await getLearningObjects([conceptUri]);
        const result = structureLearningObjects(response.learningObjects);
        const learningObjects = {};
        learningObjects[Object.keys(currentConcept)[0]] = result;
        setLearningObjectsData(learningObjects);
      } catch (error) {
        console.error('Error in fetchLearningObjects:', error);
      }
    };

    if (leafConceptData.length > 0) {
      fetchLearningObjects();
    }
  }, [currentConcept]);

  const transition = (newState) => {
    setTourState(newState);
  };

  const [textArray, setTextArray] = useState(comfortPrompts);

  useEffect(() => {
    const initializeTour = () => {
      if (leafConceptData.length > 1 && messages.length === 0) {
        const currentConcept = Object.keys(leafConceptData[0])[0];
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: getRandomMessage2(initializeMessages, title, currentConcept),
            type: 'system',
          },
        ]);
        transition(STATES.COMFORT);
      }
    };
    initializeTour();
  }, [leafConceptData]);
  const showFeedbackMessage = (responseCategory: string) => {
    const messages = feedbackMessages[responseCategory];
    if (messages) {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMessages((prevMessages) => [...prevMessages, { type: 'system', text: randomMessage }]);
    } else {
      console.warn(`No feedback messages available for response category: ${responseCategory}`);
    }
  };

  const handleResponseSelect = (response: string, diagnosticType: string) => {
    const res = categorizeResponse(response);

    showFeedbackMessage(res);

    const transitionMap = {
      comfort: {
        yes: STATES.NEXT_CONCEPT,
        no: STATES.DEFINITION,
        notSure: STATES.PROBLEM,
      },
      definition: {
        yes: STATES.PROBLEM,
        no: STATES.DEFINITION,
        notSure: STATES.EXAMPLE,
      },
      problem: {
        yes: STATES.NEXT_CONCEPT,
        no: STATES.DEFINITION,
      },
      next_concept: {
        yes: STATES.COMFORT,
        no: STATES.DEFINITION,
      },
      example: {
        yes: STATES.PROBLEM,
        no: STATES.DEFINITION,
        notSure: STATES.DEFINITION,
      },
    };

    if ((diagnosticType === 'comfort' || diagnosticType === 'problem') && res === 'yes') {
      if (currentConceptIndex + 1 == leafConceptData.length) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'system', text: 'All leaf Concept finished' },
        ]);
        return;
      }
      setCurrentConceptIndex((prevIndex) => prevIndex + 1);
    }
    if (diagnosticType === 'next_concept' && res === 'no') {
      setCurrentConceptIndex((prevIndex) => prevIndex - 1);
    }
    const nextState = transitionMap[diagnosticType]?.[res];

    if (nextState) {
      if (tourState === 'definition' && nextState === 'definition') {
        setRefreshKey((prevKey) => prevKey + 1);
      }
      transition(nextState);
    }
  };

  const [responseButtons, setResponseButtons] = useState(responseOptions['comfort']);
  const getNextItem = (currentConcept, type) => {
    const obj = learningObjectsData[currentConcept]?.[type];
    if (!obj || !obj.uris || obj.uris.length === 0) {
      return null;
    }
    const uri = obj.uris[obj.currentIndex];
    obj.currentIndex = (obj.currentIndex + 1) % obj.uris.length;

    return uri;
  };
  const handleSubmitResult = (result) => {
    console.log('User submission result:', result);
  };
  const showLearningObject = (
    setMessages,
    leafConceptData,
    state,
    textArray,
    learningObjectUri
  ) => {
    let componentToRender;

    switch (state) {
      case 'definition':
        componentToRender = <DefinitionFetcher link={learningObjectUri} />;
        break;
      case 'problem':
        componentToRender = (
          <ProblemFetcher link={learningObjectUri} onSubmit={handleSubmitResult} />
        );
        break;
      case 'example':
        componentToRender = <ExampleFetcher link={learningObjectUri} />;
        break;
      default:
        componentToRender = null;
    }

    /////////////////////////////
    ///Intro message
    ///for learningObject
    //////////////////////
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: getRandomMessage(textArray, Object.keys(leafConceptData[currentConceptIndex])[0]),
        type: 'system',
      },
    ]);
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          component: componentToRender,
          type: 'system',
        },
      ]);
    }, 500);
  };

  useEffect(() => {
    if (leafConceptData.length > 0 && tourState === STATES.COMFORT) {
      setDiagnosticType('comfort');
      setTextArray(comfortPrompts);
      setResponseButtons(responseOptions['comfort']);
      setShouldShowDiagnosticTool(true);
    } else if (tourState === STATES.DEFINITION) {
      const uriToFetch = getNextItem(Object.keys(currentConcept)[0], STATES.DEFINITION);

      showLearningObject(
        setMessages,
        leafConceptData,
        STATES.DEFINITION,
        definitionMessages,
        uriToFetch
      );
      setDiagnosticType('definition');
      setTextArray(definitionComfortPrompts);
      setResponseButtons(responseOptions['definition']);
      setShouldShowDiagnosticTool(true);
    } else if (tourState === STATES.PROBLEM) {
      const uriToFetch = getNextItem(Object.keys(currentConcept)[0], STATES.PROBLEM);
      showLearningObject(setMessages, leafConceptData, STATES.PROBLEM, problemMessages, uriToFetch);
      setDiagnosticType('problem');
      setTextArray(problemComfortPrompts);
      setResponseButtons(responseOptions['problem']);
      setShouldShowDiagnosticTool(true);
    } else if (tourState === STATES.NEXT_CONCEPT) {
      setDiagnosticType('next_concept');
      setTextArray(nextConceptsPrompts);
      setResponseButtons(responseOptions['next_concept']);

      setShouldShowDiagnosticTool(true);
    } else if (tourState === STATES.EXAMPLE) {
      const uriToFetch = getNextItem(Object.keys(currentConcept)[0], STATES.EXAMPLE);
      showLearningObject(setMessages, leafConceptData, STATES.EXAMPLE, exampleMessages, uriToFetch);
      setDiagnosticType('example');
      setTextArray(exampleComfortPrompts);
      setResponseButtons(responseOptions['example']);
      setShouldShowDiagnosticTool(true);
    }
  }, [tourState, leafConceptData, refreshKey]);

  return (
    <MainLayout title="Guided Tour">
      <div>
        <h1 className={styles.title}>
          <span className={styles.welcomeText}>Welcome to the Guided Tour of </span>
          <span className={styles.dynamicTitle}>{title || 'Loading...'}</span>
        </h1>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={4}
          p={3}
          borderRadius={5}
          boxShadow={3}
          style={{ backgroundColor: '#f9f9f9', maxHeight: '60vh', overflowY: 'auto' }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.type === 'system' ? 'flex-start' : 'flex-end'}
              mt={2}
              width="100%"
            >
              <Box
                p={2}
                borderRadius={5}
                boxShadow={2}
                style={{
                  backgroundColor: msg.type === 'system' ? '#e0f7fa' : '#cce5ff',
                  maxWidth: '80%',
                  textAlign: msg.type === 'system' ? 'left' : 'right',
                }}
                className={`${styles.messageBox} ${styles.systemMessage}`}
              >
                {msg.text && (
                  <Typography variant="body1" dangerouslySetInnerHTML={{ __html: msg.text }} />
                )}
                {msg.component && msg.text && <Box sx={{ mt: 2 }} />}
                {msg.component && msg.component}
              </Box>
            </Box>
          ))}

          <div ref={messagesEndRef} />
          {shouldShowDiagnosticTool && (
            <DiagnosticTool
              key={refreshKey}
              diagnosticType={diagnosticType}
              textArray={textArray}
              responseButtons={responseButtons}
              messages={messages}
              setMessages={setMessages}
              onResponseSelect={handleResponseSelect}
              leafConceptData={leafConceptData}
              currentConceptIndex={currentConceptIndex}
            />
          )}
        </Box>
      </div>
    </MainLayout>
  );
};

export default GuidedTours;
