import { quizLmsInfoWriter } from './quizLmsInfoWriter';

switch (process.env.SCRIPT_NAME) {

  case 'quizLmsInfoWriter':
    quizLmsInfoWriter();
    break;
  default:
    console.log('Invalid script name');
}
