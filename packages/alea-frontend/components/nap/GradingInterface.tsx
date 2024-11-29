import { Check, SettingsBackupRestore } from '@mui/icons-material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import {
  CreateAnswerClassRequest,
  createGrading,
  getAnswersWithGrading,
  getCourseGradingItems,
  GradingInfo,
  GradingItem,
  HomeworkInfo,
  Problem,
  ProblemResponse,
  Tristate,
} from '@stex-react/api';
import { getProblem } from '@stex-react/quiz-utils';
import { mmtHTMLToReact, ProblemDisplay } from '@stex-react/stex-react-renderer';
import { GradingContext } from 'packages/stex-react-renderer/src/lib/SubProblemAnswer';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const MULTI_SELECT_FIELDS = ['homeworkId', 'questionId', 'studentId'] as const;
const ALL_SORT_FIELDS = ['homeworkDate', 'questionTitle', 'updatedAt', 'studentId'] as const;
const DEFAULT_SORT_ORDER: Record<SortField, 'ASC' | 'DESC'> = {
  homeworkDate: 'DESC',
  questionTitle: 'ASC',
  studentId: 'ASC',
  updatedAt: 'ASC',
};
type MultSelectField = (typeof MULTI_SELECT_FIELDS)[number];
type SortField = (typeof ALL_SORT_FIELDS)[number];

function MultiItemSelector<T>({
  selectedValues,
  allValues,
  label,
  onUpdate,
}: {
  selectedValues: T[];
  allValues: { value: T; title: string }[];
  label: string;
  onUpdate: (value: T[]) => void;
}) {
  return (
    <Autocomplete
      multiple
      id={`${label}-filter`}
      options={allValues}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      disableCloseOnSelect
      getOptionLabel={(option) => option.title}
      limitTags={2}
      value={selectedValues.map((v) => allValues.find((a) => a.value === v))}
      onChange={(e, newValue) => {
        onUpdate(newValue.map((v) => v.value));
      }}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox checked={selected} />
            {option.title ? mmtHTMLToReact(option.title) : (option.value ?? 'unset').toString()}
          </li>
        );
      }}
      renderTags={(value, getTagProps) => {
        return value.map((option, index) => (
          <Chip
            key={index}
            {...getTagProps({ index })}
            label={
              option.title ? mmtHTMLToReact(option.title) : option.value.toString().substring(0, 30)
            }
          />
        ));
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
      sx={{ minWidth: 300 }}
    />
  );
}

function getSelectedGradingItems(
  items: GradingItem[],
  params: SortAndFilterParams,
  homeworkMap: Record<string, HomeworkInfo>,
  questionMap: Record<string, Problem>
) {
  function getValue(item: GradingItem, field: SortField) {
    if (field === 'homeworkDate') return homeworkMap[item.homeworkId]?.givenTs;
    if (field === 'questionTitle') return questionMap[item.questionId]?.header;
    if (field === 'studentId') return item.studentId;
    if (field === 'updatedAt') return item.updatedAt;
  }
  return items
    .filter((item) => {
      for (const field of MULTI_SELECT_FIELDS) {
        if (
          params.multiSelectField[field].length > 0 &&
          !params.multiSelectField[field].includes(item[field])
        ) {
          return false;
        }
      }
      if (params.isGraded !== Tristate.UNKNOWN) {
        const isGraded = item.numSubProblemsGraded === item.numSubProblemsAnswered;
        const wantGraded = params.isGraded === Tristate.TRUE;
        if (isGraded !== wantGraded) return false;
      }
      if (params.isInstructorGraded !== Tristate.UNKNOWN) {
        const isGraded = item.numSubProblemsInstructorGraded === item.numSubProblemsAnswered;
        const wantGraded = params.isInstructorGraded === Tristate.TRUE;
        if (isGraded !== wantGraded) return false;
      }
      return true;
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

function GradingListSortFields({
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

function TriStateCheckbox({
  value,
  onChange,
}: {
  value: Tristate;
  onChange: (newValue: Tristate) => void;
}) {
  return (
    <Checkbox
      checked={value === Tristate.TRUE}
      indeterminate={value === Tristate.UNKNOWN}
      icon={<CloseIcon />}
      indeterminateIcon={<CheckBoxOutlineBlankIcon />}
      onChange={(e) => {
        const newVal =
          value === Tristate.UNKNOWN
            ? Tristate.TRUE
            : value === Tristate.TRUE
            ? Tristate.FALSE
            : Tristate.UNKNOWN;
        onChange(newVal);
      }}
    />
  );
}

function GradingItemOrganizer({
  gradingItems,
  questionMap,
  homeworkMap,
  sortAndFilterParams,
  setSortAndFilterParams,
}: {
  gradingItems: GradingItem[];
  questionMap: Record<string, Problem>;
  homeworkMap: Record<string, HomeworkInfo>;
  sortAndFilterParams: SortAndFilterParams;
  setSortAndFilterParams: Dispatch<SetStateAction<SortAndFilterParams>>;
}) {
  const allQuestions = useMemo(
    () => Object.entries(questionMap).map(([id, p]) => ({ value: id, title: p.header })),
    [questionMap]
  );
  const allHomeworks = useMemo(
    () => Object.values(homeworkMap).map((hw) => ({ value: hw.id, title: hw.title })),
    [homeworkMap]
  );
  const allStudentIds = useMemo(() => {
    const uniqueIds = [...new Set(gradingItems.map((gi) => gi.studentId))];
    return uniqueIds.map((id) => ({ value: id, title: id }));
  }, [gradingItems]);
  const { isGraded, isInstructorGraded } = sortAndFilterParams;
  //const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={2}>
        <MultiItemSelector
          label="Homeworks"
          selectedValues={sortAndFilterParams.multiSelectField.homeworkId}
          allValues={allHomeworks}
          onUpdate={(homeworkId) =>
            setSortAndFilterParams((prev) => ({
              ...prev,
              multiSelectField: { ...prev.multiSelectField, homeworkId },
            }))
          }
        />
        <MultiItemSelector
          label="Questions"
          selectedValues={sortAndFilterParams.multiSelectField.questionId}
          allValues={allQuestions}
          onUpdate={(questionId) =>
            setSortAndFilterParams((prev) => ({
              ...prev,
              multiSelectField: { ...prev.multiSelectField, questionId },
            }))
          }
        />
        <MultiItemSelector
          label="Students"
          selectedValues={sortAndFilterParams.multiSelectField.studentId}
          allValues={allStudentIds}
          onUpdate={(studentId) =>
            setSortAndFilterParams((prev) => ({
              ...prev,
              multiSelectField: { ...prev.multiSelectField, studentId },
            }))
          }
        />
      </Box>
      <Box my={1}>
        <FormControlLabel
          sx={{ mr: 2 }}
          control={
            <TriStateCheckbox
              value={isGraded}
              onChange={(v) => setSortAndFilterParams({ ...sortAndFilterParams, isGraded: v })}
            />
          }
          label={
            <Box display="flex">
              Is Graded
              <Check htmlColor="green" />
            </Box>
          }
        />
        <FormControlLabel
          control={
            <TriStateCheckbox
              value={isInstructorGraded}
              onChange={(v) =>
                setSortAndFilterParams({ ...sortAndFilterParams, isInstructorGraded: v })
              }
            />
          }
          label={
            <Box display="flex">
              Is Instructor <ShieldIcon htmlColor="green" />
            </Box>
          }
        />
      </Box>
      <GradingListSortFields
        sortAndFilterParams={sortAndFilterParams}
        setSortAndFilterParams={setSortAndFilterParams}
      />
    </Box>
  );
}

function GradingItemsList({
  gradingItems,
  onSelectItem,
  homeworkMap,
  problemMap,
}: {
  gradingItems: GradingItem[];
  onSelectItem: (homeworkId: number, problemId: string, studentId: string) => void;
  homeworkMap: Record<string, HomeworkInfo>;
  problemMap: Record<string, Problem>;
}) {
  return (
    <Box maxHeight="50vh" overflow="scroll">
      <List disablePadding>
        {gradingItems.map(
          (
            {
              homeworkId,
              questionId,
              studentId,
              numSubProblemsAnswered,
              numSubProblemsGraded,
              numSubProblemsInstructorGraded,
            },
            idx
          ) => (
            <ListItemButton
              key={`${homeworkId}-${questionId}-${studentId}`}
              onClick={(e) => onSelectItem(homeworkId, questionId, studentId)}
              sx={{ py: 0, bgcolor: idx % 2 === 0 ? '#f0f0f0' : '#ffffff' }}
            >
              <ListItemIcon>
                {numSubProblemsInstructorGraded === numSubProblemsAnswered ? (
                  <ShieldIcon htmlColor="green" />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )}
                {numSubProblemsAnswered === numSubProblemsGraded ? (
                  <Check htmlColor="green" />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  problemMap[questionId]?.header
                    ? mmtHTMLToReact(problemMap[questionId].header)
                    : questionId
                }
                secondary={
                  <>
                    {!homeworkId
                      ? 'Not Homework'
                      : homeworkMap[homeworkId]?.title
                      ? mmtHTMLToReact(homeworkMap[homeworkId].title)
                      : 'HW ' + homeworkId}
                    &nbsp;({studentId})
                  </>
                }
              />
            </ListItemButton>
          )
        )}
      </List>
    </Box>
  );
}

function GradingItemDisplay({
  homeworkId,
  questionId,
  studentId,
  questionMap,
  onNextGradingItem,
  onPrevGradingItem,
}: {
  homeworkId: number;
  questionId: string;
  studentId: string;
  questionMap: Record<string, Problem>;
  onNextGradingItem: () => void;
  onPrevGradingItem: () => void;
}) {
  const [studentResponse, setStudentResponse] = useState<ProblemResponse>(undefined);
  const [subProblemIdToAnswerId, setSubProblemIdToAnswerId] = useState<Record<string, number>>({});
  const [subProblemInfoToGradingInfo, setSubProblemInfoToGradingInfo] = useState<
    Record<string, GradingInfo[]>
  >({});

  const refreshGradingInfo = useCallback(() => {
    setStudentResponse(undefined);
    setSubProblemIdToAnswerId({});
    setSubProblemInfoToGradingInfo({});
    getAnswersWithGrading(homeworkId, questionId, studentId).then((r) => {
      setStudentResponse(r.answers);
      console.log(r.answers);
      setSubProblemIdToAnswerId(r.subProblemIdToAnswerId);
      setSubProblemInfoToGradingInfo(r.subProblemIdToGrades);
    });
  }, [homeworkId, questionId, studentId]);

  useEffect(() => {
    refreshGradingInfo();
  }, [homeworkId, questionId, studentId]);

  return (
    <Box maxWidth={900}>
      <GradingContext.Provider
        value={{
          isGrading: true,
          showGrading: true,
          gradingInfo: {[questionId]: subProblemInfoToGradingInfo} ,
          studentId,
          onNewGrading: async (
            subProblemId: string,
            answerClasses: CreateAnswerClassRequest[],
            customFeedback: string
          ) => {
            const answerId = subProblemIdToAnswerId[subProblemId];
            if (!answerId) {
              alert('No answerId found for subProblemId ' + subProblemId);
              return;
            }
            await createGrading({ answerId, answerClasses, customFeedback });
            refreshGradingInfo();
          },

          onNextGradingItem: onNextGradingItem,
          onPrevGradingItem: onPrevGradingItem,
        }}
      >
        <ProblemDisplay
          isFrozen={true}
          r={studentResponse}
          debug={true}
          problemId={questionId}
          problem={questionMap[questionId]}
          onResponseUpdate={() => {
            console.log('onResponseUpdate');
          }}
        />
      </GradingContext.Provider>
    </Box>
  );
}

interface SortAndFilterParams {
  multiSelectField: Record<MultSelectField, (string | number)[]>;
  isGraded: Tristate;
  isInstructorGraded: Tristate;
  sortingFields: SortField[];
  sortOrders: Record<SortField, 'ASC' | 'DESC'>;
}

export function GradingInterface({ courseId }: { courseId: string }) {
  const [sortAndFilterParams, setSortAndFilterParams] = useState<SortAndFilterParams>({
    multiSelectField: {
      homeworkId: [],
      questionId: [],
      studentId: [],
    },
    isGraded: Tristate.UNKNOWN,
    isInstructorGraded: Tristate.UNKNOWN,
    sortingFields: [...ALL_SORT_FIELDS],
    sortOrders: DEFAULT_SORT_ORDER,
  });
  const [gradingItems, setGradingItems] = useState<GradingItem[]>([]);
  const homeworkMap = useRef<Record<string, HomeworkInfo>>({});
  const questionMap = useRef<Record<string, Problem>>({});

  const [selected, setSelected] = useState<
    { homeworkId: number; questionId: string; studentId: string } | undefined
  >(undefined);

  const selectedGradedItems = useMemo(
    () =>
      getSelectedGradingItems(
        gradingItems,
        sortAndFilterParams,
        homeworkMap.current,
        questionMap.current
      ),
    [gradingItems, sortAndFilterParams]
  );

  useEffect(() => {
    if (!courseId) return;
    getCourseGradingItems(courseId).then((res) => {
      setGradingItems(res.gradingItems);
      homeworkMap.current = res.homeworks.reduce((acc, c) => {
        acc[c.id] = c;
        return acc;
      }, {} as Record<string, HomeworkInfo>);
      questionMap.current = res.homeworks.reduce((acc, c) => {
        for (const [id, problemStr] of Object.entries(c.problems || {})) {
          acc[id] = getProblem(problemStr);
        }
        return acc;
      }, {} as Record<string, Problem>);
      console.log('questionMap', questionMap.current);
    });
  }, [courseId]);

  return (
    <Box>
      <GradingItemOrganizer
        questionMap={questionMap.current}
        homeworkMap={homeworkMap.current}
        gradingItems={gradingItems}
        sortAndFilterParams={sortAndFilterParams}
        setSortAndFilterParams={setSortAndFilterParams}
      />
      <Typography sx={{ fontStyle: 'italic' }}>
        <b style={{ color: 'red' }}>{selectedGradedItems.length}</b> Grading Items Selected.
      </Typography>
      <Box display="flex" mt={1} flexWrap="wrap" rowGap={0.5}>
        <Box sx={{ border: '1px solid #ccc' }} flex="1 1 200px" maxWidth={300}>
          <GradingItemsList
            gradingItems={selectedGradedItems}
            homeworkMap={homeworkMap.current}
            problemMap={questionMap.current}
            onSelectItem={(homeworkId, questionId, studentId) =>
              setSelected({ homeworkId, questionId, studentId })
            }
          />
        </Box>
        <Box border="1px solid #ccc" flex="1 1 400px" p={2} maxWidth="fill-available">
          {selected ? (
            <GradingItemDisplay
              {...selected}
              questionMap={questionMap.current}
              onNextGradingItem={() => {
                const idx = selectedGradedItems.findIndex(
                  (item) =>
                    item.homeworkId === selected.homeworkId &&
                    item.questionId === selected.questionId &&
                    item.studentId === selected.studentId
                );

                if (idx === selectedGradedItems.length - 1) return;
                const newIdx = idx === -1 ? 0 : idx + 1;
                const { homeworkId, questionId, studentId } = selectedGradedItems[newIdx];
                setSelected({ homeworkId, questionId, studentId });
              }}
              onPrevGradingItem={() => {
                const idx = selectedGradedItems.findIndex(
                  (item) =>
                    item.homeworkId === selected.homeworkId &&
                    item.questionId === selected.questionId &&
                    item.studentId === selected.studentId
                );

                if (idx === 0) return;
                const newIdx = idx === 0 ? selectedGradedItems.length - 1 : idx - 1;
                const { homeworkId, questionId, studentId } = selectedGradedItems[newIdx];
                setSelected({ homeworkId, questionId, studentId });
              }}
            />
          ) : (
            <i>Please click on a grading item on the left.</i>
          )}
        </Box>
      </Box>
    </Box>
  );
}