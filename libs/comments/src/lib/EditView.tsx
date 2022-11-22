import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { discardDraft, retrieveDraft, saveDraft } from './comment-helpers';
import { MdEditor } from '@stex-react/markdown';
import { getUserName, Comment, addComment, editComment } from '@stex-react/api';

interface EditViewProps {
  archive: string;
  filepath: string;
  parentId?: number;
  selectedText?: string;
  existingComment?: Comment;
  placeholder?: string;
  hidden?: boolean;
  onCancel?: () => void;
  onUpdate: () => void;
}

export function EditView({
  archive,
  filepath,
  selectedText = undefined,
  parentId = 0,
  existingComment = undefined,
  placeholder = '',
  hidden = false,
  onCancel = undefined,
  onUpdate,
}: EditViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(undefined);
  const [inputText, setInputText] = useState(existingComment?.statement || '');
  const [userName, setUserName] = useState<string | undefined>(undefined);

  useEffect(() => {
    getUserName().then(setUserName);
  }, []);

  useEffect(() => {
    if (existingComment) return;
    const retreived = retrieveDraft(archive, filepath, parentId);
    setInputText(retreived || '');
  }, [archive, filepath, parentId, existingComment]);

  function getNewComment() {
    const comment: Comment = {
      commentId: -1,
      archive,
      filepath,
      parentCommentId: parentId,
      statement: inputText,
      isPrivate: false, // TODOX
      selectedText,
      userName,
    };
    return comment;
  }

  const addUpdateComment = async () => {
    setIsLoading(true);
    try {
      if (existingComment) {
        await editComment(existingComment.commentId, inputText);
      } else {
        const newComment = getNewComment();
        await addComment(newComment);
      }
      onUpdate();
    } catch (err) {
      setIsLoading(false);
      setError(err);
      alert('Comment could not be updated');
      return;
    }
    discardDraft(archive, filepath, parentId);
    setIsLoading(false);
    setInputText('');
  };

  return (
    <fieldset
      hidden={hidden}
      disabled={isLoading}
      style={{ border: 0, margin: 0, padding: 0 }}
    >
      <div style={{ marginBottom: '5px' }}>
        <MdEditor
          name="comment-edit"
          placeholder={placeholder}
          value={inputText}
          onValueChange={(v) => {
            setInputText(v);
            saveDraft(archive, filepath, parentId, v);
          }}
        />
      </div>

      <Box textAlign="right" mb="10px">
        {onCancel && (
          <Button
            variant="contained"
            disabled={isLoading}
            hidden={hidden}
            onClick={(_) => onCancel && onCancel()}
            sx={{ mr: '10px' }}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          type="submit"
          disabled={!inputText || isLoading}
          hidden={hidden}
          onClick={(_) => addUpdateComment()}
        >
          {existingComment ? 'Update' : 'Post'}
        </Button>
      </Box>
    </fieldset>
  );
}
