import { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';
import {
  AnswerResponse,
  deleteAnswer,
  getGradingItems,
  getLearningObjectShtml,
  getMyAnswers,
  getUserInfo,
  GradingInfo,
  Problem,
  ProblemResponse,
  Tristate,
  UserInfo,
} from '@stex-react/api';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { MultiItemSelector } from '../components/nap/MultiItemsSeletctor';
import { SettingsBackupRestore } from '@mui/icons-material';
import {
  mmtHTMLToReact,
  ProblemDisplay,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { GradingDisplay } from 'packages/stex-react-renderer/src/lib/SubProblemAnswer';
import DeleteIcon from '@mui/icons-material/Delete';
const MULTI_SELECT_FIELDS = ['courseId', 'questionId', 'courseInstance'] as const;
const ALL_SORT_FIELDS = ['courseId', 'questionTitle', 'updatedAt', 'courseInstance'] as const;
const DEFAULT_SORT_ORDER: Record<SortField, 'ASC' | 'DESC'> = {
  courseId: 'DESC',
  questionTitle: 'ASC',
  courseInstance: 'ASC',
  updatedAt: 'ASC',
};
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

type MultSelectField = (typeof MULTI_SELECT_FIELDS)[number];
type SortField = (typeof ALL_SORT_FIELDS)[number];
interface SortAndFilterParams {
  multiSelectField: Record<MultSelectField, (string | number)[]>;
  isGraded: Tristate;
  isInstructorGraded: Tristate; //only switches between false and unknown
  sortingFields: SortField[];
  sortOrders: Record<SortField, 'ASC' | 'DESC'>;
}
function AnswerItemOrganizer({
  answerItems,
  sortAndFilterParams,
  setSortAndFilterParams,
}: {
  answerItems: AnswerResponse[];
  sortAndFilterParams: SortAndFilterParams;
  setSortAndFilterParams: Dispatch<SetStateAction<SortAndFilterParams>>;
}) {
  const allCousers = useMemo(
    () => [...new Set(answerItems.map((c) => c.courseId))].map((i) => ({ value: i, title: i })),
    [answerItems]
  );
  const allInstance = useMemo(
    () =>
      [...new Set(answerItems.map((item) => item.courseInstance))].map((i) => ({
        value: i,
        title: i,
      })),
    [answerItems]
  );
  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={2}>
        <MultiItemSelector
          label="Courses"
          selectedValues={sortAndFilterParams.multiSelectField.courseId}
          allValues={allCousers}
          onUpdate={(courseId) =>
            setSortAndFilterParams((prev) => ({
              ...prev,
              multiSelectField: { ...prev.multiSelectField, courseId },
            }))
          }
        />
        <MultiItemSelector
          label="Instance"
          selectedValues={sortAndFilterParams.multiSelectField.courseInstance}
          allValues={allInstance}
          onUpdate={(courseInstance) =>
            setSortAndFilterParams((prev) => ({
              ...prev,
              multiSelectField: { ...prev.multiSelectField, courseInstance },
            }))
          }
        />
      </Box>

      <AnswerListSortFields
        sortAndFilterParams={sortAndFilterParams}
        setSortAndFilterParams={setSortAndFilterParams}
      />
    </Box>
  );
}
function AnswerItemDisplay({
  answer,
  onDelete,
}: {
  answer: AnswerResponse;
  onDelete: (id: number) => void;
}) {
  const { mmtUrl } = useContext(ServerLinksContext);

  const [problem, setProblem] = useState<Problem>();
  const [answerText, setAnswerText] = useState<ProblemResponse>();
  const [gradingInfos, setGradingInfos] = useState<GradingInfo[]>([]);
  useEffect(() => {
    getLearningObjectShtml(mmtUrl, answer.questionId).then((p) => {
      setProblem(getProblem(hackAwayProblemId(p), ''));
    });
    let answers = {};
    for (let index = 0; index <= +answer.subProblemId; index++) {
      answers = { ...answers, ...{ [index]: +answer.subProblemId == index ? answer.answer : '' } };
    }
    setAnswerText({
      freeTextResponses: { [answer.subProblemId]: answer.answer },
      autogradableResponses: [],
    });
    getGradingItems(answer.id, +answer.subProblemId).then((g) => setGradingInfos(g));
  }, [answer.questionId, mmtUrl]);
  return (
    <Box>
      <ProblemDisplay
        showPoints={false}
        problem={problem}
        isFrozen={true}
        r={answerText}
        uri={answer.questionId}
        onResponseUpdate={() => {}}
        problemId={answer.questionId}
      ></ProblemDisplay>
      <Box sx={{ margin: '10px' }}>
        <span>{dayjs(answer.updatedAt).fromNow()}</span>
        <IconButton
          onClick={() => onDelete(answer.id)}
          sx={{ float: 'right', display: 'inline' }}
          aria-label="delete"
          color="primary"
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 1, mt: 1 }}>
        {gradingInfos.map((g, idx) => (
          <Box sx={{ borderTop: '1px solid #ccc', borderRadius: 1, marginTop: '5px' }} key={idx}>
            <GradingDisplay showGraderInformation={false} gradingInfo={g} key={idx} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
function getSelectedAnswerItems(answerItems: AnswerResponse[], params: SortAndFilterParams) {
  function getValue(item: AnswerResponse, field: SortField) {
    if (field === 'courseId') return item.courseId;
    if (field === 'questionTitle') return item.questionTitle;
    if (field === 'courseInstance') return item.courseInstance;
    if (field === 'updatedAt') return item.updatedAt;
  }
  return answerItems
    .filter((item) => {
      for (const field of MULTI_SELECT_FIELDS) {
        if (
          params.multiSelectField[field].length > 0 &&
          !params.multiSelectField[field].includes(item[field])
        ) {
          return false;
        }
        return true;
      }
    })
    .sort((a, b) => {
      for (const f of params.sortingFields) {
        const order = params.sortOrders[f] === 'ASC' ? 1 : -1;
        const aVal = getValue(a, f);
        const bVal = getValue(b, f);
        if (aVal < bVal || (!aVal && bVal)) return -1 * order;
        if (aVal > bVal || (aVal && !bVal)) return 1 * order;
      }
      return 0;
    });
}
function AnswerItemsList({
  onSelectItem,
  answerItems,
}: {
  answerItems: AnswerResponse[];
  onSelectItem: (answerId: number) => void;
}) {
  return (
    <Box maxHeight="50vh" overflow="scroll">
      <List disablePadding>
        {answerItems.map(({ questionTitle, courseInstance,courseId, id, subProblemId, updatedAt }, idx) => (
          <ListItemButton
            key={`${questionTitle}-${id}-${idx}`}
            onClick={(e) => onSelectItem(id)}
            sx={{ py: 0, bgcolor: idx % 2 === 0 ? '#f0f0f0' : '#ffffff' }}
          >
            <ListItemText
              primary={questionTitle ? mmtHTMLToReact(questionTitle) : id}
              secondary={
                <Box>
                  <Box>
                    <span>Sub problem: </span>
                    <span>{+subProblemId + 1}</span>
                  </Box>
                  <Box>
                    <span>Answered: </span>
                    <span>{dayjs(updatedAt).fromNow()}</span>
                  </Box>
                  <Box>
                    <span>Semester: </span>
                    <span>{courseInstance}</span>
                  </Box>
                  <Box>
                    <span>Course: </span>
                    <span>{courseId}</span>
                  </Box>
                </Box>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
function AnswerListSortFields({
  sortAndFilterParams,
  setSortAndFilterParams,
}: {
  sortAndFilterParams: SortAndFilterParams;
  setSortAndFilterParams: Dispatch<SetStateAction<SortAndFilterParams>>;
}) {
  const { sortingFields, sortOrders } = sortAndFilterParams;
  return (
    <Box display="flex" rowGap={1} columnGap={2} alignItems="center" flexWrap="wrap">
      Sort:
      {sortingFields.map((item) => (
        <Button
          key={item}
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            setSortAndFilterParams((prev) => ({
              ...prev,
              sortingFields: [item, ...prev.sortingFields.filter((f) => f !== item)],
            }));
          }}
          sx={{ py: 0 }}
        >
          {item}&nbsp;
          <IconButton
            onClick={(e) => {
              e.stopPropagation();

              setSortAndFilterParams((prev) => ({
                ...prev,
                sortOrders: {
                  ...prev.sortOrders,
                  [item]: sortOrders[item] === 'ASC' ? 'DESC' : 'ASC',
                },
              }));
            }}
          >
            {sortOrders[item] === 'ASC' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          </IconButton>
        </Button>
      ))}
      <IconButton
        onClick={() => {
          setSortAndFilterParams((prev) => ({
            ...prev,
            sortingFields: [...ALL_SORT_FIELDS],
            sortOrders: DEFAULT_SORT_ORDER,
          }));
        }}
      >
        <SettingsBackupRestore />
      </IconButton>
    </Box>
  );
}
const MyAnswersPage: NextPage = () => {
  dayjs.extend(relativeTime);
  const [answerItems, setAnswerItems] = useState<AnswerResponse[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [sortAndFilterParams, setSortAndFilterParams] = useState<SortAndFilterParams>({
    multiSelectField: {
      courseId: [],
      questionId: [],
      courseInstance: [],
    },
    isGraded: Tristate.UNKNOWN,
    isInstructorGraded: Tristate.UNKNOWN,
    sortingFields: [...ALL_SORT_FIELDS],
    sortOrders: DEFAULT_SORT_ORDER,
  });
  const [selected, setSelected] = useState<{ answerId: number } | undefined>(undefined);
  const router = useRouter();
  useEffect(() => {
    getUserInfo().then((info) => {
      if (!info) {
        router.push('/login');
        return;
      }
      getMyAnswers().then((answers) => {
        setAnswerItems(answers);
      });
      setUserInfo(info);
    });
  }, [router]);
  const selectedAnswersItems = useMemo(
    () => getSelectedAnswerItems(answerItems, sortAndFilterParams),
    [answerItems, sortAndFilterParams]
  );
  const onDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this answer?')) {
      deleteAnswer(id).then(() => {
        getMyAnswers().then((answers) => {
          setAnswerItems(answers);
        });
        setSelected(undefined);
        alert('Answer Deleted');
      });
    }
  };
  return (
    <MainLayout title={`${userInfo?.fullName} | ALeA`}>
      {answerItems.length === 0 && <Typography>No Answer Items Found.</Typography>}
      <AnswerItemOrganizer
        answerItems={answerItems}
        sortAndFilterParams={sortAndFilterParams}
        setSortAndFilterParams={setSortAndFilterParams}
      />

      <Typography sx={{ fontStyle: 'italic' }}>
        <b style={{ color: 'red' }}>{answerItems.length}</b> Answer Items Selected.
      </Typography>
      <Box display="flex" mt={1} flexWrap="wrap" rowGap={0.5}>
        <Box sx={{ border: '1px solid #ccc' }} flex="1 1 200px" maxWidth={300}>
          <AnswerItemsList
            answerItems={selectedAnswersItems}
            onSelectItem={(answerId) => setSelected({ answerId })}
          />
        </Box>
        <Box border="1px solid #ccc" flex="1 1 400px" p={2} maxWidth="fill-available">
          {selected ? (
            <AnswerItemDisplay
              answer={answerItems.find((item) => item.id === selected.answerId)}
              onDelete={onDelete}
            />
          ) : (
            <i>Please click on a answer item on the left.</i>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};
export default MyAnswersPage;
