import { endSemSummary } from './endSemSummary';
import { populateResponseColumn } from './populateResponseColumn';
import { quizLmsInfoWriter } from './quizLmsInfoWriter';
import { recorrectQuizzes } from './recorrectQuizzes';

switch (process.env.SCRIPT_NAME) {
  case 'endSemSummary':
    endSemSummary();
    break;
  case 'populateResponseColumn':
    populateResponseColumn();
    break;
  case 'quizLmsInfoWriter':
    quizLmsInfoWriter();
    break;
  case 'recorrectQuizzes':
    recorrectQuizzes();
    break;
  default:
    console.log('Invalid script name');
}
