import { Book, MicExternalOn, Quiz, SupervisedUserCircle } from '@mui/icons-material';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ALL_LO_TYPES, LoType, sparqlQuery } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  capitalizeFirstLetter,
  extractProjectIdAndFilepath,
  localStore,
  PRIMARY_COL,
} from '@stex-react/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoListDisplay from '../components/LoListDisplay';
import LoCartModal, { CartItem } from '../components/LoCartModal';
import MainLayout from '../layouts/MainLayout';
import { LoExplorer } from '../components/lo-explorer';

const LoExplorerPage = () => {
  return (
    <MainLayout title="Learning Objects | ALeA">
      <Paper elevation={3} sx={{ m: '16px' }}>
        <LoExplorer />
      </Paper>
    </MainLayout>
  );
};

export default LoExplorerPage;
