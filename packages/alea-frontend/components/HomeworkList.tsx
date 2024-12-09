import { Delete, Edit, OpenInNew } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getHomework, HomeworkInfo, HomeworkStub } from '@stex-react/api';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { getLocaleObject } from '../lang/utils';

const HomeworkList = ({
  homeworkStubs,
  onCreate,
  handleEdit,
  confirmDelete,
}: {
  homeworkStubs: HomeworkStub[];
  onCreate: () => void;
  handleEdit: (homework: HomeworkInfo) => void;
  confirmDelete: (homeworkId: number) => void;
}) => {
  const { homeworkManager: t } = getLocaleObject(useRouter());
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          mb: 2,
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          {t.homeworks}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onCreate()}
          sx={{
            borderRadius: '25px',
            marginLeft: '5px',
          }}
        >
          {t.createHomework}{' '}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: '500px', overflowY: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }}>{t.title}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{t.givenTs}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{t.dueTs}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{t.feedbackReleaseTs}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{t.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {homeworkStubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="h6" sx={{ textAlign: 'center' }}>
                    {t.noHomeworksAvailable}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {homeworkStubs.map((homework) => {
              const formattedGivenTs = dayjs(homework.givenTs).format('YYYY-MM-DD HH:mm');
              const formattedDueTs = dayjs(homework.dueTs).format('YYYY-MM-DD HH:mm');
              const formattedReleaseDate = dayjs(homework.feedbackReleaseTs).format(
                'YYYY-MM-DD HH:mm'
              );

              return (
                <TableRow key={homework.id}>
                  <TableCell>
                    {mmtHTMLToReact(homework.title)}
                    <a
                      href={`/homework-doc?id=${homework.id}&courseId=${homework.courseId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <IconButton>
                        <OpenInNew />
                      </IconButton>
                    </a>
                  </TableCell>
                  <TableCell>{formattedGivenTs}</TableCell>
                  <TableCell>{formattedDueTs}</TableCell>
                  <TableCell>{formattedReleaseDate}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={async () => {
                        handleEdit((await getHomework(homework.id)).homework);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => confirmDelete(homework.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default HomeworkList;
