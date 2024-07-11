import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  IconButton,
  TextField,
} from '@mui/material';
import { AccessControlList, getAcl, isMember, isUserMember } from '@stex-react/api';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Link from 'next/link';
import { Edit } from '@mui/icons-material';

const AclId: NextPage = () => {
  const router = useRouter();
  const aclId = router.query.aclId as string;

  const [acls, setAcls] = useState<string[]>([]);
  const [allMemberUserIds, setAllMemberUserIds] = useState<string[]>([]);
  const [desc, setDesc] = useState<string>(null);
  const [updaterACLId, setUpdaterACLId] = useState<string>(null);
  const [userIsMember, setUserIsMember] = useState<boolean>(false);
  const [userIdInput, setUserIdInput] = useState<string>('');
  const [membershipStatus, setMembershipStatus] = useState<string>('');
  const [isUpdaterMember, setIsUpdaterMember] = useState<boolean>(false);

  async function getMembers() {
    try {
      const acl = await getAcl(aclId as string);
      setDesc(acl?.description);
      setUpdaterACLId(acl?.updaterACLId);
      const aclIds = new Set<string>();
      const userMembers = new Set<string>();

      acl.memberACLIds.forEach((m) => aclIds.add(m));
      acl.memberUserIds.forEach((m) => userMembers.add(m));
      setAllMemberUserIds(Array.from(userMembers));
      setAcls(Array.from(aclIds));
    } catch (e) {
      console.log(e);
    }
  }

  async function checkIsUserMember(){
      const res : boolean = await isUserMember(aclId as string);
      setUserIsMember(res);
  }

  async function handleCheckUser(){
    try{
      const res :  boolean = await isMember(aclId as string, userIdInput as string);
      setMembershipStatus(res ? `${userIdInput} is a member of this ACL.` : `${userIdInput} is not a member of this ACL.`);
    }catch(e){
      console.log(e);
    }
  }

  async function isUserIsUpdater(){
    try{
      const res : boolean = await isUserMember(updaterACLId);
      if(res){
        setIsUpdaterMember(true);
      }else{
        setIsUpdaterMember(false);
      }
    }catch(e){
      console.log(e);
    }
  }

  useEffect(() => {
    if (aclId) {
      getMembers();
      checkIsUserMember();
      isUserIsUpdater();
    }
  }, [aclId, updaterACLId]);

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
        <Box
          sx={{
            padding: '16px',
            margin: '16px 0',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" color="primary" gutterBottom>
              {aclId}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '30px' }}>

            <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: userIsMember ? 'green' : 'red',
              ml: 1, // shorthand for marginLeft: '10px'
            }}
          ></Box>
              {isUpdaterMember && <Button
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  variant="contained"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => router.push(`/acl/edit/${query?.aclId}`)}
                >
                  Edit
                </Button>
              }
            </Box>
          </Box>
          {desc && (
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
              Description: {desc}
            </Typography>
          )}
          {updaterACLId && (
            <Typography variant="subtitle1" color="textSecondary">
              Updater:{' '}
              <Link href={`/acl/${updaterACLId}`}>
                <Typography
                  variant="subtitle1"
                  color="secondary"
                  component="a"
                  sx={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  {updaterACLId}
                </Typography>
              </Link>
            </Typography>
          )}
          <Box sx={{ marginTop: '32px', display: 'flex', alignItems: 'center' }}>
            <TextField
              label="User ID"
              variant="outlined"
              size="small"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              sx={{ marginRight: '10px' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckUser}
            >
              Check Membership
            </Button>
          </Box>
          {membershipStatus && (
            <Typography sx={{ marginTop: '16px' }}>
              {membershipStatus}
            </Typography>
          )}

          {acls.length !== 0 && (
            <Box sx={{ marginTop: '32px' }}>
              <Typography variant="h6" color="secondary">
                Member ACLs
              </Typography>
              <List>
                {acls.map((aclId, index) => (
                  <React.Fragment key={aclId}>
                    <ListItem
                      button
                      component="a"
                      href={`/acl/${aclId}`}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <ListItemText primary={aclId} />
                    </ListItem>
                    {index < acls.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {allMemberUserIds.length !== 0 && (
            <Box sx={{ marginTop: '32px' }}>
              <Typography variant="h6" color="secondary">
                Direct Members
              </Typography>
              <List>
                {allMemberUserIds.map((user, index) => (
                  <React.Fragment key={user}>
                    <ListItem
                      button
                      component="a"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <ListItemText primary={user} />
                    </ListItem>
                    {index < allMemberUserIds.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AclId;



