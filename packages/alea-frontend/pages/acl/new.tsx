import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { CreateACLRequest } from '@stex-react/api';
import axios from 'axios';
import { NextPage } from 'next';
import { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const CreateACl: NextPage = () => {
  const [aclId, setAclId] = useState<string | ''>('');
  const [description, setDescription] = useState<string | ''>('');
  const [memberUserIds, setMemberUserIds] = useState<string[]>([]);
  const [memberACLIds, setMemberACLIds] = useState<string[]>([]);
  const [updaterACLId, setUpdaterACLId] = useState<string | ''>('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddMemberId = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      setMemberUserIds([...memberUserIds, event.target.value]);
      event.target.value = '';
    }
  };

  const handleRemoveMemberId = (idToRemove: string) => {
    setMemberUserIds(memberUserIds.filter((id) => id !== idToRemove));
  };

  const handleAddMemberACL = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      setMemberACLIds([...memberACLIds, event.target.value]);
      event.target.value = '';
    }
  };

  const handleRemoveMemberACL = (aclToRemove: string) => {
    setMemberACLIds(memberACLIds.filter((acl) => acl !== aclToRemove));
  };

  const handleSubmit = async () => {
    const newAcl: CreateACLRequest = {
      id: aclId,
      description,
      memberUserIds,
      memberACLIds,
      updaterACLId,
      isOpen,
    };
    console.log('New ACL:', newAcl);
    try {
      const res = await axios.post('/api/access-control/create-acl', newAcl);
      console.log(res);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <MainLayout>
      <Box mx="10px">
        <Box width="100%" m="0px 20px">
          <Typography fontSize={24} m="10px 0px">
            Create ACL
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
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
            sx={{ mb: '20px' }}
            fullWidth
          />
          <Box mb="20px">
            <TextField
              label="Add Member ID"
              variant="outlined"
              size="small"
              onKeyPress={handleAddMemberId}
              sx={{ mb: '10px' }}
              fullWidth
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {memberUserIds.map((id, index) => (
                <Chip
                  key={index}
                  label={id}
                  onDelete={() => handleRemoveMemberId(id)}
                />
              ))}
            </Box>
          </Box>
          <Box mb="20px">
            <TextField
              label="Add Member ACL"
              variant="outlined"
              size="small"
              onKeyPress={handleAddMemberACL}
              sx={{ mb: '10px' }}
              fullWidth
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {memberACLIds.map((acl, index) => (
                <Chip
                  key={index}
                  label={acl}
                  onDelete={() => handleRemoveMemberACL(acl)}
                />
              ))}
            </Box>
          </Box>
          <TextField
            label="Updater ACL"
            variant="outlined"
            value={updaterACLId}
            onChange={(e) => setUpdaterACLId(e.target.value)}
            size="small"
            sx={{ mb: '20px' }}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
              />
            }
            label="Is Open"
            sx={{ mb: '20px' }}
          />
          <Button
            sx={{ m: '20px' }}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Create
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CreateACl;
