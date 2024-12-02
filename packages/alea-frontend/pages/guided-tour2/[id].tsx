import { Box, Button, CircularProgress, Typography } from '@mui/material';
import {
  conceptUriToName,
  getLeafConcepts,
  getLearningObjects,
  getLearningObjectShtml,
  LoType,
  ProblemResponse,
} from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import assert from 'assert';
import { useRouter } from 'next/router';
import ProblemFetcher from 'packages/alea-frontend/components/ProblemFetcher';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { useContext, useEffect, useState } from 'react';
import {
  ACTION_VERBALIZATION_OPTIONS,
  ActionName,
  COMFORT_PROMPTS,
  INITIALIZE_MESSAGES,
} from '../../constants/messages';
import styles from '../../styles/guided-tour.module.scss';
import { LoViewer } from '../lo-explorer';

const structureLearningObjects = async (
  mmtUrl: string,
  learningObjects: { 'learning-object': string; type: LoType }[]
) => {
  const structured: Partial<Record<LoType, { uris: string[]; currentIdx: number }>> = {};
  const problemUrls = learningObjects
    .filter((o) => o.type === 'problem')
    .map((o) => o['learning-object']);
  console.log('problemUrls:', problemUrls);
  const problemStrs$ = problemUrls.map((uri) => getLearningObjectShtml(mmtUrl, uri));
  const isAutogradable: Record<string, boolean> = {};
  const problemStrs = await Promise.all(problemStrs$);
  for (let i = 0; i < problemUrls.length; i++) {
    const url = problemUrls[i];
    const problemStr = problemStrs[i];
    isAutogradable[url] =
      problemStr.includes('data-problem-mcb') ||
      problemStr.includes('data-problem-scb') ||
      problemStr.includes('data-problem-fillinsol');
  }

  console.log('isAutogradable:', isAutogradable);

  learningObjects.forEach((item) => {
    const { type } = item;
    const learningObject = item['learning-object'];
    if (!structured[type]) {
      structured[type] = { uris: [], currentIdx: -1 };
    }
    if (type !== 'problem' || isAutogradable[learningObject]) {
      structured[type].uris.push(learningObject);
    }
  });

  return structured;
};

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

function ChatMessageDisplay({
  message,
  problemResponse,
  isFrozen,
  setProblemResponse,
}: {
  message: ChatMessage;
  problemResponse?: ProblemResponse;
  isFrozen?: boolean;
  setProblemResponse?: (response: ProblemResponse, quotient: number) => void;
}) {
  if (message.type === 'text') {
    return <Typography variant="body1" dangerouslySetInnerHTML={{ __html: message.text }} />;
  } else if (message.type === 'problem') {
    return (
      <ProblemFetcher
        isFrozen={isFrozen}
        problemUri={message.loUri}
        response={problemResponse}
        onResponseUpdate={(r, q) => setProblemResponse(r, q)}
      />
    );
  } else {
    return <LoViewer uri={message.loUri} uriType={message.type} />;
  }
}

function chooseOptionAction(options: ActionName[]): UserAction {
  const optionVerbalization: Partial<Record<ActionName, string>> = {};
  options.forEach((option) => {
    const verbalization = ACTION_VERBALIZATION_OPTIONS[option][0]; // chooseRandomlyFromList();
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
    if (numEntries > 0 && currentIdx < numEntries - 1) return type;
  }
  return undefined;
}

function updateNewStateWithNextLo(
  newState: GuidedTourState,
  action: UserAction,
  currentLo?: { type: LoType; uri: string }
): {
  messagesAdded: ChatMessage[];
  actionForNextLo: UserAction;
} {
  const newLoType = getNextLoType(newState.focusConceptLo, action, newState.focusConceptCurrentLo);
  if (!newLoType) {
    const messagesAdded: ChatMessage[] = [];
    if (action.chosenOption === 'LO_NOT_UNDERSTOOD') {
      messagesAdded.push(systemTextMessage('Sorry to hear that!'));
    } else if (action.chosenOption === 'LO_UNDERSTOOD') {
      messagesAdded.push(systemTextMessage('Great!'));
    }
    messagesAdded.push(
      systemTextMessage(
        "No more learning objects available for this concept. Let's move on to the next concept."
      )
    );
    return { messagesAdded, actionForNextLo: chooseOptionAction(['MOVE_ON']) };
  }

  const messagesAdded: ChatMessage[] = [];
  if (currentLo) {
    const article = currentLo.type === newLoType ? 'another' : newLoType === 'example' ? 'an' : 'a';
    if (action.chosenOption === 'LO_UNDERSTOOD') {
      messagesAdded.push(systemTextMessage('Great!'));
      messagesAdded.push(systemTextMessage(`Let's keep learning with ${article} ${newLoType}`));
    } else if (action.chosenOption === 'LO_NOT_UNDERSTOOD') {
      const article =
        currentLo.type === newLoType ? 'another' : newLoType === 'example' ? 'an' : 'a';
      messagesAdded.push(
        systemTextMessage(`No worries! Let's learn more with ${article} ${newLoType}.`)
      );
    } else if (action.quotient !== undefined) {
      const topMessage =
        action.quotient === 1
          ? 'Great!'
          : action.quotient === 0
          ? 'Oops! That was incorrect.'
          : "Hmm, that's only partially correct.";
      messagesAdded.push(systemTextMessage(topMessage));
      messagesAdded.push(systemTextMessage(`Let's keep learning with ${article} ${newLoType}`));
    }
  } else {
    messagesAdded.push(
      systemTextMessage(`Let's start with ${newLoType === 'example' ? 'an' : 'a'} ${newLoType}`)
    );
  }
  newState.focusConceptLo[newLoType].currentIdx++;
  newState.focusConceptCurrentLo = {
    type: newLoType,
    uri: newState.focusConceptLo[newLoType].uris[newState.focusConceptLo[newLoType].currentIdx],
  };
  messagesAdded.push({
    from: 'system',
    type: newLoType,
    loUri: newState.focusConceptCurrentLo.uri,
  });
  let actionForNextLo: UserAction;
  if (newLoType === 'problem') {
    actionForNextLo = { actionType: 'problem' };
  } else {
    messagesAdded.push(systemTextMessage(`Were you able to understand the above ${newLoType}?`));
    actionForNextLo = chooseOptionAction(['LO_UNDERSTOOD', 'LO_NOT_UNDERSTOOD']);
  }
  return { messagesAdded, actionForNextLo };
}

async function stateTransition(
  mmtUrl: string,
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
    const response = await getLearningObjects([nextConceptUri]);
    const result = await structureLearningObjects(mmtUrl, response['learning-objects']);
    newState.focusConceptLo = result;
    // TODO: handle end of leaf concepts.
    newMessages.push(
      systemTextMessage(
        `Alright, let's move on and talk about <b style="color: #d629ce">${nextConceptName}</b>.`
      )
    );
    newMessages.push(
      systemTextMessage(
        `Do you feel confident about your understanding of <b style="color: #d629ce">${nextConceptName}</b>.`
      )
    );
    const options: ActionName[] = ['KNOW', 'DONT_KNOW'];
    if (newState.focusConceptLo['problem']?.uris?.length > 0) options.push('NOT_SURE_IF_KNOW');
    newState.focusConceptInitialized = false;
    nextAction = chooseOptionAction(options);
  } else if (action.chosenOption === 'DONT_MOVE_ON') {
    newMessages.push(
      systemTextMessage(
        `Alright, let's study more about <b style="color: #d629ce">${currentConceptName}</b>.`
      )
    );
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
      newState.focusConceptInitialized = true;
      const { messagesAdded, actionForNextLo } = updateNewStateWithNextLo(
        newState,
        action,
        state.focusConceptCurrentLo
      );
      newMessages.push(...messagesAdded);
      nextAction = actionForNextLo;
    } else {
      newMessages.push(systemTextMessage('No more learning objects available for this concept.'));
      nextAction = chooseOptionAction(['MOVE_ON']);
    }
  } else if (!state.focusConceptInitialized) {
    if (action.chosenOption === 'KNOW') {
      newMessages.push(systemTextMessage('Great!'));
      newMessages.push(
        systemTextMessage(
          `Let's move on to the next concept -  <b style="color: #d629ce">${nextConceptName}</b>.`
        )
      );

      nextAction = chooseOptionAction(['MOVE_ON', 'DONT_MOVE_ON']);
    } else if (action.chosenOption === 'DONT_KNOW') {
      newMessages.push(
        systemTextMessage(
          `Alright! Let's study <b style="color: #d629ce">${currentConceptName}</b>.`
        )
      );
      newState.focusConceptInitialized = true;
      const { messagesAdded, actionForNextLo } = updateNewStateWithNextLo(newState, action);
      newMessages.push(...messagesAdded);
      nextAction = actionForNextLo;
    } else if (action.chosenOption === 'NOT_SURE_IF_KNOW') {
      newMessages.push(
        systemTextMessage(
          `No worries, let's check your understanding of  <b style="color: #d629ce">${currentConceptName}</b> with a problem.`
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
      assert(action.actionType === 'problem', JSON.stringify(action));
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
      } else {
        const topMessage =
          action.quotient === 0
            ? 'Oops! That was incorrect.'
            : "Hmm, that's only partially correct.";
        newMessages.push(systemTextMessage(topMessage));
        newMessages.push(systemTextMessage('Do you want to try another problem?'));
        nextAction = chooseOptionAction(['ANOTHER_PROBLEM', 'DONT_KNOW', 'MOVE_ON']);
      }
      const currentConcept = conceptUriToName(state.leafConceptUris[state.focusConceptIdx]);
      newMessages.push(
        systemTextMessage(
          `Let's see how well you understand  <b style="color: #d629ce">${currentConcept}</b>.`
        )
      );
    }
  } else {
    /* focusConceptInitialized */
    if (action.quotient === 1) {
      newMessages.push(systemTextMessage('Correct!'));
      newMessages.push(
        systemTextMessage('Do you feel confident in your understanding to move on?')
      );
      nextAction = chooseOptionAction(['MOVE_ON', 'DONT_MOVE_ON']);
    } else {
      newState.focusConceptInitialized = true;
      const { messagesAdded, actionForNextLo } = updateNewStateWithNextLo(
        newState,
        action,
        state.focusConceptCurrentLo
      );
      newMessages.push(...messagesAdded);
      nextAction = actionForNextLo;
    }
  }
  assert(!!nextAction);
  return { newState, nextAction, newMessages };
}

function UserActionDisplay({
  action,
  problemResponse,
  quotient,
  onResponse,
}: {
  action: UserAction;
  problemResponse?: ProblemResponse;
  quotient?: number;
  onResponse: (responded: UserAction) => void;
}) {
  if (action.actionType === 'choose-option') {
    return (
      <Box display="flex" flexWrap="wrap" gap={1}>
        {action.options.map((option) => (
          <Button
            key={option}
            variant="contained"
            onClick={() => {
              onResponse({ ...action, chosenOption: option });
            }}
          >
            <Typography variant="body1">{action.optionVerbalization[option]}</Typography>
          </Button>
        ))}
      </Box>
    );
  }
  if (action.actionType === 'problem') {
    return (
      <Button
        onClick={() => {
          onResponse({ ...action, response: problemResponse, quotient });
        }}
        variant="contained"
      >
        Submit
      </Button>
    );
  }
  return <Box>Unhandled: [{action?.actionType}]</Box>;
}

const GuidedTours = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tourState, setTourState] = useState<GuidedTourState | undefined>(undefined);
  const [userAction, setUserAction] = useState<UserAction | undefined>(undefined);
  const [problemResponse, setProblemResponse] = useState<ProblemResponse | undefined>(undefined);
  const [quotient, setQuotient] = useState<number>(0);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (pendingMessages.length === 0) return;
    const topMessage = pendingMessages[0];
    setTimeout(() => {
      setMessages([...messages, topMessage]);
      setPendingMessages(pendingMessages.slice(1));
    }, 1000);
  }, [pendingMessages]);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchLeafConcepts = async () => {
      try {
        const targetConceptUri = id?.split('&lang')[0] || '';
        const resp = await getLeafConcepts(targetConceptUri);
        const targetConceptName = conceptUriToName(targetConceptUri);
        const leafConceptUris = resp['leaf-concepts'] ?? [];
        const focusConceptIdx = 0;
        const firstLeafConceptName = conceptUriToName(leafConceptUris[focusConceptIdx]);
        const response = await getLearningObjects([leafConceptUris[focusConceptIdx]]);
        const focusConceptLo = await structureLearningObjects(mmtUrl, response['learning-objects']);
        setTourState({
          targetConceptUri,
          leafConceptUris,
          focusConceptIdx: 0,
          focusConceptInitialized: false,
          focusConceptLo,
          focusConceptLoUserAction: {},
        });
        setMessages([
          systemTextMessage(
            INITIALIZE_MESSAGES[0]
              .replace('{{title}}', targetConceptName)
              .replace('{{currentConcept}}', firstLeafConceptName)
          ),
          systemTextMessage(COMFORT_PROMPTS[0].replace('{{concept}}', firstLeafConceptName)),
        ]);
        const options: ActionName[] = ['KNOW', 'DONT_KNOW'];
        if (focusConceptLo['problem']?.uris?.length > 0) options.push('NOT_SURE_IF_KNOW');
        setUserAction(chooseOptionAction(options));
      } catch (error) {
        console.error('Error fetching leaf concepts:', error);
      }
    };
    fetchLeafConcepts();
  }, [router.isReady]);

  if (!tourState) return <CircularProgress />;

  return (
    <MainLayout title="Guided Tour | ALeA">
      <div>
        <h1 className={styles.title}>
          <span className={styles.welcomeText}>Welcome to the Guided Tour of </span>
          <span className={styles.dynamicTitle}>
            {conceptUriToName(tourState.targetConceptUri)}
          </span>
        </h1>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={4}
          p={3}
          borderRadius={5}
          boxShadow={3}
          style={{ backgroundColor: '#f9f9f9' }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.from === 'system' ? 'flex-start' : 'flex-end'}
              mt={2}
              width="100%"
            >
              <Box
                p={2}
                borderRadius={5}
                boxShadow={2}
                style={{
                  backgroundColor: msg.from === 'system' ? '#e0f7fa' : '#cce5ff',
                  maxWidth: '80%',
                  textAlign: msg.from === 'system' ? 'left' : 'right',
                }}
                className={`${styles.messageBox} ${styles.systemMessage}`}
              >
                <ChatMessageDisplay
                  message={msg}
                  isFrozen={index !== messages.length - 1}
                  problemResponse={
                    index === messages.length - 1
                      ? problemResponse
                      : messages[index + 1]?.userAction?.response
                  }
                  setProblemResponse={(r, q) => {
                    setProblemResponse(r);
                    setQuotient(q);
                  }}
                />
              </Box>
            </Box>
          ))}
          {userAction && !pendingMessages.length && (
            <Box display="flex" justifyContent="flex-end" width="100%">
              <UserActionDisplay
                action={userAction}
                problemResponse={problemResponse}
                quotient={quotient}
                onResponse={async (action) => {
                  const { newState, newMessages, nextAction } = await stateTransition(
                    mmtUrl,
                    tourState,
                    action
                  );
                  setTourState(newState);
                  const topMessage = newMessages[0];
                  setMessages([
                    ...messages,
                    {
                      from: 'user',
                      type: 'text',
                      text: action.chosenOption
                        ? action.optionVerbalization[action.chosenOption]
                        : 'Submit',
                      userAction: action,
                    },
                    topMessage,
                  ]);
                  setPendingMessages(newMessages.slice(1));
                  setUserAction(nextAction);
                }}
              />
            </Box>
          )}
        </Box>
      </div>
    </MainLayout>
  );
};

export default GuidedTours;
