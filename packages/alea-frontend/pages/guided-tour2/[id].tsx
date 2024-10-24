import { getLeafConcepts, getLearningObjects, getProblemShtml } from '@stex-react/api';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/router';
import styles from './guided-tour.module.scss'; // Import CSS module for styling
import { Box, Button, Typography } from '@mui/material';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';

function GuidedTours() {
  const router = useRouter();
  //   const title = router.query.id?.split('&title=')[1];
  const title = router.query.id?.match(/&title=([^&]*)/)?.[1] || '';

  const leafConceptUri = router.query.id?.split('&title=')[0];

  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [userResponse, setUserResponse] = useState(null);
  const [shownDefinitions, setShownDefinitions] = useState({});
  const { mmtUrl } = useContext(ServerLinksContext);

  const [conceptData, setConceptData] = useState([]);

  const fetchLeafConcepts = async () => {
    try {
      const leafConceptLinks = await getLeafConcepts(leafConceptUri);

      const conceptPromises = leafConceptLinks.leafConcepts.map(async (link) => {
        const segments = link.split('?');
        const conceptName = segments[segments.length - 1];

        const [definitionResponse, learningObjectsResponse] = await Promise.all([
          fetch(`https://stexmmt.mathhub.info/:sTeX/fragment?${link}`).then((res) => res.text()),
          getLearningObjects([link]),
        ]);
        const problems = [];

        const learningObjects = await Promise.all(
          learningObjectsResponse.map(async (obj) => {
            if (obj['type'] === 'problem') {
              const problemHtml = await getProblemShtml(mmtUrl, obj['learning-object']);
              problems.push(problemHtml);
            }

            return {
              type: obj['type'],
              url: obj['learning-object'],
            };
          })
        );

        return {
          [conceptName]: {
            title: conceptName,
            concept_uri: link,
            definition: definitionResponse,
            learningObjects: learningObjects,
            problems: problems,
          },
        };
      });
      const conceptDataArray = await Promise.all(conceptPromises);
      setConceptData(conceptDataArray);
    } catch (error) {
      console.error('Error fetching leaf concepts:', error);
    }
  };

  useEffect(() => {
    fetchLeafConcepts();
  }, [leafConceptUri]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleUserResponse = async (response) => {
    const currentConcept = Object.values(conceptData[currentConceptIndex])[0];
    const currentConceptName = currentConcept.title;

    setMessages((prevMessages) => [...prevMessages, { text: response, type: 'user' }]);
    setUserResponse(response);

    if (response === 'no') {
      if (shownDefinitions[currentConceptName]) {
        const nextConcept = Object.values(conceptData[currentConceptIndex + 1] || {})[0]?.title;
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `Oops! We currently don't have more resources to help you. Moving to the next concept: <span style="color: #ed4b11;">${nextConcept}</span>.<br/>Do you feel comfortable with <span style="color: #1d9633;">${nextConcept}</span>?`,
            type: 'system',
          },
        ]);
        setCurrentConceptIndex((prevIndex) => prevIndex + 1);
        setUserResponse(null);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `NO issue, we can do a small learning .Here is the definition of <span style="color: #c73730; font-size: 1.2rem; font-weight: bold;">${currentConceptName}</span>:<br/> ${currentConcept.definition}<br/>Do you understand it?`,
            type: 'system',
          },
        ]);
        setShownDefinitions((prevShown) => ({ ...prevShown, [currentConceptName]: true }));
        setUserResponse(null);
      }
    } else if (response === 'yes') {
      if (currentConceptIndex + 1 < conceptData.length) {
        const nextConcept = Object.values(conceptData[currentConceptIndex + 1])[0].title;
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `Okay, as you know the topic  <span style="color: #d629ce; font-size: 1.2rem; font-weight: bold;">${currentConceptName}</span>. We will move to the next concept: <span style="color: #1d9633;">${nextConcept}</span>.<br/>Do you feel comfortable with <span style="color: #ed4b11; font-size: 1.2rem; font-weight: bold;">${nextConcept}</span>?`,
            type: 'system',
          },
        ]);
        setCurrentConceptIndex((prevIndex) => prevIndex + 1);
        setUserResponse(null);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `You've gone through all available concepts! Thank you for participating!`,
            type: 'system',
          },
        ]);
      }
    } else if (response === 'not sure') {
      // RECHECK THIS ONE
      const learningObjects = currentConcept.learningObjects;
      if (learningObjects.length > 0) {
        const problemList = learningObjects.filter((obj) => obj.type === 'problem');
        if (problemList.length > 0) {
          const prob = await getProblemShtml(mmtUrl, problemList[0].url);
          console.log('prNew', prob);

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: `That's alright. Let's do a quick exercise to find out. Please try to answer the following problem(s):<br/>${prob}.</br> Do you get what the correct answer is?`,
              type: 'system',
            },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: `At the moment, we don't have any problems to assess your understanding. Instead, take a look at the definition below:<br/><span style='color: #d629ce; font-size: 1.2rem; font-weight: bold;'>${currentConcept.definition}</span>. Do you understand it?`,
              type: 'system',
            },
          ]);
        }
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `Currently, we do not have any problems to check your understanding level. Therefore, have a look at its definition and move to the new concept:<br/><span style="color: #d629ce; font-size: 1.2rem; font-weight: bold;">${currentConcept.definition}</span>. Do you understand it?`,
            type: 'system',
          },
        ]);
      }
      setUserResponse(null);
    }
  };

  useEffect(() => {
    if (conceptData.length > 1 && messages.length === 0) {
      const currentConcept = Object.keys(conceptData[0])[0];
      console.log('conceptData', conceptData);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: `
            Happy to help you learn about <strong>${title}</strong>.<br/>
            To understand <strong>${title}</strong>, it would be good to understand its prerequisites.<br/>
            Based on your learner model, I think it will be a good idea to learn about <span style="color: #d629ce; font-size: 1.2rem; font-weight: bold;">${currentConcept}</span> first.<br/>
            Do you feel comfortable with <span style="color: #d629ce; font-size: 1.2rem; font-weight: bold;">${currentConcept}</span>?`,
          type: 'system',
        },
      ]);
    }
  }, [conceptData, messages]);

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
                <Typography variant="body1" dangerouslySetInnerHTML={{ __html: msg.text }} />
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {currentConceptIndex < conceptData.length && userResponse === null && (
          <Box
            display="flex"
            justifyContent="flex-end"
            mt={3}
            className={`${styles.messageBox} ${styles.userMessage}`}
          >
            {['yes', 'no', 'not sure'].map((response) => (
              <Button
                key={response}
                variant="contained"
                color={userResponse === response ? 'secondary' : 'primary'}
                onClick={() => handleUserResponse(response)}
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
