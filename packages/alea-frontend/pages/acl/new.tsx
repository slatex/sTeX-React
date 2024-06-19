import { Box, Button, TextField, Typography, Checkbox, FormControlLabel, IconButton, Chip } from "@mui/material";
import { NextPage } from "next";
import MainLayout from "packages/alea-frontend/layouts/MainLayout";
import { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from "axios";

const CreateACl: NextPage = () => {
  const [aclId, setAclId] = useState<string|''>('');
  const [description, setDescription] = useState<string|''>('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberACLs, setMemberACLs] = useState<string[]>([]);
  const [updaterACL, setUpdaterACL] = useState<string|''>('');
  const [isOpen, setIsOpen] = useState<Boolean>(false);

  const handleAddMemberId = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      setMemberIds([...memberIds, event.target.value]);
      event.target.value = '';
    }
  };

  const handleRemoveMemberId = (idToRemove:string) => {
    setMemberIds(memberIds.filter(id => id !== idToRemove));
  };

  const handleAddMemberACL = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      setMemberACLs([...memberACLs, event.target.value]);
      event.target.value = '';
    }
  };

  const handleRemoveMemberACL = (aclToRemove:string) => {
    setMemberACLs(memberACLs.filter(acl => acl !== aclToRemove));
  };

  const handleSubmit = async () => {
    const newAcl = {
      id: aclId,
      description,
      memberIds,
      memberACLs,
      updaterACL,
      isOpen
    };
    console.log('New ACL:', newAcl);
    try{
      const res = await axios.post('/api/access-control', newAcl);
      console.log(res);
    }
    catch(e){
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
              {memberIds.map((id, index) => (
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
              {memberACLs.map((acl, index) => (
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
            value={updaterACL}
            onChange={(e) => setUpdaterACL(e.target.value)}
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
