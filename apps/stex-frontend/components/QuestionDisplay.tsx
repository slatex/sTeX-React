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
  feedbackHtml: string;
}

export interface Question {
  statement: Element;
  options: Option[];
  correctOptionIdx: number;
}
function recursivelyFindNodes(
  node: Element | Document,
  attrName: string,
  expected?: any
): { node: Element; attrVal: any }[] {
  if (node instanceof Element) {
    const attrVal = node.getAttribute(attrName);
    if (attrVal && (expected === undefined || expected === attrVal)) {
      return [{ node, attrVal }];
    }
  }
  const foundList: { node: Element; attrVal: any }[] = [];
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children.item(i);
    if (child instanceof Element) {
      const subFoundList = recursivelyFindNodes(child, attrName, expected);
      if (subFoundList?.length) foundList.push(...subFoundList);
    }
  }
  return foundList;
}

function removeNodeWithAttrib(node: Element | Document, attrName: string) {
  if (node instanceof Element) {
    const attrVal = node.getAttribute(attrName);
    if (attrVal) {
      console.log(node);
      node.setAttribute('style', 'display: none');
      console.log(node);
    }
  }
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children.item(i);
    if (child instanceof Element) {
      removeNodeWithAttrib(child, attrName);
    }
  }
}

function findProblemRootNode(node: Element | Document) {
  return recursivelyFindNodes(node, 'data-problem')?.[0]?.node;
}

function findOptions(problemRootNode: Element | Document): Option[] {
  const mcbNode = recursivelyFindNodes(problemRootNode, 'data-problem-mcb')?.[0]
    ?.node;
  removeNodeWithAttrib(problemRootNode, 'data-problem-mcb');
  if (!mcbNode) {
    console.error('mcb not found');
    return [];
  }
  return recursivelyFindNodes(mcbNode, 'data-problem-mc').map(
    ({ node, attrVal }) => {
      const feedbackHtml = recursivelyFindNodes(
        node,
        'data-problem-mc-solution'
      )?.[0].node.outerHTML;
      removeNodeWithAttrib(node, 'data-problem-mc-solution');

      return { shouldSelect: attrVal === 'true', value: [node], feedbackHtml };
    }
  );
}

function getQuestion(htmlDoc: Document) {
  // TODO: Free text solution (data-problem-fillinsol, data-problem-solution) not handled
  // TODO: multiple correct choices not handled.
  const problemRootNode = findProblemRootNode(htmlDoc);
  const options = findOptions(problemRootNode);
  const question: Question = {
    statement: problemRootNode, // The mcb block is already marked display:none.
    options,
    correctOptionIdx: options.findIndex((o) => o.shouldSelect),
  };
  // console.log(question);
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
  let style = styles['option'];
  style +=
    ' ' +
    (isSelected ? styles['option_selected'] : styles['option_not_selected']);
  if (isSubmitted) {
    if (isCorrect) style += ' ' + styles['correct'];
    if (isSelected && !isCorrect) style += ' ' + styles['incorrect'];
  } else {
    if (isSelected) style += ' ' + styles['option_unsubmitted_selected'];
  }
  return style;
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

  const feedback =
    selectedIdx >= 0 && question?.options[selectedIdx].feedbackHtml;

  return (
    <Card
      sx={{
        backgroundColor: 'hsl(210, 20%, 95%)',
        border: '1px solid #CCC',
        p: '10px',
      }}
    >
      <Box display="inline" fontSize="20px">
        <Box display="inline">
          {mmtHTMLToReact(question.statement.outerHTML || '')}
        </Box>
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
                <Box display="inline">
                  {option.value.map((node, idx) => (
                    <Box display="inline" key={`${idx}`}>
                      {node.outerHTML
                        ? mmtHTMLToReact(node.outerHTML)
                        : node.textContent}
                    </Box>
                  ))}
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
      <br />
      <br />

      {isSubmitted && feedback && (
        <Box
          display="block"
          padding="3px 10px"
          bgcolor={
            selectedIdx === question.correctOptionIdx ? '#a3e9a0' : '#f39797'
          }
          borderRadius="10px"
        >
          <span
            style={{
              display: 'inline',
              textAlign: 'center',
              fontSize: '20px',
            }}
          >
            {mmtHTMLToReact(feedback)}
          </span>
        </Box>
      )}
    </Card>
  );
}
