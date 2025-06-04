import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  TextField,
} from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { getUserInfo } from '@stex-react/api';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { createNewIssue, IssueCategory, IssueType, SelectionContext } from './issueCreator';
import { getLocaleObject } from './lang/utils';

const TYPO_CATEGORY_INPUT = 'TYPO';

export function ReportProblemDialog({
  open,
  setOpen,
  selectedText,
  context,
  onCreateIssue,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  selectedText: string;
  context: SelectionContext[];
  onCreateIssue: (issueUrl: string) => void;
}) {
  const t = getLocaleObject(useRouter());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [userName, setUserName] = useState('');
  const [postAnonymously, setPostAnonymously] = useState(false);

  const category: IssueCategory =
    categoryInput === TYPO_CATEGORY_INPUT
      ? IssueCategory.CONTENT
      : IssueCategory[categoryInput as keyof typeof IssueCategory];
  const type: IssueType = IssueType[typeInput as keyof typeof IssueType];
  const typeError = !typeInput?.length;
  const categoryError = !categoryInput?.length;
  const descriptionError = !description?.length;
  const anyError = typeError || categoryError || descriptionError;

  useEffect(() => {
    getUserInfo().then((userInfo) => {
      if (!userInfo) return;
      setUserName(userInfo.fullName);
    });
  }, []);

  return (
    <Dialog id="report-a-problem-dialog" onClose={() => setOpen(false)} open={open} sx={{ zIndex: 20000 }}>
      <DialogContent>
        <TextField
          fullWidth
          id="bug-title-text"
          label={t.titleLabel}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ marginBottom: '10px' }}
        />
        <FormControl
          error={categoryError}
          sx={{
            border: '1px solid #CCC',
            borderRadius: '5px',
            p: '5px',
            my: '5px',
            width: 'calc(100% - 12px)',
          }}
        >
          <FormLabel id="category-group-label">
            {t.issueCategoryPrompt}
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="category-group-label"
            name="category-group"
            value={categoryInput}
            onChange={(e) => {
              const v = e.target.value;
              setCategoryInput(v);
              if(v === TYPO_CATEGORY_INPUT) setTypeInput(IssueType.ERROR.toString());
            }}
          >
            <FormControlLabel
              value={IssueCategory.CONTENT.toString()}
              control={<Radio />}
              label={t.information}
            />
            <FormControlLabel
              value={IssueCategory.DISPLAY.toString()}
              control={<Radio />}
              label={t.display}
            />
            <FormControlLabel
              value={TYPO_CATEGORY_INPUT}
              control={<Radio />}
              label={t.typo}
            />
          </RadioGroup>
        </FormControl>

        <FormControl
          error={typeError}
          sx={{
            border: '1px solid #CCC',
            borderRadius: '5px',
            p: '5px',
            my: '5px',
            width: 'calc(100% - 12px)',
          }}
        >
          <FormLabel id="category-group-label">{t.issueType}</FormLabel>
          <RadioGroup
            row
            aria-labelledby="type-group-label"
            name="type-group"
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
          >
            <FormControlLabel
              value={IssueType.ERROR.toString()}
              control={<Radio />}
              label={t.errorType}
              disabled={categoryInput === TYPO_CATEGORY_INPUT }
            />
            <FormControlLabel
              value={IssueType.SUGGESTION.toString()}
              control={<Radio />}
              label={t.suggestionType}
              disabled={categoryInput === TYPO_CATEGORY_INPUT }
            />
          </RadioGroup>
        </FormControl>
        <span
          style={{ display: 'block', color: '#00000099', margin: '5px 0 0' }}
        >
          {t.selectedContent}
        </span>
        <Box
          sx={{
            padding: '5px',
            border: '1px solid #777',
            color: '#777',
            borderRadius: '5px',
            maxHeight: '100px',
            overflowY: 'auto',
          }}
        >
          {selectedText}
        </Box>
        <FormHelperText sx={{ margin: '0 5px 15px 0' }}>
          *{t.helperText}
        </FormHelperText>

        <TextField
          error={descriptionError}
          fullWidth
          label={t.issueDescription}
          style={{ textAlign: 'left' }}
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {!!userName && (
          <FormControlLabel
            control={
              <Checkbox
                checked={postAnonymously}
                onChange={(e) => setPostAnonymously(e.target.checked)}
              />
            }
            label={t.postAnonymously}
          />
        )}
        <i style={{ display: 'block' }}>
          {!postAnonymously &&
            !!userName &&
            t.nameShared.replace('$1', userName)}
          {postAnonymously && !!userName && t.anonymousRegret}
        </i>
      </DialogContent>
      <DialogActions>
        <Button disabled={isCreating} onClick={() => setOpen(false)}>
          {t.cancel}
        </Button>
        <Button
          disabled={anyError || isCreating}
          onClick={async () => {
            setIsCreating(true);
            try {
              const issueLink = await createNewIssue(
                type,
                category,
                description,
                selectedText,
                context,
                postAnonymously ? '' : userName,
                title?.trim().length > 0 ? title.trim() : undefined
              );
              onCreateIssue(issueLink);
            } catch (e) {
              console.error(e);
              alert('We encountered an error: ' + e);
              onCreateIssue('');
            } finally {
              setIsCreating(false);
              setOpen(false);
            }
          }}
          autoFocus
        >
          {t.createIssue}
        </Button>
        {isCreating ? (
          <CircularProgress size={20} sx={{ ml: '5px' }} />
        ) : (
          <Box width={25}></Box>
        )}
      </DialogActions>
    </Dialog>
  );
}
