import { Box, Typography } from '@mui/material';
import { getLeafConcepts, getLearningObjects, LoType } from '@stex-react/api';
import { useRouter } from 'next/router';
import DefinitionFetcher from 'packages/alea-frontend/components/DefinitionFetcher';
import DiagnosticTool from 'packages/alea-frontend/components/DiagnosticTool';
import ExampleFetcher from 'packages/alea-frontend/components/ExampleFetcher';
import ProblemFetcher from 'packages/alea-frontend/components/ProblemFetcher';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
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

const ALL_MESSAGE_TYPES = ['comfort', 'definition', 'problem', 'next_concept', 'example'] as const;
type MessageType = (typeof ALL_MESSAGE_TYPES)[number];

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

export const getRandomMessage = (messageList: string[], context: string) => {
  const template = messageList[Math.floor(Math.random() * messageList.length)];
  return template.replace('{{concept}}', context);
};

const getRandomMessage2 = (messageList: string[], title: string, currentConcept: string) => {
  const template = messageList[Math.floor(Math.random() * messageList.length)];
  return template.replace(/{{title}}/g, title).replace(/{{currentConcept}}/g, currentConcept);
};
const structureLearningObjects = (
  learningObjects: { 'learning-object': string; type: LoType }[]
) => {
  const structured: Partial<Record<LoType, { uris: string[]; currentIndex: number }>> = {};

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
  const [messages, setMessages] = useState<
    { text: string; type: 'system' | 'user'; component?: any }[]
  >([]);

  const [tourState, setTourState] = useState<MessageType | undefined>(undefined);
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);
  const [shouldShowDiagnosticTool, setShouldShowDiagnosticTool] = useState(false);
  const [diagnosticType, setDiagnosticType] = useState<MessageType>('comfort');
  const [conceptNameToUri, setConceptNameToUri] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [learningObjectsData, setLearningObjectsData] = useState<
    Partial<Record<LoType, { uris: string[]; currentIndex: number }>>
  >({});

  const allLeafConceptNames = Object.keys(conceptNameToUri || {});
  const currentConcept = useMemo(() => {
    const existingKeys = Object.keys(conceptNameToUri || {});
    if (!existingKeys.length) return undefined;
    if (currentConceptIndex < 0 || currentConceptIndex >= existingKeys.length) return undefined;
    return conceptNameToUri[existingKeys[currentConceptIndex]];
  }, [conceptNameToUri, currentConceptIndex]);

  const messagesEndRef = useRef(null);
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

  // (For title anyone approach can be used from below, not sure left for review)
  // const title = router.query.id?.split('&title=')[1];
  const title = id?.match(/&title=([^&]*)/)?.[1] || '';
  const leafConceptUri = id?.split('&title=')[0] || '';

  useEffect(() => {
    if(!leafConceptUri) return;
    const fetchLeafConcepts = async () => {
      try {
        const leafConceptLinks = await getLeafConcepts(leafConceptUri);
        const conceptNameToUri = {};
        (leafConceptLinks['leaf-concepts'] ?? []).map((link) => {
          const segments = link.split('?');
          const conceptName = segments[segments.length - 1];
          conceptNameToUri[conceptName] = link;
        });
        setConceptNameToUri(conceptNameToUri);
      } catch (error) {
        console.error('Error fetching leaf concepts:', error);
      }
    };
    fetchLeafConcepts();
  }, [leafConceptUri]);

  useEffect(() => {
    const fetchLearningObjects = async () => {
      if (!currentConcept) return;
      try {
        const response = await getLearningObjects([currentConcept]);
        const result = structureLearningObjects(response.learningObjects);
        setLearningObjectsData(result);
      } catch (error) {
        console.error('Error in fetchLearningObjects:', error);
      }
    };

    if (allLeafConceptNames.length > 0) {
      fetchLearningObjects();
    }
  }, [currentConcept]);

  const transition = (newState: MessageType) => {
    setTourState(newState);
  };

  const [textArray, setTextArray] = useState(comfortPrompts);

  useEffect(() => {
    const initializeTour = () => {
      if (allLeafConceptNames.length > 1 && messages.length === 0) {
        const currentConcept = Object.keys(conceptNameToUri)[0];
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: getRandomMessage2(initializeMessages, title, currentConcept),
            type: 'system',
          },
        ]);
        transition('comfort');
      }
    };
    initializeTour();
  }, [conceptNameToUri]);
  const showFeedbackMessage = (responseCategory: string) => {
    const messages = feedbackMessages[responseCategory];
    if (messages) {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMessages((prevMessages) => [...prevMessages, { type: 'system', text: randomMessage }]);
    } else {
      console.warn(`No feedback messages available for response category: ${responseCategory}`);
    }
  };

  const handleResponseSelect = (response: string, diagnosticType: MessageType) => {
    const res = categorizeResponse(response);

    showFeedbackMessage(res);

    const transitionMap = {
      comfort: {
        yes: 'next_concept',
        no: 'definition',
        notSure: 'problem',
      },
      definition: {
        yes: 'problem',
        no: 'definition',
        notSure: 'example',
      },
      problem: {
        yes: 'next_concept',
        no: 'definition',
      },
      next_concept: {
        yes: 'comfort',
        no: 'definition',
      },
      example: {
        yes: 'problem',
        no: 'definition',
        notSure: 'definition',
      },
    };

    if ((diagnosticType === 'comfort' || diagnosticType === 'problem') && res === 'yes') {
      if (currentConceptIndex + 1 == allLeafConceptNames.length) {
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
  const getNextItem = (currentConcept: string, type: MessageType) => {
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
    setMessages: Dispatch<
      SetStateAction<{ text: string; type: 'system' | 'user'; component?: any }[]>
    >,
    leafConceptData: Record<string, string>,
    state: MessageType,
    textArray: string[],
    learningObjectUri: string
  ) => {
    let componentToRender: ReactNode = null;

    switch (state) {
      case 'definition':
        componentToRender = <DefinitionFetcher definitionUri={learningObjectUri} />;
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
    // Intro message
    // for learningObject
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
          text: '',
        },
      ]);
    }, 500);
  };

  useEffect(() => {
    if (allLeafConceptNames.length > 0 && tourState === 'comfort') {
      setDiagnosticType('comfort');
      setTextArray(comfortPrompts);
      setResponseButtons(responseOptions['comfort']);
      setShouldShowDiagnosticTool(true);
    } else if (tourState === 'definition') {
      const uriToFetch = getNextItem(Object.keys(currentConcept)[0], 'definition');

      showLearningObject(
        setMessages,
        conceptNameToUri,
        'definition',
        definitionMessages,
        uriToFetch
      );
      setDiagnosticType('definition');
      setTextArray(definitionComfortPrompts);
      setResponseButtons(responseOptions['definition']);
      setShouldShowDiagnosticTool(true);
    } else if (tourState === 'problem') {
      const uriToFetch = getNextItem(Object.keys(currentConcept)[0], 'problem');
      showLearningObject(setMessages, conceptNameToUri, 'problem', problemMessages, uriToFetch);
      setDiagnosticType('problem');
      setTextArray(problemComfortPrompts);
      setResponseButtons(responseOptions['problem']);
      setShouldShowDiagnosticTool(true);
    } else if (tourState === 'next_concept') {
      setDiagnosticType('next_concept');
      setTextArray(nextConceptsPrompts);
      setResponseButtons(responseOptions['next_concept']);

      setShouldShowDiagnosticTool(true);
    } else if (tourState === 'example') {
      const uriToFetch = getNextItem(Object.keys(currentConcept)[0], 'example');
      showLearningObject(setMessages, conceptNameToUri, 'example', exampleMessages, uriToFetch);
      setDiagnosticType('example');
      setTextArray(exampleComfortPrompts);
      setResponseButtons(responseOptions['example']);
      setShouldShowDiagnosticTool(true);
    }
  }, [tourState, conceptNameToUri, refreshKey]);

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
                {msg.component}
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
              leafConceptData={conceptNameToUri}
              currentConceptIndex={currentConceptIndex}
            />
          )}
        </Box>
      </div>
    </MainLayout>
  );
};

export default GuidedTours;
