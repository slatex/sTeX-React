import { Box, Button, Checkbox, FormControlLabel } from '@mui/material';
import {
  Comment,
  CommentType,
  QuestionStatus,
  SlideType,
  TOCElem,
  addComment,
  editComment,
  getUserInfo,
} from '@stex-react/api';
import { CURRENT_TERM, FileLocation } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { discardDraft, retrieveDraft, saveDraft } from './comment-helpers';
import { getLocaleObject } from './lang/utils';
import { MystEditor } from '@stex-react/myst';
import axios from 'axios';

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
  selectedSectionTOC?: TOCElem;
  currentSlideNum?: number;
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
  selectedSectionTOC = undefined,
  currentSlideNum = undefined,
}: EditViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(undefined);
  const [inputText, setInputText] = useState(existingComment?.statement || '');
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [needsResponse, setNeedsResponse] = useState(true);
  const t = getLocaleObject(router);
  const courseId = router.query['courseId'] as string;

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

  async function getCurrentSlideUri(courseId: string, sectionId: string) {
    const response = await axios.get('/api/get-slides', {
      params: { courseId, sectionIds: sectionId },
    });
    if (!response.data || !response.data[sectionId]) {
      console.warn('No Slide data found for section : ', sectionId);
      return undefined;
    }
    const slides = response.data[sectionId];
    if (!currentSlideNum || currentSlideNum > slides.length) {
      console.warn('Invalid slide number : ', currentSlideNum);
      return undefined;
    }
    const currentSlide = slides[currentSlideNum - 1];
    if (!currentSlide) {
      return undefined;
    }
    switch (currentSlide.slideType) {
      case SlideType.FRAME:
        return currentSlide.slide?.uri;
      case SlideType.TEXT:
        return currentSlide.paragraphs?.[0]?.uri;
      default:
        console.warn('unknow slide type :', currentSlide.slideType);
        return undefined;
    }
  }

  async function getNewComment(): Promise<Comment> {
    const courseTerm = courseId ? CURRENT_TERM : undefined;
    const isQuestion = needsResponse && !parentId && !isPrivateNote;
    const sectionId =
      selectedSectionTOC && 'id' in selectedSectionTOC ? selectedSectionTOC.id : undefined;
    const slideUri = await getCurrentSlideUri(courseId, sectionId ?? '');

    return {
      commentId: -1,
      archive: file?.archive,
      filepath: file?.filepath,
      parentCommentId: parentId,
      courseId,
      courseTerm,
      statement: inputText,
      isPrivate: isPrivateNote,
      isAnonymous: postAnonymously,
      commentType: isQuestion ? CommentType.QUESTION : CommentType.REMARK,
      questionStatus: isQuestion ? QuestionStatus.UNANSWERED : undefined,
      selectedText,
      userName,
      uri: slideUri ?? '',
    };
  }

  const addUpdateComment = async () => {
    setIsLoading(true);
    try {
      if (existingComment) {
        await editComment(existingComment.commentId, inputText);
      } else {
        const newComment = await getNewComment();
        await addComment(newComment);
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
    <fieldset hidden={hidden} disabled={isLoading} style={{ border: 0, margin: 0, padding: 0 }}>
      <div style={{ marginBottom: '5px' }}>
        <MystEditor
          name="comment-edit"
          placeholder={placeholder}
          value={inputText}
          onValueChange={(v) => {
            setInputText(v);
            saveDraft(file, parentId, v);
          }}
        />
        {!existingComment && !parentId && !isPrivateNote ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={needsResponse}
                onChange={(e) => setNeedsResponse(e.target.checked)}
              />
            }
            label={t.requestResponse}
          />
        ) : null}
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
