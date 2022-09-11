import { Box, Card } from '@mui/material';
import { NextPage } from 'next';
import Link from 'next/link';
import { useEffect } from 'react';
import { ToursAutocomplete } from '../components/ToursAutocomplete';
import MainLayout from '../layouts/MainLayout';

const StudentHomePage: NextPage = () => {
  return (
    <MainLayout>
      <Box m="10px" maxWidth="600px">
        <h1>Courses</h1>

        <Box display="flex">
          <Link href="/course-view/ai-1" passHref>
            <Card
              sx={{
                backgroundColor: 'hsl(210, 20%, 95%)',
                border: '1px solid #CCC',
                p: '10px',
                m: '10px',
                cursor: 'pointer',
              }}
            >
              <img
                src="https://beta.techcrunch.com/wp-content/uploads/2009/06/robot-arm.jpg"
                width="205px"
                height="205px"
              />
              <span style={{ fontSize: '20px' }}>
                Artificial Intelligence - I
              </span>
            </Card>
          </Link>

          <Link href="/course-view/ai-2" passHref>
            <Card
              sx={{
                backgroundColor: 'hsl(210, 20%, 95%)',
                border: '1px solid #CCC',
                p: '10px',
                m: '10px',
                cursor: 'pointer',
              }}
            >
              <img
                src="https://solarsystem.nasa.gov/system/news_items/main_images/817_pia04413.jpg"
                width="205px"
                height="205px"
              />
              <br />
              <span style={{ fontSize: '20px' }}>
                Artificial Intelligence - II
              </span>
            </Card>
          </Link>
        </Box>
        <hr />
        <h1>Free Style Learning</h1>

        <ToursAutocomplete />
      </Box>
    </MainLayout>
  );
};

export default StudentHomePage;
