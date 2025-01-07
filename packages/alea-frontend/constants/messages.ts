export const POSITIVE_RESPONSES = [
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
] as const;

export const NEGATIVE_RESPONSES = [
  'No, not really',
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
] as const;

export const UNSURE_RESPONSES = [
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
] as const;

export const INITIALIZE_MESSAGES = [
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
] as const;

export const COMFORT_PROMPTS = [
  'Do you feel comfortable with <b style="color: #d629ce">{{concept}}</b>?',
  'Would you say you’re confident in understanding {{concept}}?',
  'Are you ready to move forward with {{concept}}?',
  'Do you feel like you have a good grasp of {{concept}}?',
  'Are you confident in your understanding of {{concept}}?',
  "Do you think you've learned enough about {{concept}}?",
  'Would you say you’re comfortable explaining {{concept}} to others?',
  'Is your understanding of {{concept}} solid enough to continue?',
  'Do you feel you understand {{concept}} well at this point?',
  "Are you ready to apply what you've learned about {{concept}}?",
] as const;

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
] as const;

export const DEFINITION_COMFORT_PROMPTS = [
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
] as const;

export const PROBLEM_MESSAGES = [
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
] as const;

export const PROBLEM_COMFORT_PROMPTS = [
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
] as const;

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
] as const;

export const EXAMPLE_COMFORT_PROMPTS = [
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
] as const;

export const NEXT_CONCEPT_PROMPTS = [
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
] as const;

export const FEEDBACK_MESSAGES = {
  yes: ['Great job!', 'Awesome!', 'Fantastic!'],
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

export const RESPONSE_OPTIONS = {
  comfort: ['Yes', 'No', 'Not sure'],
  definition: ['Yes, I understood', 'No, still unclear', 'Explain by example'],
  example: ['Yes, I understood the example', 'No, not clear', 'Explain more'],
  problem: ['Agree', 'Need more help'],
  next_concept: ['Yes, let’s move on', 'Not yet, need more time'],
} as const;

export const NO_TYPE_MESSAGES = [
  'Oops! No {{concept}} available for now.',
  'Oops! Looks like {{concept}} is missing at the moment.',
  'Oops! No {{concept}} could be found. Try something else!',
  "Oops! We're out of {{concept}} for this concept.",
  'Oops! No {{concept}} is currently available. Check back later!',
  "Oops! Seems like the {{concept}} you're looking for isn't here.",
  'Oops! No {{concept}} to display right now.',
  'Oops! The requested {{concept}} is unavailable at this time.',
] as const;

export type ActionName =
  | 'KNOW'
  | 'DONT_KNOW'
  | 'NOT_SURE_IF_KNOW'
  | 'MOVE_ON'
  | 'DONT_MOVE_ON'
  | 'ANOTHER_PROBLEM'
  | 'LO_UNDERSTOOD'
  | 'LO_NOT_UNDERSTOOD'
  | 'NAVIGATE'
  | 'REVISIT'
  | 'MARK_AS_KNOWN';

export const ACTION_VERBALIZATION_OPTIONS: Record<ActionName, string[]> = {
  KNOW: ['Yes', 'I know', 'I understand', 'Got it', 'Understood', 'Yes, I know'],
  DONT_KNOW: ['I need to learn', 'I do not know', 'I do not understand', 'No, I do not know'],
  NOT_SURE_IF_KNOW: ['Not sure', 'I am not sure if I know', 'I am not sure if I understand'],
  MOVE_ON: ['Move on', 'Yes, let’s move on', 'Yes, continue', 'Yes, proceed'],
  DONT_MOVE_ON: ["Don't move on", 'No, do not continue', 'No, do not proceed'],
  ANOTHER_PROBLEM: ['Try another problem', 'Give me another problem'],
  LO_UNDERSTOOD: ['Yes, I understood'],
  LO_NOT_UNDERSTOOD: ['No, not really'],
  NAVIGATE: ['Yes, navigate'],
  REVISIT: ['Revisit', 'Take another look'],
  MARK_AS_KNOWN: ['I know this', 'Mark as known'],
};
