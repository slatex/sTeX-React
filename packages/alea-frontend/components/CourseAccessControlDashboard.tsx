import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import {
  createAcl,
  getCourseAcls,
  getSpecificAclIds,
  isValid,
  updateResourceAction,
} from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceActionPair } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface AclData {
  notes: string;
  quiz: string;
  homework: string;
  comments: string;
  'study-buddy': string;
}

const FIELDS = [
  { key: 'notes', label: 'Notes Management' },
  { key: 'quiz', label: 'Quiz Management' },
  { key: 'homework', label: 'Homework Management' },
  { key: 'comments', label: 'Comments Moderation' },
  { key: 'study-buddy', label: 'Study Buddy Management' },
] as const;

const getResourseActionPairs = (courseId: string) => [
  {
    resourceId: `/course/${courseId}/instance/${CURRENT_TERM}/notes`,
    actionId: Action.MUTATE,
  },
  {
    resourceId: `/course/${courseId}/instance/${CURRENT_TERM}/quiz`,
    actionId: Action.MUTATE,
  },
  {
    resourceId: `/course/${courseId}/instance/${CURRENT_TERM}/homework`,
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

const CourseAccessControlDashboard = ({ courseId }) => {
  const router = useRouter();
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

  const [isAnyDataEditing, setIsAnyDataEditing] = useState({
    notes: false,
    quiz: false,
    homework: false,
    comments: false,
    'study-buddy': false,
  });
  const [editingValues, setEditingValues] = useState({
    notes: '',
    quiz: '',
    comments: '',
    "study-buddy": '',
  });
  const [aclData, setAclData] = useState<AclData>({
    notes: '',
    quiz: '',
    homework: '',
    comments: '',
    'study-buddy': '',
  });
  const [acls, setAcls] = useState<string[]>([]);
  const [newAclId, setNewAclId] = useState('');
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
  const resourceActionPairs: ResourceActionPair[] = getResourseActionPairs(courseId);

  const updateAclId = async (field: keyof AclData, aclId: string) => {
    const resourceId = `/course/${courseId}/instance/${CURRENT_TERM}/${field}`;
    const actionId = resourceActionPairs.find((r) => r.resourceId === resourceId)?.actionId || '';
    const res = await isValid(aclId);
    if (!res) {
      console.error('invalid aclId');
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
        notes: aclIds[`/course/${courseId}/instance/${CURRENT_TERM}/notes`],
        quiz: aclIds[`/course/${courseId}/instance/${CURRENT_TERM}/quiz`],
        homework: aclIds[`/course/${courseId}/instance/${CURRENT_TERM}/homework`],
        comments: aclIds[`/course/${courseId}/instance/${CURRENT_TERM}/comments`],
        'study-buddy': aclIds[`/course/${courseId}/instance/${CURRENT_TERM}/study-buddy`],
      });

      setEditingValues({
        notes: aclIds[`/course/${courseId}/instance/${CURRENT_TERM}/notes`],
        quiz: aclIds[`/course/${courseId}/instance/${CURRENT_TERM}/quiz`],
        comments: aclIds[`/course/${courseId}/instance/${CURRENT_TERM}/comments`],
        'study-buddy': aclIds[`/course/${courseId}/instance/${CURRENT_TERM}/study-buddy`],
      });
    }
    getAclData();
  }, [courseId]);

  async function getAcls() {
    const data = await getCourseAcls(courseId, CURRENT_TERM);
    setAcls(data);
  }

  useEffect(() => {
    if (!courseId) return;
    getAcls();
  }, [courseId]);

  async function handleCreateAclClick() {
    if (!newAclId || !courseId) return;
    const aclId = `${courseId}-${CURRENT_TERM}-${newAclId}`;
    const updaterACLId = `${courseId}-${CURRENT_TERM}-instructors`;
    const res = await isValid(updaterACLId);
    if (!res) {
      setNewAclId('');
      return;
    }
    await createAcl({
      id: aclId,
      description: `${newAclId} for ${courseId} (${CURRENT_TERM})`,
      memberUserIds: [],
      memberACLIds: [],
      updaterACLId,
      isOpen: false,
    });
    setNewAclId('');
    getAcls();
  }

  return (
    <Box display="flex" flexDirection="column" maxWidth="900px" m="auto" p="20px" gap="20px">
      <Grid container spacing={1}>
        {FIELDS.map((field) => (
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
      <Typography variant="h5">Course Associated ACLs</Typography>
      <List
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {acls.map((acl, index) => {
          return (
            <Box key={acl} sx={{ flex: '1 0 200px' }}>
              <ListItem
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  textAlign: 'center',
                }}
                onClick={() => router.push(`/acl/${acl}`)}
                disableGutters
              >
                <ListItemText primary={acl || '-'} sx={{ fontSize: '14px' }} />
              </ListItem>
            </Box>
          );
        })}
      </List>
      <Typography variant="h5">Create New ACL</Typography>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ ml: 1, fontSize: 14 }}>
          {courseId ? `${courseId}-${CURRENT_TERM}-` : ''}
        </Typography>
        <TextField
          value={newAclId}
          onChange={(e) => setNewAclId(e.target.value)}
          size="small"
          sx={{ mb: 0, width: '20%', fontSize: '12px', ml: 0.5, p: 0 }}
          label="New ACL"
        />
        <Button onClick={handleCreateAclClick} variant="contained" sx={{ mt: 0, ml: 1 }}>
          Create
        </Button>
      </Box>
    </Box>
  );
};

export default CourseAccessControlDashboard;
