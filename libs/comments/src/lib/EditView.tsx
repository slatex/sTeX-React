import { Box, Button } from '@mui/material';
import { addComment, Comment, editComment, getUserInfo } from '@stex-react/api';
import { MdEditor } from '@stex-react/markdown';
import { useEffect, useState } from 'react';
import { discardDraft, retrieveDraft, saveDraft } from './comment-helpers';

interface EditViewProps {
  archive: string;
  filepath: string;
  isPrivateNote: boolean;
  postAnonymously: boolean;
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
  isPrivateNote,
  postAnonymously = false,
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
    getUserInfo().then((userInfo) => {
      setUserName(userInfo.fullName);
    });
  }, []);

  useEffect(() => {
    if (existingComment) return;
    const retreived = retrieveDraft(archive, filepath, parentId);
    setInputText(retreived || '');
  }, [archive, filepath, parentId, existingComment]);

  function getNewComment(): Comment {
    return {
      commentId: -1,
      archive,
      filepath,
      parentCommentId: parentId,
      statement: inputText,
      isPrivate: isPrivateNote,
      isAnonymous: postAnonymously,
      selectedText,
      userName,
    };
  }

  const addUpdateComment = async () => {
    setIsLoading(true);
    try {
      if (existingComment) {
        await editComment(existingComment.commentId, inputText);
      } else {
        await addComment(getNewComment());
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
          {existingComment ? 'Update' : (isPrivateNote ? 'Save' : 'Post')}
        </Button>
      </Box>
    </fieldset>
  );
}
