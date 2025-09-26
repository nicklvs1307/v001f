import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Paper, Alert } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import roletaService from '../services/roletaService';
import SpinTheWheel from '../components/roleta/SpinTheWheel';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import PublicPageLayout from '../components/layout/PublicPageLayout';

const RoulettePage = () => {
  const { clientId } = useParams();
  const { t } = useTranslation();
const theme = useTheme();

  if (loading) {
    return (
      <PublicPageLayout maxWidth="md" textAlign="center">
        <CircularProgress />
        <Typography>{t('roulette.loading_wheel_config')}</Typography>
      </PublicPageLayout>
    );
  }

  if (!clientId) {
    return (
      <PublicPageLayout maxWidth="md" textAlign="center">
        <Alert severity="error">{t('roulette.error_client_id_missing')}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/`)}>{t('roulette.back_to_home')}</Button>
      </PublicPageLayout>
    );
  }

  if (isLoadingItems) {
    return (
      <PublicPageLayout maxWidth="md" textAlign="center">
        <CircularProgress />
        <Typography>{t('roulette.loading_wheel_config')}</Typography>
      </PublicPageLayout>
    );
  }

  if (items.length === 0) {
    return (
      <PublicPageLayout maxWidth="md" textAlign="center">
        <Alert severity="warning">{t('roulette.no_items_configured')}</Alert>
      </PublicPageLayout>
    );
  }



  return (
    <Box sx={{
      background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
    }}>
      <Box sx={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        p: { xs: 3, sm: 4 }
      }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {config?.title || t('roulette.title')}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
          {config?.description || t('roulette.description')}
        </Typography>

        {/* The SpinTheWheel component is placed directly inside the new card */}
        <SpinTheWheel
          items={items}
          winningItem={winningItem}
          winningIndex={winningIndex}
          onAnimationComplete={handleAnimationComplete}
        />

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSpin}
          disabled={spinning || winningIndex !== -1}
          sx={{ mt: 4, px: 5, py: 1.5, borderRadius: '50px', fontWeight: 'bold' }}
        >
          {spinning ? <CircularProgress size={24} color="inherit" /> : t('roulette.spin_button')}
        </Button>
      </Box>
    </Box>
  );
};

export default RoulettePage;
