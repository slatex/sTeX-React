import { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';
import { Box, List, ListItemButton, ListItemText } from '@mui/material';
import {
  mmtHTMLToReact,
} from '@stex-react/stex-react-renderer';
import {
  deleteGraded,
  getMyGraded,
  getUserInfo,
  GradingWithAnswer,
  UserInfo,
} from '@stex-react/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PeerReviewGradedItemDisplay } from '../components/peer-review/PeerReviewGradedItemDisplay';
function GradedItemsList({
  gradedItems,
  onSelectItem,
}: {
  gradedItems: GradingWithAnswer[];
  onSelectItem: (answerId: number) => void;
}) {
  return (
    <Box maxHeight="50vh" overflow="scroll">
      <List disablePadding>
        {gradedItems.map(({ questionTitle, answer, id }, idx) => (
          <ListItemButton
            key={`${questionTitle}-${id}-${idx}`}
            onClick={(e) => onSelectItem(id)}
            sx={{ py: 0, bgcolor: idx % 2 === 0 ? '#f0f0f0' : '#ffffff' }}
          >
            <ListItemText
              primary={questionTitle ? mmtHTMLToReact(questionTitle) : id}
              secondary={mmtHTMLToReact(
                questionTitle.slice(0, questionTitle.length > 20 ? 20 : questionTitle.length)
              )}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

const MyGrading: NextPage = () => {
  const [gradingItems, setGradingItems] = useState<GradingWithAnswer[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [selected, setSelected] = useState<{ gradedId: number } | undefined>(undefined);
  const router = useRouter();
  useEffect(() => {
    getUserInfo().then((info) => {
      if (!info) {
        router.push('/login');
        return;
      }
      getMyGraded().then((g) => {
        setGradingItems(g);
      });
      setUserInfo(info);
    });
  }, [router]);
  const onDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this grade?')) {
      deleteGraded(id).then(() => {
        getMyGraded().then((g) => {
          setGradingItems(g);
        });
        setSelected(undefined);
      });
    }
  };
  return (
    <MainLayout title="My Grading">
      <Box display="flex" mt={1} flexWrap="wrap" rowGap={0.5}>
        <Box sx={{ border: '1px solid #ccc' }} flex="1 1 200px" maxWidth={300}>
          <GradedItemsList
            gradedItems={gradingItems}
            onSelectItem={(gradedId) => setSelected({ gradedId })}
          />
        </Box>
        <Box border="1px solid #ccc" flex="1 1 400px" p={2} maxWidth="fill-available">
          {selected ? (
            <PeerReviewGradedItemDisplay
              grade={gradingItems.find((item) => item.id === selected.gradedId)}
              onDelete={onDelete}
            />
          ) : (
            <i>Please click on a Graded item on the left.</i>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};
export default MyGrading;
