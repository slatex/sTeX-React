import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import GroupIcon from '@mui/icons-material/Group';
import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { UpdateACLRequest, getAcl, isValid, updateAcl } from '@stex-react/api';

const UpdateAcl: NextPage = () => {
  const router = useRouter();
  const { query } = router;

  const [aclId, setAclId] = useState<string | ''>('');
  const [description, setDescription] = useState<string | ''>('');
  const [memberUserIds, setMemberUserIds] = useState<string[]>([]);
  const [memberACLIds, setMemberACLIds] = useState<string[]>([]);
  const [updaterACLId, setUpdaterACLId] = useState<string | ''>('');
  const [isOpen, setIsOpen] = useState(false);
  const [tempMemberUserId, setTempMemberUserId] = useState<string>('');
  const [tempMemberACL, setTempMemberACL] = useState<string>('');
  const [isInvalid, setIsInvalid] = useState<string>('');
  const [isUpdaterACLValid, setIsUpdaterACLValid] = useState<boolean>(true);
  useEffect(() => {
    const fetchAclDetails = async () => {
      if (query.aclId) {
        try {
          const acl = await getAcl(query.aclId as string);
          setAclId(acl.id);
          setDescription(acl.description);
          setMemberUserIds(acl.memberUserIds);
          setMemberACLIds(acl.memberACLIds);
          setUpdaterACLId(acl.updaterACLId);
          setIsOpen(acl.isOpen);
        } catch (e) {
          console.log(e);
        }
      }
    };
    fetchAclDetails();
  }, [query.aclId]);

  const handleAddMemberId = (
    event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>
  ) => {
    if (
      (event.type === 'keydown' &&
        (event as React.KeyboardEvent).key === 'Enter') ||
      event.type === 'click'
    ) {
      if (tempMemberUserId) {
        setMemberUserIds([...memberUserIds, tempMemberUserId]);
        setTempMemberUserId('');
      }
    }
  };

  const handleRemoveMemberId = (idToRemove: string) => {
    setMemberUserIds(memberUserIds.filter((id) => id !== idToRemove));
  };

  const handleAddMemberACL = async (
    event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>
  ) => {
    if (
      (event.type === 'keydown' &&
        (event as React.KeyboardEvent).key === 'Enter') ||
      event.type === 'click'
    ) {
      const res = await isValid(tempMemberACL);
      if (tempMemberACL && res) {
        setMemberACLIds([...memberACLIds, tempMemberACL]);
        setTempMemberACL('');
        setIsInvalid('');
      } else {
        setIsInvalid(`${tempMemberACL} is not a valid ACL.`);
      }
    }
  };

  const handleRemoveMemberACL = (aclToRemove: string) => {
    setMemberACLIds(memberACLIds.filter((acl) => acl !== aclToRemove));
  };

  const handleSubmit = async () => {
    const updatedAcl: UpdateACLRequest = {
      id: aclId,
      description,
      memberUserIds,
      memberACLIds,
      updaterACLId,
      isOpen,
    };
    try {
      await updateAcl(updatedAcl);
      router.replace(`/acl/${aclId}`);
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdaterACLIdBlur = async () => {
    if (updaterACLId) {
      const isValidUpdater = await isValid(updaterACLId);
      setIsUpdaterACLValid(isValidUpdater);
    } else {
      setIsUpdaterACLValid(null);
    }
  };

  return (
    <MainLayout>
      <Box
        sx={{
          m: '0 auto',
          maxWidth: '800px',
          p: '10px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Typography fontSize={24} m="10px 0px">
          Update ACL
        </Typography>
        <TextField
          label="ACL ID"
          variant="outlined"
          value={aclId}
          disabled
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
            value={tempMemberUserId}
            onChange={(e) => setTempMemberUserId(e.target.value)}
            onKeyDown={handleAddMemberId}
            sx={{ mb: '10px' }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton onClick={handleAddMemberId}>
                    <AccountCircle />
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
            value={tempMemberACL}
            onChange={(e) => setTempMemberACL(e.target.value)}
            onKeyDown={handleAddMemberACL}
            sx={{ mb: '10px' }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton onClick={handleAddMemberACL}>
                    <GroupIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {isInvalid ? (
            <Typography color="error">{isInvalid}</Typography>
          ) : null}
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
          onBlur={handleUpdaterACLIdBlur}
          size="small"
          sx={{ mb: '20px' }}
          fullWidth
          error={isUpdaterACLValid === false}
          helperText={
            isUpdaterACLValid === false ? 'Updater ACL is invalid' : ''
          }
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
          disabled={!aclId || !updaterACLId || !isUpdaterACLValid}
        >
          Update
        </Button>
      </Box>
    </MainLayout>
  );
};

export default UpdateAcl;
