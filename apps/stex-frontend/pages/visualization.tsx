import {
  dagStratify,
  sugiyama,
  decrossOpt /*DagNode, zherebko, grid*/,
} from 'd3-dag';
import * as d3 from 'd3';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { DEFAULT_BASE_URL, PathToTour } from '@stex-react/utils';
import axios from 'axios';
import { Box, Link } from '@mui/material';
import { getUriWeights } from '../api/ums';
import { UserModelVisualization } from '../components/UserModelVisualization';
import { ToursAutocomplete } from '../components/ToursAutocomplete';

/*
 */
const VisPage: NextPage = () => {
  const [tourId, setTourId] = useState(
    'http://mathhub.info/smglom/topology?inherited-topology'
  );
  return (
    <MainLayout>
      <Box display="flex" m="5px" alignItems="center">
        <Box flexGrow={1} mr="10px">
          <ToursAutocomplete onSelect={setTourId} />
        </Box>
        <Link href={PathToTour(tourId)}>Go To Tour</Link>
      </Box>
      <UserModelVisualization tourId={tourId} />
    </MainLayout>
  );
};
export default VisPage;
