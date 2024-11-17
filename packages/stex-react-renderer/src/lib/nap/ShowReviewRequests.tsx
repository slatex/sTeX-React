import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { mmtHTMLToReact } from '../mmtParser';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
export function ShowReviewRequests({
  reviewRequests,
  courseId,
  onAnswerSelected,
}: {
  reviewRequests: any[];
  courseId: string;
  onAnswerSelected: (answerId: number) => void;
}) {
  return (
    <Box maxWidth={'md'}>
      {reviewRequests?.map((c) => (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {mmtHTMLToReact(c.questionTitle)}
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {c.answers.map((d) => (
                <>
                  <ListItemButton onClick={() => onAnswerSelected(d.id)}>
                    <ListItemText
                      primary={d.answer}
                      secondary={`Sub Problem: ${+d.subProblemId + 1}`}
                      style={{ whiteSpace: 'pre-line' }}
                    />
                  </ListItemButton>
                  <Divider></Divider>
                </>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
      {reviewRequests.length === 0 && <span>No problem found!</span>}
    </Box>
  );
}
