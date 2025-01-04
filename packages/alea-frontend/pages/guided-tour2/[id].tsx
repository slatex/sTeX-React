import { Box, Button, CircularProgress, Typography } from '@mui/material';
import {
  conceptUriToName,
  getLeafConcepts,
  getLearningObjects,
  getLearningObjectShtml,
  LoType,
  ProblemResponse,
} from '@stex-react/api';
import { LayoutWithFixedMenu, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { shouldUseDrawer } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { GuidedTour2Navigation } from '../../components/guided-tour2/GuidedTour2Navigation';
import { stateTransition } from '../../components/guided-tour2/stateTransition';
import { LoViewer } from '../../components/LoListDisplay';
import ProblemFetcher from '../../components/ProblemFetcher';
import {
  ACTION_VERBALIZATION_OPTIONS,
  ActionName,
  COMFORT_PROMPTS,
  INITIALIZE_MESSAGES,
} from '../../constants/messages';
import MainLayout from '../../layouts/MainLayout';
import styles from '../../styles/guided-tour.module.scss';

export const structureLearningObjects = async (
  mmtUrl: string,
  learningObjects: { 'learning-object': string; type: LoType }[]
) => {
  const structured: Partial<Record<LoType, { uris: string[]; currentIdx: number }>> = {};
  const problemUrls = learningObjects
    .filter((o) => o.type === 'problem')
    .map((o) => o['learning-object']);
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

  learningObjects.forEach((item) => {
    const { type } = item;
    const learningObject = item['learning-object'];
    if (!structured[type]) {
      structured[type] = { uris: [], currentIdx: -1 };
    }
    if (type !== 'problem' || isAutogradable[learningObject]) {
      if (!learningObject.includes('.de.')) structured[type].uris.push(learningObject);
    }
  });

  return structured;
};

export interface UserAction {
  actionType: 'problem' | 'choose-option' | 'end' | 'out-of-conversation';
  options?: ActionName[];
  optionVerbalization?: Partial<Record<ActionName, string>>;

  // If waiting for user response, then chosenOption will be undefined.
  chosenOption?: ActionName;

  // If chosenOption is 'NAVIGATE', 'MARK_AS_KNOWN' or 'REVISIT',
  // then navigationConceptIdx will be set. A value of -1 indicates end of tour.
  targetConceptUri?: string;

  // Only for problems:
  response?: ProblemResponse;
  quotient?: number;
}

export interface GuidedTourState {
  targetConceptUri: string;
  leafConceptUris: string[];
  completedConceptUris: string[];
  focusConceptIdx: number;

  focusConceptInitialized: boolean;

  focusConceptLo: Partial<Record<LoType, { uris: string[]; currentIdx: number }>>;
  focusConceptLoUserAction: Record<string, UserAction>;
  focusConceptCurrentLo?: { type: LoType; uri: string };
}

export interface ChatMessage {
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

export function chooseOptionAction(options: ActionName[]): UserAction {
  const optionVerbalization: Partial<Record<ActionName, string>> = {};
  options.forEach((option) => {
    const verbalization = ACTION_VERBALIZATION_OPTIONS[option][0]; // chooseRandomlyFromList();
    optionVerbalization[option] = verbalization;
  });

  return { actionType: 'choose-option', options, optionVerbalization };
}

export function systemTextMessage(text: string): ChatMessage {
  return { from: 'system', type: 'text', text };
}

async function resetLeafConcepts(
  targetConceptUri: string,
  newState: GuidedTourState
): Promise<void> {
  const resp = await getLeafConcepts(targetConceptUri);
  const lCUris = resp['leaf-concepts'] ?? [];
  newState.leafConceptUris = lCUris;
  newState.focusConceptIdx = 0;
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
  if (action.actionType === 'end') return;
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
  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());

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
          completedConceptUris: [],
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
        if (focusConceptLo.problem?.uris?.length > 0) options.push('NOT_SURE_IF_KNOW');
        setUserAction(chooseOptionAction(options));
      } catch (error) {
        console.error('Error fetching leaf concepts:', error);
      }
    };
    fetchLeafConcepts();
  }, [router.isReady]);

  if (!tourState) return <CircularProgress />;

  return (
    <MainLayout title={`Guided Tour of ${conceptUriToName(tourState.targetConceptUri)} | ALeA`}>
      <LayoutWithFixedMenu
        menu={
          <GuidedTour2Navigation
            isButtonDisabled={pendingMessages.length > 0}
            tourState={tourState}
            onClose={() => setShowDashboard(false)}
            onAction={async (action: UserAction) => {
              console.log('action', action);
              const { newState, newMessages, nextAction } = await stateTransition(
                mmtUrl,
                tourState,
                action
              );

              console.log('newState', newState);
              console.log('newMessages', newMessages);
              console.log('nextAction', nextAction);

              setTourState(newState);
              const skipConvUpdate = action.chosenOption === 'MARK_AS_KNOWN' && !nextAction;
              if (!skipConvUpdate) {
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
              }
            }}
            setMessages={setMessages}
          />
        }
        topOffset={64}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        drawerAnchor="left"
      >
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
                my={{ xs: 2, sm: 1 }}
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
              <Box display="flex" justifyContent="flex-end" width="100%" my={{ xs: 1.5, sm: 1 }}>
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
      </LayoutWithFixedMenu>
    </MainLayout>
  );
};

export default GuidedTours;
