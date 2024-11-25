export const positiveResponses = [
  'Yes, I understood the example',
  'Yes, let’s move on',
  'yes',
  'yeah',
  'submit',
  'yup',
  'sure',
  'absolutely',
  'understood',
  'of course',
  'definitely',
  'got it',
  'affirmative',
  'right',
  'i understand',
  'okay',
  'agree',
  'certainly',
  'correct',
];

export const negativeResponses = [
  'No, not clear',
  'Not yet, need more time',
  'no',
  'nah',
  'nope',
  'never',
  'not really',
  "don't understand",
  'disagree',
  'not at all',
  'wrong',
  'incorrect',
  'need more help',
];

export const unsureResponses = [
  'explain more',
  'Show another example',
  'Not sure, can we go back?',
  'not sure',
  'notSure',
  'maybe',
  'perhaps',
  'i guess',
  'kind of',
  'possibly',
  'not quite',
  'uncertain',
  'not exactly',
  'i am stuck',
];

export const initializeMessages = [
  `Great! Let's dive into <strong>{{title}}</strong> together.<br/>
   First, it might be useful to brush up on a few foundational topics.<br/>
   Let's start with <span style="color: #d629ce; font-size: 1.2rem; font-weight: bold;">{{currentConcept}}</span>.`,
  `I'm excited to help you understand <strong>{{title}}</strong>!<br/>
   Before we get there, let's make sure you've got a good grasp of its prerequisites.<br/>
   How about we begin with <span style="color: #d629ce; font-size: 1.2rem; font-weight: bold;">{{currentConcept}}</span>?`,
  `Ready to explore <strong>{{title}}</strong>?<br/>
   I recommend starting with a fundamental concept to build your confidence.<br/>
   Let's look at <span style="color: #d629ce; font-size: 1.2rem; font-weight: bold;">{{currentConcept}}</span> first.`,
  `Happy to guide you through <strong>{{title}}</strong>!<br/>
   A good foundation always helps, so I suggest we start with <span style="color: #d629ce; font-size: 1.2rem; font-weight: bold;">{{currentConcept}}</span>.<br/>
   Let’s get you comfortable with it.`,
];

export const comfortPrompts = [
  'Do you feel comfortable with {{concept}}?',
  'Would you say you’re confident in understanding {{concept}}?',
  'Are you ready to move forward with {{concept}}?',
  'Do you feel like you have a good grasp of {{concept}}?',
  'Are you confident in your understanding of {{concept}}?',
  "Do you think you've learned enough about {{concept}}?",
  'Would you say you’re comfortable explaining {{concept}} to others?',
  'Is your understanding of {{concept}} solid enough to continue?',
  'Do you feel you understand {{concept}} well at this point?',
  "Are you ready to apply what you've learned about {{concept}}?",
];

export const definitionMessages = [
  "Here's a detailed definition for {{concept}}.",
  'Take a look at this explanation for {{concept}}.',
  'This should help clarify {{concept}} for you.',
  "Here's what {{concept}} is all about.",
  "Let's break down the concept of {{concept}}.",
  "Here's an overview of {{concept}} to help you understand.",
  'Review this definition of {{concept}} carefully.',
  "Let's dive deeper into the details of {{concept}}.",
  "Here's a comprehensive description of {{concept}}.",
  'This will give you a clearer picture of {{concept}}.',
];
export const definitionComfortPrompts = [
  'Does the definition of {{concept}} make sense to you?',
  'Are you comfortable with the definition provided for {{concept}}?',
  'Do you feel that the definition of {{concept}} is clear?',
  'Would you say the explanation for {{concept}} helped you understand it?',
  'Do you have a solid understanding of the definition of {{concept}}?',
  'Are you confident in your grasp of the definition of {{concept}}?',
  "Do you think you've understood the definition of {{concept}} well?",
  'Is the meaning of {{concept}} clear after reading the definition?',
  'Does the definition help clarify your understanding of {{concept}}?',
  'Are you comfortable with how {{concept}} is defined here?',
];

export const problemMessages = [
  'Let’s try a practice problem!',
  'Here’s a question to test your understanding.',
  'How about a problem to assess your learning?',
  'Try solving this problem related to {{concept}}.',
  'Let’s put your knowledge of {{concept}} to the test.',
  'Ready for a problem to see how well you understand {{concept}}?',
  'See if you can tackle this challenge on {{concept}}.',
  'Here’s a question on {{concept}} to test your skills.',
  'Let’s work on a problem to reinforce your understanding of {{concept}}.',
  'Try this problem and see how well you’ve grasped {{concept}}.',
];
export const problemComfortPrompts = [
  'Does the problem related to {{concept}} help you understand the concept better?',
  'Are you comfortable solving the problem provided for {{concept}}?',
  'Do you feel confident tackling problems about {{concept}} after this example?',
  'Would you say the problem gave you a clearer understanding of {{concept}}?',
  'Does solving this problem make {{concept}} more comprehensible for you?',
  'Are you confident in your ability to solve problems related to {{concept}}?',
  'Do you think the problem effectively highlights the concept of {{concept}}?',
  'Does working through this problem improve your grasp of {{concept}}?',
  'Do you find the problem aligned with your understanding of {{concept}}?',
  'Are you comfortable with the way {{concept}} is addressed in this problem?',
];

export const exampleMessages = [
  "Here's an example to illustrate {{concept}}.",
  'Take a look at this example of {{concept}} in action.',
  'This should clarify how {{concept}} works.',
  'Observe this practical example for {{concept}}.',
  "Here's a scenario that demonstrates {{concept}}.",
  "Let's see {{concept}} through this example.",
  'This example should make {{concept}} easier to understand.',
  "Here's a real-world example to help explain {{concept}}.",
  'Check out this illustration of {{concept}} in practice.',
  'This should give you a concrete idea of {{concept}}.',
];
export const exampleComfortPrompts = [
  'Does the example provided for {{concept}} help clarify your understanding?',
  'Are you comfortable with the example given for {{concept}}?',
  'Do you feel that the example of {{concept}} illustrates the concept well?',
  'Would you say the example helped you understand {{concept}} better?',
  'Does the example of {{concept}} make the concept clearer for you?',
  'Are you confident in your understanding of {{concept}} after seeing the example?',
  'Do you think the example of {{concept}} makes the concept easier to grasp?',
  'Does the example of {{concept}} support your learning effectively?',
  'Does the example help you connect with the concept of {{concept}}?',
  'Are you comfortable with the way {{concept}} is demonstrated through the example?',
];

export const nextConceptsPrompts = [
  'Okay, moving to the next concept: {{concept}}.',
  'Let’s proceed to the next concept: {{concept}}.',
  'Great! We’re now moving on to {{concept}}.',
  'Next up: {{concept}}. Let’s dive in!',
  'Now, let’s explore {{concept}}.',
  'Time to move forward with the next concept: {{concept}}.',
  'Let’s move on and look at {{concept}}.',
  'We’re ready to continue with {{concept}}.',
  'Okay, let’s shift our focus to {{concept}}.',
  'Next, let’s take a look at {{concept}}.',
];

export const feedbackMessages = {
  yes: ['Great job!', 'Awesome! ', 'Fantastic! '],
  no: [
    "That's okay! Let's take a closer look and try again.",
    "No worries, everyone gets stuck sometimes. Let's review it together.",
    'No issue! Let me help you out.',
  ],
  notSure: [
    "That's okay! Let's explore this a bit further together.",
    "No problem, let's clarify any confusion you might have.",
    "It's completely fine to be unsure. Let me help guide you.",
  ],
};

export const responseOptions = {
  comfort: ['Yes', 'No', 'Not sure'],
  definition: ['Yes, I understood', 'No, still unclear', 'Explain by example'],
  example: ['Yes, I understood the example', 'No, not clear', 'Explain more'],
  problem: ['Agree', 'Need more help'],
  next_concept: ['Yes, let’s move on', 'Not yet, need more time'],
};
export const noTypeMessages = [
  'Oops! No {{concept}} available for now.',
  'Oops! Looks like {{concept}} is missing at the moment.',
  'Oops! No {{concept}} could be found. Try something else!',
  "Oops! We're out of {{concept}} for this concept.",
  'Oops! No {{concept}} is currently available. Check back later!',
  "Oops! Seems like the {{concept}} you're looking for isn't here.",
  'Oops! No {{concept}} to display right now.',
  'Oops! The requested {{concept}} is unavailable at this time.',
];
