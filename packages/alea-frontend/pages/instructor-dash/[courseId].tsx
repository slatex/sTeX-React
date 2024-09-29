import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Grid, IconButton, TextField, Typography } from '@mui/material';
import { getSpecificAclIds, isValid, updateResourceAction } from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceActionPair } from '@stex-react/utils';
import { useRouter } from 'next/router';
import HomeworkManager from 'packages/alea-frontend/components/HomeworkManager';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { useEffect, useState } from 'react';

const InstructorDash = () => {
  interface AclData {
    notes: string;
    quiz: string;
    comments: string;
    studyBuddy: string;
  }

  const renderEditableField = (field: keyof AclData) => {
    return isAnyDataEditing[field] ? (
      <TextField
        value={editingValues[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          width: '120px',
          '& .MuiInputBase-input': {
            padding: '4px 8px',
            fontSize: '12px',
          },
        }}
      />
    ) : (
      <Typography
        onClick={() => handleAclClick(aclData[field])}
        sx={{
          cursor: 'pointer',
          color: 'blue',
          textDecoration: 'underline',
          fontSize: '12px',
        }}
      >
        {aclData[field] || '-'}
      </Typography>
    );
  };

  const router = useRouter();
  const { query } = router;
  let { courseId } = query;
  const fields = [
    { key: 'notes', label: 'Notes Management' },
    { key: 'quiz', label: 'Quiz Management' },
    { key: 'comments', label: 'Comments Moderation' },
    { key: 'studyBuddy', label: 'Study Buddy Management' },
  ];
  const resourceActionPairs: ResourceActionPair[] = [
    {
      resourceId: `/course/${courseId}/instance/${CURRENT_TERM}/notes`,
      actionId: Action.MUTATE,
    },
    {
      resourceId: `/course/${courseId}/instance/${CURRENT_TERM}/quiz`,
      actionId: Action.MUTATE,
    },
    {
      resourceId: `/course/${courseId}/instance/${CURRENT_TERM}/comments`,
      actionId: Action.MODERATE,
    },
    {
      resourceId: `/course/${courseId}/instance/${CURRENT_TERM}/study-buddy`,
      actionId: Action.MODERATE,
    },
  ];
  const [isAnyDataEditing, setIsAnyDataEditing] = useState({
    notes: false,
    quiz: false,
    comments: false,
    studyBuddy: false,
  });
  const [editingValues, setEditingValues] = useState({
    notes: '',
    quiz: '',
    comments: '',
    studyBuddy: '',
  });
  const [aclData, setAclData] = useState<AclData>({
    notes: '',
    quiz: '',
    comments: '',
    studyBuddy: '',
  });
  const handleAclClick = (aclId: string) => {
    router.push(`/acl/${aclId}`);
  };

  const handleChange = (field: keyof AclData, value: string) => {
    setEditingValues({ ...editingValues, [field]: value });
  };

  const handleEditClick = async (field: keyof AclData) => {
    if (isAnyDataEditing[field]) {
      await updateAclId(field, editingValues[field]);
    }
    setIsAnyDataEditing({ ...isAnyDataEditing, [field]: !isAnyDataEditing[field] });
  };
  const updateAclId = async (field: keyof AclData, aclId: string) => {
    const resourceId = `/course/${courseId}/instance/${CURRENT_TERM}/${field}`;
    const actionId = resourceActionPairs.find((r) => r.resourceId === resourceId)?.actionId || '';
    const res = await isValid(aclId);
    if (!res) {
      console.log('invalid aclId');
      setEditingValues({ ...editingValues, [field]: aclData[field] });
      return;
    }
    await updateResourceAction({
      resourceId,
      actionId,
      aclId,
    });
    setAclData({ ...aclData, [field]: aclId });
    setEditingValues({ ...editingValues, [field]: aclId });
  };

  useEffect(() => {
    async function getAclData() {
      const aclIds = await getSpecificAclIds(resourceActionPairs);
      setAclData({
        notes: aclIds[`/course/${courseId}/instance/ss24/notes`] || '',
        quiz: aclIds[`/course/${courseId}/instance/ss24/quiz`] || '',
        comments: aclIds[`/course/${courseId}/instance/ss24/comments`] || '',
        studyBuddy: aclIds[`/course/${courseId}/instance/ss24/study-buddy`] || '',
      });

      setEditingValues({
        notes: aclIds[`/course/${courseId}/instance/ss24/notes`] || '',
        quiz: aclIds[`/course/${courseId}/instance/ss24/quiz`] || '',
        comments: aclIds[`/course/${courseId}/instance/ss24/comments`] || '',
        studyBuddy: aclIds[`/course/${courseId}/instance/ss24/study-buddy`] || '',
      });
    }
    getAclData();
  }, [courseId]);

  return (
    <MainLayout>
      <Box display="flex" flexDirection="column" maxWidth="900px" m="auto" p="20px" gap="20px">
        <Typography variant="h4" textAlign="center">
          Instructor Dashboard for {!courseId ? ' ' : courseId.toString().toUpperCase()}
        </Typography>

        <Grid container spacing={1}>
          {fields.map((field) => (
            <Grid item xs={6} key={field.key}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p="10px"
                border="1px solid #ddd"
                borderRadius="8px"
                bgcolor="background.default"
              >
                <Typography variant="h6" fontSize="14px">
                  {field.label}
                </Typography>
                {renderEditableField(field.key as keyof AclData)}
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(field.key as keyof AclData)}
                  disabled={Object.keys(isAnyDataEditing).some(
                    (key) => isAnyDataEditing[key] && key !== field.key
                  )}
                >
                  {isAnyDataEditing[field.key] ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <hr></hr>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // To center it vertically as well
          textAlign: 'center',
        }}
      >
        {' '}
        {/* <Typography variant="h4" gutterBottom>
          Homework Management
        </Typography> */}
        <HomeworkManager />
      </Box>
    </MainLayout>
  );
};

export default InstructorDash;
