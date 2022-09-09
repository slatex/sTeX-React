import {
  Box,
  Button,
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
import { SectionInfo } from '@stex-react/utils';
import { Dispatch, SetStateAction, useState } from 'react';
import { createNewIssue, IssueCategory, IssueType } from './issueCreator';

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
  context: SectionInfo[];
  onCreateIssue: (issueUrl: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const typeError = !type?.length;
  const categoryError = !category?.length;
  const descriptionError = !description?.length;
  const anyError = typeError || categoryError || descriptionError;

  return (
    <Dialog onClose={() => setOpen(false)} open={open} sx={{ zIndex: 20000 }}>
      <DialogContent>
        <TextField
          fullWidth
          id="bug-title-text"
          label="Title (optional)"
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
          }}
        >
          <FormLabel id="category-group-label">
            There is an issue with the
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="category-group-label"
            name="category-group"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <FormControlLabel
              value={IssueCategory.CONTENT.toString()}
              control={<Radio />}
              label="information"
            />
            <FormControlLabel
              value={IssueCategory.DISPLAY.toString()}
              control={<Radio />}
              label="display"
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
          }}
        >
          <FormLabel id="category-group-label">Issue Type</FormLabel>
          <RadioGroup
            row
            aria-labelledby="type-group-label"
            name="type-group"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <FormControlLabel
              value={IssueType.ERROR.toString()}
              control={<Radio />}
              label="Something is wrong"
            />
            <FormControlLabel
              value={IssueType.SUGGESTION.toString()}
              control={<Radio />}
              label="I have a suggestion"
            />
          </RadioGroup>
        </FormControl>
        <span
          style={{ display: 'block', color: '#00000099', margin: '5px 0 0' }}
        >
          SELECTED CONTENT
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
          *The created issue contains context information such as the url and
          position of selected text in the document.
        </FormHelperText>

        <TextField
          error={descriptionError}
          fullWidth
          label="Issue Description"
          style={{ textAlign: 'left' }}
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={isCreating} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          disabled={anyError || isCreating}
          onClick={async () => {
            setIsCreating(true);
            const issueLink = await createNewIssue(
              IssueType[type as keyof typeof IssueType],
              IssueCategory[category as keyof typeof IssueCategory],
              description,
              selectedText,
              context,
              title?.trim().length > 0 ? title.trim() : undefined
            );
            onCreateIssue(issueLink);
            setIsCreating(false);
            setOpen(false);
          }}
          autoFocus
        >
          Create Issue
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
