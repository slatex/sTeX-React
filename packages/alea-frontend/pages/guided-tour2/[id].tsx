import { getLeafConcepts, getLearningObjects } from '@stex-react/api';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import React, { useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/router';
import styles from './guided-tour.module.scss';
import { Box, Button, Typography } from '@mui/material';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { useMachine } from '@xstate/react';
import { createMachine, assign } from 'xstate';

const tourMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5RQK4EsKQCoHsUCcA6NAOzQBc0BDAGzQC9SoBiCHEsYkgNxwGtOqDNjxFSFanUYkoCUrwDGVSuwDaABgC6GzYlAAHHLAns9IAB6IATAE4AjIXUB2ABx2rAZgAsHp54CsAGyBADQgAJ6I-l4ujuo2vsF+wTb+AL5pYUKYELgEXBK0DEzMYPj4OET6NMoAZpUAtoTZIvnilEXSsvI4SiokOjpmhsb9ZpYItg7Obp4+fh5BoRGITupehDH+Nl5W-i4eVuouVhlZ6Dl5RLVg5AoAFkwAMmBU+GQyAPIARgBWYApyLBWOxOD0BM0Lq1rrcHs9Xu8mD9-oDYHIeL1lGg1FohkgQCMTCRxqs3IQXCcnKkPAl1FYvE4wpEEF59uT1IE9hybEcPHYziAWrlRIQbndHjIXm8PlBkQCgaVypVCNU6o1IcJhfkxXDJQiZXLUejFFicdotMMjESSQhXA4KVYqf4aR46QymVFOYQ9glXIE7DsTl4BUKroQqLA+EwAMI4Br1fDkZgAJQAogBlAAKnwAcunUwB9ACaGbxBitY3xE3cTn8hCC9J5rqcVN8HsmVishBsTkCDb8NniLl7IahWqIEajMlj8cqSbTWdz+YLOc+ZYJFexxKriBrdYbXibzlbjJWLMCHkIdgb-k8gQpDKcHlHmrDk5jcYT84z2bzhdXWAFumACqabroSlagNWjr7pyh6eMevrtmsl4eIsOxHMc2yBE4L6XCKsD3DgADuTAACJgLU7RbimP5LoWJbpuBm6mDuCB2IECTdoE8T+O4xy7HYXjth4wSECh7jbLs3guF4waZIKY5hoRJHkZR1HsLRi5-iua4WviEFbja142DYhA0nJT6yTh96nsyPF1oO-h0ocgReDM8nnK+BFEaRMiZhU3w0GADRab+y6McxoxGWxRwuOo3G8XYzjqGhHjtpxl5OMlCQ2Jxjqsnh0KECpflQAFOBBSFYX0bpUXWmxAbxJsXhCbYvY0k4XjLMyDJmbJ2V+PEviOqcCmhiKHDmOQsYkAoYD6Em9WQRY1jHA4MRyeoQktp4LjtmSh6mTYByDnYiypUV46EFNM3sPNi3MKodi6AZLHblB1isglPHXg6uypH2yEcuSw7OXS6zeGNCkkDgmDwPiE0EJa0WsZ9CAALQ9YgGOOcd-i1g6dhuDsV1htRnRMCjDXo7sGUUuJ7iHmDeUnGTIo6hKUBSoiXx-PKCPlqjH2rQgfGxJJ6jbZtrV2VE3WbC42zeE6gPPuNSkiu+06fnO1MrdWxyXt1QR8oGVgce2MQJa4VhuFL9LqM66tefh+SlWpVFkCthlo6L16peZg5uU7fVoftZ4xIEhAXnbOXOS6qTs+7vlMBVVUNPrMXo01+40sN51WDx9LIXYThXsOzMFVM-Ia95+S3bND3kFnfsTAhXbOoOPKmayQnA3W51dakh63pxydEAocbVLckCtyL7f3tHbkDU+3XZW2Z73glHhg7sFL3qynmKfXRBlBU+Dz8ZLkx8NtapesrUR-ZLjRxbewXkEUs9oEGQZEAA */
    id: 'guidedTour',
    initial: 'initializing',
    context: {
      conceptData: [],
      currentConceptIndex: 0,
      messages: [],
      mmtUrl: '',
    },
    states: {
      initializing: {
        invoke: {
          src: 'fetchLeafConcepts',
          onDone: { target: 'fetchingLearningObjects', actions: 'storeConcepts' },
          onError: { target: 'error', actions: 'sendErrorMessage' },
        },
      },
      fetchingLearningObjects: {
        invoke: {
          src: 'fetchLearningObjects',
          onDone: { target: 'askingComfort', actions: 'promptFirstConcept' },
          onError: { target: 'error', actions: 'sendErrorMessage' },
        },
      },
      askingComfort: {
        on: {
          RESPONSE_YES: { target: 'nextConcept', actions: 'moveToNextConcept' },
          RESPONSE_NO: { target: 'showingDefinition', actions: 'showDefinition' },
          RESPONSE_NOT_SURE: { target: 'showingProblem', actions: 'showProblem' },
        },
      },
      showingDefinition: {
        on: {
          RESPONSE_YES: { target: 'nextConcept', actions: 'moveToNextConcept' },
          RESPONSE_NO: { target: 'showingProblem', actions: 'showProblem' },
        },
      },
      showingProblem: {
        on: {
          RESPONSE_YES: { target: 'nextConcept', actions: 'moveToNextConcept' },
          RESPONSE_NO: { target: 'showingDefinition', actions: 'showDefinition' },
        },
      },
      nextConcept: {
        always: [
          { target: 'askingComfort', guard: 'hasNextConcept', actions: 'promptNextConcept' },
          { target: 'completed', guard: 'noMoreConcepts' },
        ],
      },
      completed: {
        type: 'final',
        entry: 'completeTour',
      },
      error: {
        type: 'final',
        entry: 'sendErrorMessage',
      },
    },
  },
  {
    actions: {
      storeConcepts: assign({
        conceptData: (context, event) => event.data,
      }),
      promptFirstConcept: assign({
        messages: (context) => [
          ...context.messages,
          {
            text: `Do you feel comfortable with ${context.conceptData[0]?.title}?`,
            type: 'system',
          },
        ],
      }),
      showDefinition: assign({
        messages: (context) => [
          ...context.messages,
          {
            text: `Here's the definition of ${
              context.conceptData[context.currentConceptIndex].title
            }`,
            type: 'system',
          },
        ],
      }),
      showProblem: assign({
        messages: (context) => [
          ...context.messages,
          { text: "Let's try a problem to assess your understanding.", type: 'system' },
        ],
      }),
      moveToNextConcept: assign({
        currentConceptIndex: (context) => context.currentConceptIndex + 1,
      }),
      promptNextConcept: assign({
        messages: (context) => [
          ...context.messages,
          {
            text: `Moving to the next concept: ${
              context.conceptData[context.currentConceptIndex]?.title
            }.`,
            type: 'system',
          },
        ],
      }),
      completeTour: assign({
        messages: (context) => [
          ...context.messages,
          { text: "You've completed the tour. Thank you for participating!", type: 'system' },
        ],
      }),
      sendErrorMessage: assign({
        messages: (context) => [
          ...context.messages,
          {
            text: 'An error occurred while processing your request. Please try again later.',
            type: 'system',
          },
        ],
      }),
    },
    services: {
      fetchLeafConcepts: (context, event) =>
        getLeafConcepts(event.leafConceptUri).then((leafConceptLinks) =>
          leafConceptLinks.leafConcepts.map((link) => ({
            title: link.split('?').pop(),
            concept_uri: link,
            definition: null,
            examples: [],
            problems: [],
          }))
        ),
      fetchLearningObjects: (context) => {
        const currentConcept = context.conceptData[context.currentConceptIndex];
        return Promise.all([
          fetch(`https://stexmmt.mathhub.info/:sTeX/fragment?${currentConcept.concept_uri}`).then(
            (res) => res.text()
          ),
          getLearningObjects([currentConcept.concept_uri]),
        ]).then(([definition, learningObjects]) => ({
          ...currentConcept,
          definition,
          examples: learningObjects.filter((obj) => obj.type === 'example'),
          problems: learningObjects.filter((obj) => obj.type === 'problem'),
        }));
      },
    },
    guards: {
      hasNextConcept: (context) => context.currentConceptIndex + 1 < context.conceptData.length,
      noMoreConcepts: (context) => context.currentConceptIndex + 1 >= context.conceptData.length,
    },
  }
);

function GuidedTours() {
  const router = useRouter();
  const title = router.query.id?.match(/&title=([^&]*)/)?.[1] || '';
  const leafConceptUri = router.query.id?.split('&title=')[0];
  const { mmtUrl } = useContext(ServerLinksContext);
  const messagesEndRef = useRef(null);

  const [state, send] = useMachine(tourMachine, {
    context: { mmtUrl },
  });

  useEffect(() => {
    if (leafConceptUri) {
      send({ type: 'LOAD_CONCEPTS', leafConceptUri });
    }
  }, [leafConceptUri, send]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.context.messages]);

  return (
    <MainLayout title="Guided Tour">
      <div>
        <h1 className={styles.title}>
          <span className={styles.welcomeText}>Welcome to the Guided Tour of </span>
          <span className={styles.dynamicTitle}>{title}</span>
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
          {state.context.messages.map((msg, index) => (
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
              >
                <Typography variant="body1" dangerouslySetInnerHTML={{ __html: msg.text }} />
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {state.matches('askingComfort') && (
          <Box display="flex" justifyContent="flex-end" mt={3}>
            {['yes', 'no', 'not sure'].map((response) => (
              <Button
                key={response}
                variant="contained"
                color={state.context.userResponse === response ? 'secondary' : 'primary'}
                onClick={() => send(`RESPONSE_${response.toUpperCase()}`)}
                style={{ margin: '0 5px' }}
              >
                {response.charAt(0).toUpperCase() + response.slice(1)}
              </Button>
            ))}
          </Box>
        )}
      </div>
    </MainLayout>
  );
}

export default GuidedTours;
