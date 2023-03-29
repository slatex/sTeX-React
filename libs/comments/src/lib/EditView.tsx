import { Box, Button } from '@mui/material';
import { addComment, Comment, editComment, getUserInfo } from '@stex-react/api';
import { MdEditor } from '@stex-react/markdown';
import { FileLocation } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { discardDraft, retrieveDraft, saveDraft } from './comment-helpers';
import { getLocaleObject } from './lang/utils';

interface EditViewProps {
  file: FileLocation;
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
  file,
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
  const t = getLocaleObject(useRouter());

  useEffect(() => {
    getUserInfo().then((userInfo) => {
      setUserName(userInfo?.fullName);
    });
  }, []);

  useEffect(() => {
    if (existingComment) return;
    const retreived = retrieveDraft(file, parentId);
    setInputText(retreived || '');
  }, [file, parentId, existingComment]);

  function getNewComment(): Comment {
    return {
      commentId: -1,
      archive: file?.archive,
      filepath: file?.filepath,
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
      alert(t.updateFailure);
      return;
    }
    discardDraft(file, parentId);
    setIsLoading(false);
    if (!existingComment) setInputText('');
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
            saveDraft(file, parentId, v);
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
            {t.cancel}
          </Button>
        )}
        <Button
          variant="contained"
          type="submit"
          disabled={!inputText || isLoading}
          hidden={hidden}
          onClick={(_) => addUpdateComment()}
        >
          {existingComment ? t.update : isPrivateNote ? t.save : t.post}
        </Button>
      </Box>
    </fieldset>
  );
}
