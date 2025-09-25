import React from 'react';
import { Box, Typography } from '@mui/material';
import CriterioList from '../components/criterios/CriterioList';

const CriterioPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Critérios de Avaliação
      </Typography>
      <CriterioList />
    </Box>
  );
};

export default CriterioPage;
