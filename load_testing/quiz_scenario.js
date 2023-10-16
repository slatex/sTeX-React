import { SharedArray } from 'k6/data';
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'per-vu-iterations',
      vus: 500,
      iterations: 1,
      maxDuration: '5m',
    },
  },
};

const SERVER = 'https://courses.voll-ki.fau.de'; //http://[::1]:4200 'https://courses.voll-ki.fau.de';
const data = new SharedArray('some data name', function () {
  const tokens = Object.values(JSON.parse(open('./prod_access_tokens.json')));
  console.log(tokens.slice(0, 10));
  return tokens;
});

const quizId = 'quiz-c7491d6d'; // quiz-40b626ca quiz-c7491d6d

// Generate a random number between 0 and n-1
function getRandomInt(n) {
  return Math.floor(Math.random() * n);
}
function getRandomBoolean() {
  return Math.random() < 0.5;
}

function getResponsesForProblem(problem) {
  if (problem.includes('data-problem-mcb')) {
    return [
      { multipleOptionIdxs: { 0: true } },
      { multipleOptionIdxs: { 0: true, 1: true } },
      { multipleOptionIdxs: { 0: true, 1: true, 2: true } },
      { multipleOptionIdxs: { 0: true, 1: true, 2: false } },
      { multipleOptionIdxs: { 0: true, 1: true, 2: true, 3: true } },
      {
        multipleOptionIdxs: {
          0: getRandomBoolean(),
          1: getRandomBoolean(),
          2: getRandomBoolean(),
          3: getRandomBoolean(),
        },
      },
    ];
  } else if (problem.includes('data-problem-scb')) {
    return [
      { singleOptionIdxs: [0] },
      { singleOptionIdxs: [1] },
      { singleOptionIdxs: [2] },
      { singleOptionIdxs: [3] },
      { singleOptionIdxs: [getRandomInt(4)] },
    ];
  } else {
    return [
      { filledInAnswer: '1' },
      { filledInAnswer: '19' },
      { filledInAnswer: '195' },
      { filledInAnswer: '1956' },
      { filledInAnswer: '195' },
      { filledInAnswer: '' },
      { filledInAnswer: '1' },
      { filledInAnswer: '19' },
      { filledInAnswer: '195' },
      { filledInAnswer: '195' },
    ];
  }
}

function getRandomPermutation(n) {
  // Create an array with numbers from 0 to n-1
  let permutation = Array.from({ length: n }, (_, index) => index);

  // Perform the Fisher-Yates Shuffle to randomize the order
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }

  return permutation;
}

export default function () {
  const userNo = __VU - 1;
  const token = data[userNo];
  const headers = {
    Authorization: `JWT ${token}`,
    'Content-Type': 'application/json',
  };

  // User calls API to get user info (Worst case: 3 times per reload)
  let userInfoResponse = http.get('https://lms.voll-ki.fau.de/getuserinfo', {
    headers,
  });

  check(userInfoResponse, {
    'User Info Status is 200': (r) => r.status === 200,
  });

  let quizInfoResponse = http.get(`${SERVER}/api/get-quiz/${quizId}`, {
    headers,
    responseType: 'text',
  });

  check(quizInfoResponse, {
    'Quiz Info Status is 200': (r) => r.status === 200,
  });

  const quizData = quizInfoResponse.json();
  const problems = quizData.problems;
  const problemIds = Object.keys(problems);

  const problemOrder = getRandomPermutation(problemIds.length);
  // Assume students will answers questions twice
  problemOrder.push(...getRandomPermutation(problemIds.length));
  console.log(problemOrder);

  for (const problemIdx of problemOrder) {
    const problemId = problemIds[problemIdx];
    const problem = problems[problemId];
    const reponses = getResponsesForProblem(problem);

    for (const response of reponses) {
      const data = response;
      data.problemId = problemId;
      data.quizId = quizId;
      data.browserTimestamp_ms = Date.now();
      const answerResponse = http.post(
        `${SERVER}/api/insert-quiz-response`,
        JSON.stringify(data),
        { headers }
      );
      check(answerResponse, {
        'Answer Status is 204:': (r) => r.status === 204,
      });
      if(answerResponse.status !== 204) {
        console.log(`${__VU} answering ${JSON.stringify(data)} for ${problemId}`);
        console.log('Failed: ', answerResponse.status, data. answerResponse.body);
      }
      sleep(1); // Sleep better
    }

    // Sleep for a randomized time to simulate the user's activity over 5 minutes
    sleep(Math.floor(Math.random() * 10) + 5); // Sleep between 5 to 15 seconds
  }
}
