import { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  createResourceAction,
  deleteResourceAction,
  getAllResourceActions,
  isValid,
  recomputeMemberships,
  UpdateResourceAction,
  updateResourceAction,
} from '@stex-react/api';
import { useEffect, useState } from 'react';
import { Action } from '@stex-react/utils';

const SysAdmin: NextPage = () => {
  const [aclId, setAclId] = useState<string | null>('');
  const [resourceId, setResourceId] = useState<string | null>('');
  const [actionId, setActionId] = useState<string | null>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [resourceActions, setResourceActions] = useState([]);
  const [isRecomputing, setIsRecomputing] = useState<boolean>(false);
  const [editing, setEditing] = useState<UpdateResourceAction | null>(null);
  const [newAclId, setNewAclId] = useState<string | null>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteResource, setDeleteResource] = useState<{
    resourceId: string;
    actionId: string;
  } | null>(null);

  useEffect(() => {
    async function getAllResources() {
      try {
        const data = await getAllResourceActions();
        setResourceActions(data);
      } catch (e) {
        console.error(e);
      }
    }
    getAllResources();
  }, []);

  async function handleRecomputeClick() {
    try {
      setIsRecomputing(true);
      await recomputeMemberships();
      setIsRecomputing(false);
    } catch (e) {
      console.log(e);
      setIsRecomputing(false);
    }
  }
  async function handleCreateClick() {
    if (!aclId || !resourceId || !actionId) return;
    try {
      const isAclValid = await isValid(aclId);
      if(!isAclValid){
        setAclId('');
        setError('invalid acl id');
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(true);
      await createResourceAction({ aclId, resourceId, actionId});
      setResourceActions((prev) => [
        ...prev,
        {
          aclId,
          resourceId,
          actionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      setAclId('');
      setResourceId('');
      setActionId('');
      setError('');
      setIsSubmitting(false);
    } catch (e) {
      console.log(e);
      setError(e.response.data.message);
      setIsSubmitting(false);
    }
  }

  async function handleUpdateClick(resourceId: string, actionId: string) {
    try {
      if (!(await isValid(newAclId))) {
        setError('Invalid ACL');
        return;
      }
      await updateResourceAction({ resourceId, actionId, aclId: newAclId });
      setEditing(null);
      setNewAclId('');
      setError('');
      setResourceActions((prev) =>
        prev.map((entry) =>
          entry.resourceId === resourceId && entry.actionId === actionId
            ? { ...entry, aclId: newAclId, updatedAt: new Date().toISOString() }
            : entry
        )
      );
    } catch (e) {
      console.log(e);
      setError(e.response.data.message);
    }
  }
  const handleEditClick = ({ aclId, actionId, resourceId }: UpdateResourceAction) => {
    setEditing({ aclId, actionId, resourceId });
    setNewAclId(aclId);
  };

  function handleDeleteClick(resId: string, actionId: string) {
    setDeleteDialogOpen(true);
    setDeleteResource({ resourceId: resId, actionId: actionId });
  }
  function handleDeleteCancel() {
    setDeleteDialogOpen(false);
    setDeleteResource(null);
  }
  async function handleDeleteConfirm() {
    try {
      await deleteResourceAction(deleteResource?.resourceId, deleteResource?.actionId);
      setResourceActions((prev) =>
        prev.filter(
          (entry) =>
            entry.resourceId !== deleteResource?.resourceId ||
            entry.actionId !== deleteResource?.actionId
        )
      );
      setDeleteDialogOpen(false);
      setDeleteResource(null);
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <MainLayout>
      <Button
        sx={{
          display: 'flex',
          alignItems: 'center',
          margin: '50px auto',
        }}
        variant="contained"
        color="primary"
        disabled={isRecomputing}
        onClick={() => handleRecomputeClick()}
      >
        Recompute Memberships
      </Button>
      <Box
        sx={{
          m: '0 auto',
          maxWidth: '600px',
          p: '10px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Typography fontSize={24} m="10px 0px">
          Create a New Resource Access
        </Typography>
        <TextField
          label="ACL ID"
          variant="outlined"
          value={aclId}
          onChange={(e) => setAclId(e.target.value)}
          size="small"
          sx={{ mb: '20px' }}
          fullWidth
        />
        <TextField
          label="Resource ID"
          variant="outlined"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          size="small"
          sx={{ mb: '20px' }}
          fullWidth
        />
        <Select
          value={actionId}
          onChange={(e) => setActionId(e.target.value as Action)}
          displayEmpty
          fullWidth
          sx={{ mb: '20px' }}
        >
          <MenuItem value="" disabled>
            Select Action
          </MenuItem>
          {Object.values(Action).map((action) => (
            <MenuItem key={action} value={action}>
              {action}
            </MenuItem>
          ))}
        </Select>
        {error != '' && (
          <Typography color="error" mb="20px">
            {error}
          </Typography>
        )}
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={handleCreateClick}
          disabled={isSubmitting || !aclId || !resourceId || !actionId}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h6">Resource Access Management</Typography>
      </Box>
      <TableContainer component={Paper} sx={{ maxWidth: 800, margin: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Resource ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ACL ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Updated At</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resourceActions.map((entry) => (
              <TableRow key={`${entry.resourceId}-${entry.actionId}`}>
                <TableCell>{entry.resourceId}</TableCell>
                <TableCell>{entry.actionId}</TableCell>
                <TableCell>
                  {error &&
                    editing?.aclId === entry.aclId &&
                    editing?.resourceId === entry.resourceId &&
                    editing?.actionId === entry.actionId && (
                      <Typography
                        color="error"
                        pb="5px"
                        variant="body2"
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {error}
                      </Typography>
                    )}
                  {editing?.aclId === entry.aclId &&
                  editing?.resourceId === entry.resourceId &&
                  editing?.actionId === entry.actionId ? (
                    <TextField
                      value={newAclId}
                      onChange={(e) => setNewAclId(e.target.value)}
                      size="small"
                    />
                  ) : (
                    entry.aclId
                  )}
                </TableCell>
                <TableCell>{entry.createdAt}</TableCell>
                <TableCell>{entry.updatedAt}</TableCell>
                <TableCell sx={{ textAlign: 'center', display: 'flex' }}>
                  {editing?.aclId === entry.aclId &&
                  editing?.resourceId === entry.resourceId &&
                  editing?.actionId === entry.actionId ? (
                    <IconButton
                      color="primary"
                      onClick={() => handleUpdateClick(entry.resourceId, entry.actionId)}
                    >
                      <CheckIcon />
                    </IconButton>
                  ) : (
                    <IconButton color="primary" onClick={() => handleEditClick(entry)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton
                    color="secondary"
                    onClick={() => handleDeleteClick(entry.resourceId, entry.actionId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the resource action with ID:{' '}
            {deleteResource?.resourceId}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default SysAdmin;
