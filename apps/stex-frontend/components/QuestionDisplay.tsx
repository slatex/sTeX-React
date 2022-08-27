import { Box, Card } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio, { RadioProps } from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { convertHtmlStringToPlain } from '@stex-react/utils';
import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from '../styles/quiz.module.scss';

export interface Option {
  shouldSelect: boolean;
  value: any[];
  feedback: Element;
}

export interface Question {
  statement: Element;
  options: Option[];
  correctOptionIdx: number;
}
function findProblemRootNode(node: Element | Document) {
  if (node instanceof Element) {
    const property = node.getAttribute('property');
    if (property === 'stex:problem') return node;
  }
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children.item(i);
    if (child instanceof Element) {
      const found = findProblemRootNode(child);
      if (found) return found;
    }
  }
}

function getOptionFromElement(node: Element) {
  const children = node.childNodes;
  const option: Option = { shouldSelect: null, value: [], feedback: null };
  let nextFind = 'hbox'; // ==> hbox ==> HFil ==> resetfont
  for (let i = 0; i < children.length; i++) {
    const child = children.item(i);
    //console.log(i);
    console.log(child);

    if (child instanceof Element) {
      const className = child.className;
      //console.log(nextFind);
      //console.log(className);
      if (nextFind === 'hbox' && className === 'hbox') {
        nextFind = 'HFil';
        continue;
      }
      if (nextFind === 'HFil' && className === 'HFil') {
        nextFind = 'resetfont';
        continue;
      }
      if (nextFind === 'resetfont' && className === 'resetfont') {
        if (option.shouldSelect === null) {
          const val = convertHtmlStringToPlain(child.innerHTML);
          option.shouldSelect = val === 'Correct!';
        } else {
          option.feedback = child;
        }
      }
    }
    if (nextFind === 'HFil') {
      option.value.push(child);
    }
  }
  return option;
}

function getQuestion(htmlDoc: Document) {
  const problemRootNode = findProblemRootNode(htmlDoc);

  const rootChildren = problemRootNode.childNodes;
  const question: Question = {
    statement: null,
    options: [],
    correctOptionIdx: -1,
  };
  for (let i = 0; i < rootChildren.length; i++) {
    const child = rootChildren.item(i);
    if (!(child instanceof Element)) continue;
    if (child.hasAttribute('property')) continue;
    if (child.childNodes.length === 0) continue;

    if (!question.statement) {
      question.statement = child;
    } else {
      const option = getOptionFromElement(child);
      question.options.push(option);
      if (option.shouldSelect) {
        question.correctOptionIdx = question.options.length - 1;
      }
    }
  }
  return question;
}

function BpRadio(props: RadioProps) {
  return <Radio disableRipple color="default" {...props} />;
}

function getClassNames(
  isSelected: boolean,
  isSubmitted: boolean,
  isCorrect: boolean
) {
  if (isSubmitted) {
    if (isCorrect) return styles['option'] + ' ' + styles['correct'];
    if (!isSelected && !isCorrect) return styles['option'];
    if (isSelected && !isCorrect)
      return styles['option'] + ' ' + styles['incorrect'];
  } else {
    return !isSelected
      ? styles['option']
      : styles['option'] + ' ' + styles['option_selected'];
  }
}

export function QuestionDisplay({
  questionUrl,
  isSubmitted,
  onSelectedIndexUpdate,
}: {
  questionUrl: string;
  isSubmitted: boolean;
  onSelectedIndexUpdate: (selectedIndex: number, isCorrect: boolean) => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [question, setQuestion] = useState(null as Question);
  useEffect(() => {
    if (!questionUrl?.length) return;
    axios.get(questionUrl).then((r) => {
      const htmlDoc = new DOMParser().parseFromString(r.data, 'text/html');
      const q = getQuestion(htmlDoc);
      setQuestion(q);
      console.log(q);
    });
  }, [questionUrl]);
  if (!question) return;

  const feedback = selectedIdx >= 0 && question?.options[selectedIdx].feedback;

  return (
    <Card
      sx={{
        backgroundColor: 'hsl(210, 20%, 95%)',
        border: '1px solid #CCC',
        p: '10px',
      }}
    >
      <Box display="inline" fontSize="20px">
        {mmtHTMLToReact(question.statement.outerHTML)}
      </Box>
      <br />
      <FormControl>
        <RadioGroup
          aria-labelledby="demo-customized-radios"
          name="customized-radios"
          value={selectedIdx.toString()}
          onChange={(e) => {
            if (!isSubmitted) {
              const sIdx = +e.target.value;
              setSelectedIdx(sIdx);
              onSelectedIndexUpdate(sIdx, sIdx === question.correctOptionIdx);
            }
          }}
        >
          {question.options.map((option, optionIdx) => (
            <FormControlLabel
              key={optionIdx}
              value={optionIdx.toString()}
              control={<BpRadio />}
              className={getClassNames(
                selectedIdx === optionIdx,
                isSubmitted,
                question.correctOptionIdx === optionIdx
              )}
              label={
                <>
                  {option.value.map((node, idx) => (
                    <Box display="inline" key={`${idx}`}>
                      {node.outerHTML
                        ? mmtHTMLToReact(node.outerHTML)
                        : node.textContent}
                    </Box>
                  ))}
                </>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
      <br />
      <br />

      {isSubmitted && feedback && (
        <span
          style={{
            textAlign: 'center',
            fontSize: '20px',
            padding: '3px',
            backgroundColor: '#333',
            color: 'white',
            borderRadius: '10px'
          }}
        >
          {mmtHTMLToReact(feedback.outerHTML)}
        </span>
      )}
    </Card>
  );
}
