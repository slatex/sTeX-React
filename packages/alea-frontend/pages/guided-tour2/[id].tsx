import { Box, Typography } from '@mui/material';
import {
  conceptUriToName,
  getLeafConcepts,
  getLearningObjects,
  LoType,
  ProblemResponse,
} from '@stex-react/api';
import { chooseRandomlyFromList } from '@stex-react/utils';
import assert from 'assert';
import { useRouter } from 'next/router';
import DefinitionFetcher from 'packages/alea-frontend/components/DefinitionFetcher';
import DiagnosticTool from 'packages/alea-frontend/components/DiagnosticTool';
import ExampleFetcher from 'packages/alea-frontend/components/ExampleFetcher';
import ProblemFetcher from 'packages/alea-frontend/components/ProblemFetcher';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react';
import styles from './guided-tour.module.scss';
import {
  ACTION_VERBALIZATION_OPTIONS,
  ActionName,
  COMFORT_PROMPTS,
  DEFINITION_COMFORT_PROMPTS,
  definitionMessages,
  EXAMPLE_COMFORT_PROMPTS,
  FEEDBACK_MESSAGES,
  INITIALIZE_MESSAGES,
  NEGATIVE_RESPONSES,
  NEXT_CONCEPT_PROMPTS,
  POSITIVE_RESPONSES,
  PROBLEM_COMFORT_PROMPTS,
  RESPONSE_OPTIONS,
  UNSURE_RESPONSES,
} from './messages';

const ALL_MESSAGE_TYPES = ['comfort', 'definition', 'problem', 'next_concept', 'example'] as const;
type MessageType = (typeof ALL_MESSAGE_TYPES)[number];

const categorizeResponse = (response: string): 'yes' | 'no' | 'notSure' => {
  const normalizedResponse = response.toLowerCase().trim();
  if (POSITIVE_RESPONSES.some((word) => normalizedResponse === word)) {
    return 'yes';
  }

  if (NEGATIVE_RESPONSES.some((word) => normalizedResponse === word)) {
    return 'no';
  }

  if (UNSURE_RESPONSES.some((word) => normalizedResponse === word)) {
    return 'notSure';
  }

  if (POSITIVE_RESPONSES.some((word) => normalizedResponse.includes(word))) {
    return 'yes';
  }

  if (NEGATIVE_RESPONSES.some((word) => normalizedResponse.includes(word))) {
    return 'no';
  }

  if (UNSURE_RESPONSES.some((word) => normalizedResponse.includes(word))) {
    return 'notSure';
  }

  return 'notSure';
};

export const getRandomMessage = (messageList: string[], context: string) => {
  console.log('context:', context);
  const template = messageList[Math.floor(Math.random() * messageList.length)];
  return template.replace('{{concept}}', context);
};

const getRandomMessage2 = (
  messageList: readonly string[],
  title: string,
  currentConcept: string
) => {
  const template = messageList[Math.floor(Math.random() * messageList.length)];
  return template.replace(/{{title}}/g, title).replace(/{{currentConcept}}/g, currentConcept);
};
const structureLearningObjects = (
  learningObjects: { 'learning-object': string; type: LoType }[]
) => {
  const structured: Partial<Record<LoType, { uris: string[]; currentIdx: number }>> = {};

  learningObjects.forEach((item) => {
    const { type } = item;
    const learningObject = item['learning-object'];
    if (!structured[type]) {
      structured[type] = {
        uris: [],
        currentIdx: 0,
      };
    }

    structured[type].uris.push(learningObject);
  });

  return structured;
};

const TRANSITION_MESSAGE_OPTIONS: Record<MessageType, readonly string[]> = {
  comfort: COMFORT_PROMPTS,
  definition: DEFINITION_COMFORT_PROMPTS,
  problem: PROBLEM_COMFORT_PROMPTS,
  example: EXAMPLE_COMFORT_PROMPTS,
  next_concept: NEXT_CONCEPT_PROMPTS,
};

const MOVE_ON_CHOICES: ActionName[] = ['MOVE_ON', 'DONT_MOVE_ON'];

interface UserAction {
  actionType: 'problem' | 'choose-option';
  options?: ActionName[];
  optionVerbalization?: Partial<Record<ActionName, string>>;
  chosenOption?: ActionName;
  response?: ProblemResponse;
  quotient?: number;
}

interface GuidedTourState {
  targetConceptUri: string;
  leafConceptUris: string[];
  focusConceptIdx: number;

  focusConceptInitialized: boolean;

  focusConceptLo: Partial<Record<LoType, { uris: string[]; currentIdx: number }>>;
  focusConceptLoUserAction: Record<string, UserAction>;
  focusConceptCurrentLo?: { type: LoType; uri: string };
}

interface ChatMessage {
  from: 'system' | 'user';
  type: 'text' | LoType;
  loUri?: string;
  text?: string;
  userAction?: UserAction;
}

function chooseOptionAction(options: ActionName[]): UserAction {
  const optionVerbalization: Partial<Record<ActionName, string>> = {};
  options.forEach((option) => {
    const verbalization = chooseRandomlyFromList(ACTION_VERBALIZATION_OPTIONS[option]);
    optionVerbalization[option] = verbalization;
  });

  return { actionType: 'choose-option', options, optionVerbalization };
}

function systemTextMessage(text: string): ChatMessage {
  return { from: 'system', type: 'text', text };
}

function getNextLoType(
  focusConceptLo: Partial<Record<LoType, { uris: string[]; currentIdx: number }>>,
  userAction: UserAction,
  focusConceptCurrentLo?: { type: LoType; uri: string }
) {
  const loOrder: LoType[] = ['definition', 'example', 'para', 'statement', 'problem'];
  const currentLoIdx = focusConceptCurrentLo ? loOrder.indexOf(focusConceptCurrentLo.type) : 0;
  let loTypePreferredIdxOrder: number[];
  if (userAction.chosenOption === 'LO_UNDERSTOOD') {
    loTypePreferredIdxOrder = [4, 3, 2, 1, 0]; // 'problem';
  } else if (userAction.chosenOption === 'LO_NOT_UNDERSTOOD') {
    loTypePreferredIdxOrder = [
      currentLoIdx,
      ...[0, 1, 2, 3, 4].filter((idx) => idx !== currentLoIdx),
    ];
  } else if (userAction.quotient === 1) {
    loTypePreferredIdxOrder = [4, 3, 2, 1, 0]; // 'problem';
  } else {
    loTypePreferredIdxOrder = [0, 1, 2, 3, 4]; // 'definition';
  }
  for (const typeIdx of loTypePreferredIdxOrder) {
    const type = loOrder[typeIdx];
    const currentIdx = focusConceptLo[type]?.currentIdx;
    const numEntries = focusConceptLo[type]?.uris?.length ?? 0;
    if (numEntries > 0 && currentIdx < numEntries) return type;
  }
  return undefined;
}

async function stateTransition(
  state: GuidedTourState,
  action: UserAction
): Promise<{ newState: GuidedTourState; newMessages: ChatMessage[]; nextAction: UserAction }> {
  const newState = { ...state };
  const newMessages: ChatMessage[] = [];
  let nextAction: UserAction = undefined;
  const currentConceptUri = state.leafConceptUris[state.focusConceptIdx];
  const nextConceptUri = state.leafConceptUris[state.focusConceptIdx + 1];
  const currentConceptName = conceptUriToName(currentConceptUri);
  const nextConceptName = conceptUriToName(nextConceptUri);

  if (action.chosenOption === 'MOVE_ON') {
    newState.focusConceptIdx++;
    const response = await getLearningObjects([currentConceptUri]);
    const result = structureLearningObjects(response['learning-objects']);
    newState.focusConceptLo = result;
    // TODO: handle end of leaf concepts.
    newMessages.push(
      systemTextMessage(`Alright, let's move on and talk about ${nextConceptName}.`)
    );
    newMessages.push(systemTextMessage(`Let's see how well you understand ${nextConceptName}.`));
    const options: ActionName[] = ['KNOW', 'DONT_KNOW'];
    if (newState.focusConceptLo['problem']?.uris?.length > 0) options.push('NOT_SURE_IF_KNOW');
    nextAction = chooseOptionAction(options);
  } else if (action.chosenOption === 'DONT_MOVE_ON') {
    newMessages.push(systemTextMessage(`Alright, let's study more about ${currentConceptName}.`));
  
    const newLoType = getNextLoType(
      newState.focusConceptLo,
      action,
      newState.focusConceptCurrentLo
    );
    if (newLoType) {
      newState.focusConceptCurrentLo = {
        type: newLoType,
        uri: newState.focusConceptLo[newLoType][newState.focusConceptLo[newLoType].currentIdx],
      };
    } else {
      newMessages.push(systemTextMessage('No more learning objects available for this concept.'));
      nextAction = chooseOptionAction(['MOVE_ON']);
    }
  }

  if (!state.focusConceptInitialized) {
    if (action.chosenOption === 'KNOW') {
      newMessages.push(systemTextMessage('Great!'));
      newMessages.push(
        systemTextMessage(`Let's move on to the next concept - ${nextConceptName}.`)
      );
      newState.focusConceptIdx++;

      nextAction = chooseOptionAction(['MOVE_ON', 'DONT_MOVE_ON']);
    } else if (action.chosenOption === 'DONT_KNOW') {
      newMessages.push(systemTextMessage(`Alright! Let's study more about ${currentConceptName}.`));

    } else if (action.chosenOption === 'NOT_SURE_IF_KNOW') {
      newMessages.push(
        systemTextMessage(
          `No worries, let's check your understanding of ${currentConceptName} with a problem.`
        )
      );
      newState.focusConceptLo.problem.currentIdx++;
      newMessages.push({
        from: 'system',
        type: 'problem',
        loUri: newState.focusConceptLo.problem.uris[newState.focusConceptLo.problem.currentIdx],
      });
      nextAction = { actionType: 'problem' };
    } else if (action.chosenOption === 'ANOTHER_PROBLEM') {
      newState.focusConceptLo.problem.currentIdx++;
      newMessages.push({
        from: 'system',
        type: 'problem',
        loUri: newState.focusConceptLo.problem.uris[newState.focusConceptLo.problem.currentIdx],
      });
      nextAction = { actionType: 'problem' };
    } else {
      assert(action.actionType === 'problem');
      assert(action.quotient !== undefined);
      if (action.quotient === 1) {
        newMessages.push(systemTextMessage('Correct!'));
        newMessages.push(
          systemTextMessage('Do you feel confident in your understanding to move on?')
        );
        const numProblems = newState.focusConceptLo.problem?.uris?.length ?? 0;
        const idx = newState.focusConceptLo.problem?.currentIdx ?? -1;
        const options: ActionName[] = ['MOVE_ON'];
        if (numProblems > 0 && idx < numProblems - 1) {
          newState.focusConceptLo.problem.currentIdx++;
          options.push('ANOTHER_PROBLEM');
        } else {
          options.push('DONT_MOVE_ON');
        }
        nextAction = chooseOptionAction(options);
      } else if (action.quotient === 0) {
        newMessages.push(systemTextMessage('Oops! That was incorrect.'));
        newMessages.push(systemTextMessage('Do you want to try another problem?'));
        nextAction = chooseOptionAction(['ANOTHER_PROBLEM', 'MOVE_ON']);
      } else {
        newMessages.push(systemTextMessage("Hmm, that's partially correct."));
        newMessages.push(systemTextMessage('Do you want to try another problem?'));
        nextAction = chooseOptionAction(['ANOTHER_PROBLEM', 'MOVE_ON']);
      }
      const currentConcept = conceptUriToName(state.leafConceptUris[state.focusConceptIdx]);
      newMessages.push(systemTextMessage(`Let's see how well you understand ${currentConcept}.`));
    }
  } else {
    newState.focusConceptLo[state.focusConceptCurrentLo.type].currentIdx++;
    const nextLoType = getNextLoType(
      newState.focusConceptLo,
      action,
      newState.focusConceptCurrentLo
    );
    if (nextLoType) {
      newState.focusConceptCurrentLo = {
        type: nextLoType,
        uri: newState.focusConceptLo[nextLoType][newState.focusConceptLo[nextLoType].currentIdx],
      };
    }

    if (action.chosenOption === 'LO_UNDERSTOOD') {
      newMessages.push(systemTextMessage('Great!'));
    } else if (action.chosenOption === 'LO_NOT_UNDERSTOOD') {
      const article =
        state.focusConceptCurrentLo.type === nextLoType
          ? 'another'
          : nextLoType === 'example'
          ? 'an'
          : 'a';
      if (nextLoType) {
        newMessages.push(
          systemTextMessage(`No worries! Let's learn more with ${article} ${nextLoType}`)
        );
      } else {
        newMessages.push(systemTextMessage('Sorry to hear that!'));
      }
    }
    if (!nextLoType) {
      newMessages.push(
        systemTextMessage(
          "No more learning objects available for this concept. Let's move on to the next concept."
        )
      );
      nextAction = chooseOptionAction(['MOVE_ON']);
    } else {
      if (action.quotient === 1) {
        newMessages.push(systemTextMessage('Correct!'));
        newMessages.push(
          systemTextMessage('Do you feel confident in your understanding to move on?')
        );
        nextAction = chooseOptionAction(['MOVE_ON', 'DONT_MOVE_ON']);
      } else {
        newMessages.push({
          from: 'system',
          type: nextLoType,
          loUri: newState.focusConceptCurrentLo.uri,
        });
        if (nextLoType === 'problem') {
          nextAction = { actionType: 'problem' };
        } else {
          newMessages.push(
            systemTextMessage(`Where you able to understand the above ${nextLoType}?`)
          );
          nextAction = chooseOptionAction(['LO_UNDERSTOOD', 'LO_NOT_UNDERSTOOD']);
        }
      }
    }
  }
  assert(!!nextAction);
  return { newState, nextAction, newMessages };
}

const GuidedTours = () => {
  const [messages, setMessages] = useState<
    { text: string; type: 'system' | 'user'; component?: any }[]
  >([]);
  const [tourState, setTourState] = useState<MessageType | undefined>(undefined);
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);
  const [shouldShowDiagnosticTool, setShouldShowDiagnosticTool] = useState(false);
  const [diagnosticType, setDiagnosticType] = useState<MessageType>('comfort');
  const [leafConcepts, setLeafConcepts] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [learningObjectsData, setLearningObjectsData] = useState<
    Partial<Record<LoType, { uris: string[]; currentIdx: number }>>
  >({});
  const [textArray, setTextArray] = useState<readonly string[]>(COMFORT_PROMPTS);
  const allLeafConceptNames = Object.keys(leafConcepts || {});
  const currentConcept = leafConcepts[currentConceptIndex];

  const messagesEndRef = useRef(null);
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

  // (For title anyone approach can be used from below, not sure left for review)
  // const title = router.query.id?.split('&title=')[1];
  const title = id?.match(/&title=([^&]*)/)?.[1] || '';
  const leafConceptUri = id?.split('&title=')[0] || '';

  useEffect(() => {
    if (!leafConceptUri) return;
    const fetchLeafConcepts = async () => {
      try {
        const resp = await getLeafConcepts(leafConceptUri);
        setLeafConcepts(resp['leaf-concepts'] ?? []);
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
        const result = structureLearningObjects(response['learning-objects']);
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

  useEffect(() => {
    const initializeTour = () => {
      if (allLeafConceptNames.length > 1 && messages.length === 0) {
        const currentConcept = leafConcepts[0];
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: getRandomMessage2(INITIALIZE_MESSAGES, title, conceptUriToName(currentConcept)),
            type: 'system',
          },
        ]);
        transition('comfort');
      }
    };
    initializeTour();
  }, [leafConcepts]);

  const showFeedbackMessage = (responseCategory: string) => {
    const messages = FEEDBACK_MESSAGES[responseCategory];
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
      if (currentConceptIndex + 1 === allLeafConceptNames.length) {
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

  const [responseButtons, setResponseButtons] = useState(RESPONSE_OPTIONS['comfort']);
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
    leafConceptData: string[],
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
    console.log('leafConceptData:', leafConceptData);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: getRandomMessage(textArray, conceptUriToName(leafConceptData[currentConceptIndex])),
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
    if (['definition', 'problem', 'example'].includes(tourState)) {
      const uriToFetch = getNextItem(currentConcept, tourState);
      showLearningObject(setMessages, leafConcepts, tourState, definitionMessages, uriToFetch);
    }
    if (allLeafConceptNames.length > 0 || tourState !== 'comfort') {
      setDiagnosticType(tourState);
      setTextArray(TRANSITION_MESSAGE_OPTIONS[tourState]);
      setResponseButtons(RESPONSE_OPTIONS[tourState]);
      setShouldShowDiagnosticTool(true);
    }
  }, [tourState, leafConcepts, refreshKey]);

  return (
    <MainLayout title="Guided Tour | ALeA">
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
              leafConceptData={leafConcepts}
              currentConceptIndex={currentConceptIndex}
            />
          )}
        </Box>
      </div>
    </MainLayout>
  );
};

export default GuidedTours;
