import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, CircularProgress, IconButton } from '@mui/material';
import {
  Comment,
  CommentType,
  QuestionStatus,
  UserInfo,
  getCommentsForThread,
  getUserInfo,
  isModerator,
  updateQuestionState,
} from '@stex-react/api';
import { XhtmlContentUrl } from '@stex-react/utils';
import { organizeHierarchically } from '@stex-react/comments';
import { CommentTree } from '@stex-react/comments';
import {
  DocumentWidthSetter,
  ExpandableContent,
} from '@stex-react/stex-react-renderer';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useReducer, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import { QuestionStatusIcon } from './ForumView';

export function ThreadView({
  courseId,
  threadId,
}: {
  courseId: string;
  threadId: number;
}) {
  const { forum: t } = getLocaleObject(useRouter());
  const [threadComments, setThreadComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [updateCounter, doUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!threadId) return;
    getCommentsForThread(threadId).then((comments) => {
      setThreadComments(organizeHierarchically(comments));
      setIsLoading(false);
    });
  }, [threadId, updateCounter]);

  useEffect(() => {
    getUserInfo().then(setUserInfo);
  }, []);

  if (!threadComments?.length) return null;
  const fileLoc = {
    archive: threadComments[0].archive,
    filepath: threadComments[0].filepath,
  };

  const currentState = threadComments[0].questionStatus;
  if (isLoading) return <CircularProgress />;
  return (
    <>
      <Box display="flex" justifyContent="space-between" mb="15px">
        <Link href={`/forum/${courseId}`}>
          <IconButton>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Box display="flex" alignItems="center">
          <QuestionStatusIcon comment={threadComments[0]} />
          {isModerator(userInfo?.userId) &&
          threadComments[0].commentType === CommentType.QUESTION ? (
            <>
              <Button
                variant="contained"
                onClick={async () => {
                  const newState =
                    currentState === QuestionStatus.UNANSWERED
                      ? QuestionStatus.ANSWERED
                      : QuestionStatus.UNANSWERED;
                  await updateQuestionState(
                    threadId,
                    CommentType.QUESTION,
                    newState
                  );
                  doUpdate();
                  alert(`Question marked as ${newState}!`);
                }}
              >
                Mark{' '}
                {currentState === QuestionStatus.UNANSWERED
                  ? QuestionStatus.ANSWERED
                  : QuestionStatus.UNANSWERED}
              </Button>

              <Button
                variant="contained"
                sx={{ ml: '5px' }}
                onClick={async () => {
                  const confirmText =
                    'Are you sure you want to mark this comment as a remark and hide it from the forum? You can also consider marking it as answered instead.';
                  if (!confirm(confirmText)) return;
                  await updateQuestionState(
                    threadId,
                    CommentType.REMARK,
                    QuestionStatus.OTHER
                  );
                  doUpdate();
                  alert(`Comment type changed to a remark!`);
                }}
              >
                Dont Show In Forum
              </Button>
            </>
          ) : null}
        </Box>
      </Box>
      {fileLoc.archive &&
        fileLoc.filepath &&
        (showContent ? (
          <Box bgcolor="#DDD" borderRadius="5px" mb="15px">
            <Box maxWidth="600px" m="0 auto 30px" p="10px">
              <DocumentWidthSetter>
                <ExpandableContent
                  contentUrl={XhtmlContentUrl(
                    fileLoc.archive,
                    fileLoc.filepath
                  )}
                  noFurtherExpansion={true}
                  title={''}
                />
              </DocumentWidthSetter>
            </Box>
          </Box>
        ) : (
          <Button
            onClick={() => setShowContent(true)}
            variant="contained"
            sx={{ mb: '15px' }}
          >
            {t.showReferredContent}&nbsp;
            <VisibilityIcon />
          </Button>
        ))}
      <CommentTree
        comments={threadComments}
        file={fileLoc}
        refreshComments={() => {
          console.log('TODO');
        }}
      />
    </>
  );
}
