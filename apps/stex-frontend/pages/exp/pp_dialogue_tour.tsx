import { Box, Button } from '@mui/material';
import parse from 'html-react-parser';
import type { NextPage } from 'next';
import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import styles from './dialog-tour.module.scss';

interface Message {
  them?: string;
  them_html?: string;
}

const MESSAGE_GROUPS: { [state: string]: Message[] } = {
  '0': [
    {
      them: 'Hello, Jonas. It seems like you want to learn more about the Pythagorean Theorem. ',
    },
    {
      them: 'This topic concerns right-angled triangles. Do you already feel comfortable with that topic?',
    },
  ],
  '1': [
    {
      them: 'That is okay. We can do a small exercise and find out. Please try to answer the following problem:',
    },
    {
      them: 'In a right-angled triangle, one of the angles at the longest side is 60°. What would that make the other angle on the longest side?',
    },
  ],
  '2c': [
    {
      them: "That is correct! Okay, let's talk about the Pythagorean Theorem.",
    },
    {
      them: 'The Pythagorean Theorem states that in a right-angled triangle, the square of the hypothenuse (the longest side, opposite the right angle) is equal to the sum of the squares of the two other sides. Often, this is expressed as a² + b² = c².',
    },
    {
      them_html: '<img height="150px" src="/exp_res/right_triangle.png">',
    },
    {
      them: 'Do you see why that would be true?',
    },
  ],
  '2w': [
    {
      them: 'That is incorrect. Maybe it would be better to learn a bit more about triangles first before we return to the Pythagorean Theorem.',
    },
    {
      them: '...',
    },
  ],
  '3': [
    {
      them: 'No problem! There are multiple ways to convince yourself that this theorem is indeed true. Here is one of them, a geometric proof.',
    },
    {
      them_html: '<img height="250px" src="/exp_res/pythagoras_animated.gif">',
    },
    {
      them: 'Do you understand now why this is true?',
    },
  ],
  '4': [
    {
      them: "We'll try it another way. I have this video on proofs of the Pythagorean Theorem available. Consider watching it.",
    },
    {
      them_html:
        '<iframe src="https://player.vimeo.com/video/106024746?h=eb0d782664" width="560" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>',
    },
    {
      them: 'Do you understand now why this is true?',
    },
  ],
  '4y': [
    {
      them: "Glad to hear it. Let's put it to the test. Please solve the following problem:",
    },
    {
      them: 'In a right-angled triangle, the hypothenuse is 5 units long. One of the shorter sides is 4 units long. Using the Pythagorean Theorem, calculate the length of the remaining side.',
    },
  ],
  '5': [
    { them: "That's correct! Let's try one more to make sure!" },
    {
      them: 'Which of these triangles does the Pythagorean Theorem NOT apply to?',
    },
    {
      them_html: `<div><img style="width: 250px;" src="/exp_res/example_triangle_1.png">
<img src="/exp_res/example_triangle_2.png">
<img src="/exp_res/example_triangle_3.png"></div>`,
    },
  ],
  '6': [
    {
      them: "You're right! Seems like you understand the Pythagorean Theorem well enough now.",
    },
    {
      them: 'What do you want to do next?',
    },
  ],
};

// Possible navigations:
// 0, 1, 2c, 3, 4, 4y, 5, 6
// 0, 1, 2c, 3, 4y, 5, 6
// 0, 1, 2w
const PROMPTS: { [state: string]: { text: string; to?: string }[] } = {
  '0': [
    { text: 'Yes', to: '1' },
    { text: 'No' },
    { text: "I'm not sure", to: '1' },
  ],
  '1': [
    { text: '30°', to: '2c' },
    { text: '45°', to: '2w' },
    { text: '60°', to: '2w' },
    { text: '90°', to: '2w' },
  ],
  '2c': [
    { text: 'Yes' },
    { text: 'No', to: '3' },
    { text: "I'm not sure", to: '3' },
  ],
  '2w': [{ text: 'Okay' }, { text: 'No, stick with it' }],
  '3': [
    { text: 'Yes', to: '4y' },
    { text: 'No', to: '4' },
    { text: "I'm not sure", to: '4y' },
  ],
  '4y': [
    { text: '1 unit' },
    { text: '3 units', to: '5' },
    { text: '9 units' },
    { text: 'Not enough information' },
  ],
  '4': [{ text: 'Yes', to: '4y' }, { text: 'No' }, { text: "I'm not sure" }],
  '5': [
    { text: 'First Triangle' },
    { text: 'Second Triangle', to: '6' },
    { text: 'Third Triangle' },
    { text: 'Not enough information' },
  ],
  '6': [
    { text: 'More Geometry' },
    { text: 'More Number Theory' },
    { text: 'Something else' },
    { text: 'Return Home' },
  ],
};

const PPDialogueTour: NextPage = () => {
  const [states, setStates] = useState(['0']);
  const [responses, setResponses] = useState<string[]>([]);

  // const responseMap = idxToResponse(state, responses);
  return (
    <MainLayout title="Guided Tour Dialog | Experiments | VoLL-KI">
      <Box px="10px" m="auto" maxWidth="850px">
        <div className="center">
          <h1>Guided Tour: Pythagorean Theorem</h1>
          <Button variant="contained" sx={{ mr: '10px' }}>
            Switch Context
          </Button>
          <Button variant="contained">Return to Notes</Button>
        </div>

        <div className={styles['center']}>
          <div className={styles['imessage']}>
            {states.map((s, idx) => {
              const messages = MESSAGE_GROUPS[s];
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <p className={styles['from-me']}>{responses[idx - 1]}</p>
                  )}
                  {messages.map((m, idx2) => {
                    return (
                      <p key={idx2} className={styles['from-them']}>
                        {m.them ? m.them : parse(m.them_html)}
                      </p>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
          <div className={styles['dialogue-options']}>
            {PROMPTS[states[states.length - 1]].map((prompt, idx) => (
              <Button
                key={idx}
                variant="contained"
                sx={{
                  fontWeight: prompt.to
                    ? 'bold!important'
                    : 'lighter!important',
                }}
                onClick={() => {
                  if (prompt.to) {
                    setStates((prev) => [...prev, prompt.to]);
                    setResponses((prev) => [...prev, prompt.text]);
                  }
                }}
              >
                {prompt.text}
              </Button>
            ))}
          </div>
          {/*States: {states.join(', ')}*/}
        </div>
      </Box>
    </MainLayout>
  );
};

export default PPDialogueTour;
