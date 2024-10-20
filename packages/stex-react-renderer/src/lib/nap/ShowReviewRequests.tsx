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
}: {
  reviewRequests: any[];
  courseId: string;
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
                <Link
                  href={{
                    pathname: './[courseId]/[reviewId]',
                    query: { reviewId: d.id, courseId: courseId },
                  }}
                >
                  <ListItemButton>
                    <ListItemText
                      primary={d.answer}
                      secondary={`Sub Problem: ${+d.subProblemId + 1}`}
                      style={{ whiteSpace: 'pre-line' }}
                    />
                  </ListItemButton>
                  <Divider></Divider>
                </Link>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
