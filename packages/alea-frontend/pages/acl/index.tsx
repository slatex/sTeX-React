import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { NextPage } from 'next';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import axios from 'axios';
import Link from 'next/link';

interface Acls {
  id: string;
}

const AclPage: NextPage = () => {
  const router = useRouter();
  const [acls, setAcls] = useState<Acls[]>([]);

  useEffect(() => {
    const fetchAcls = async () => {
      const { data } = await axios.get('api/access-control');
      setAcls(data);
    };
    fetchAcls();
  }, []);

  return (
    <MainLayout title="ACL Page">
      <Box
        sx={{
          m: '0 auto',
          maxWidth: '800px',
          p: '10px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <h1>All ACL's</h1>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('acl/new')}
          >
            Go to create new ACL
          </Button>
        </Box>

        <List>
          {acls.map((acl, index) => (
            <Link href={`acl/${acl?.id}`} key={index}>
              <Box>
                <ListItem
                  button
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <ListItemText
                    primary={acl?.id}
                    primaryTypographyProps={{
                      fontWeight: 'bold',
                    }}
                  />
                </ListItem>
                {index < acls.length - 1 && <Divider />}
              </Box>
            </Link>
          ))}
        </List>
      </Box>
    </MainLayout>
  );
};

export default AclPage;
