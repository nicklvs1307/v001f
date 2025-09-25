import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Paper, Alert } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import roletaService from '../services/roletaService';
import SpinTheWheel from '../components/roleta/SpinTheWheel';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicPageLayout from '../components/layout/PublicPageLayout';

const RoulettePage = () => {
  const { clientId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winningItem, setWinningItem] = useState(null);
  const [winningIndex, setWinningIndex] = useState(-1);
  const [generatedCupom, setGeneratedCupom] = useState(null);
  const [isLoadingItems, setIsLoadingItems] = useState(true);


  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchRoletaConfig = async () => {
      if (!clientId) {
      showNotification(t('roulette.error_client_id_missing'), 'warning');
        return;
      }
      try {
        setIsLoadingItems(true);
        const configData = await roletaService.getRoletaConfig(clientId);
        setConfig(configData);
        setItems(configData.items || []);
      } catch (err) {
        showNotification(err.response?.data?.message || err.message || t('roulette.error_fetching_config'), 'error');
      } finally {
        setIsLoadingItems(false);
        setLoading(false);
      }
    };

    fetchRoletaConfig();
  }, [clientId, t, showNotification]);

  const handleSpin = async () => {
    if (!clientId) {
      showNotification(t('roulette.error_client_id_missing'), 'warning');
      return;
    }

    setSpinning(true);
    try {
      const result = await roletaService.spin(clientId);
      const wonItem = result.premio;
      const generatedCupomData = result.cupom;

      const foundIndex = items.findIndex(item => item.recompensa.name === wonItem.recompensa.name);

      if (foundIndex === -1) {
        showNotification(t('roulette.error_winning_item_not_found'), 'error');
        setSpinning(false);
        return;
      }

      setWinningItem(wonItem);
      setWinningIndex(foundIndex);
      setGeneratedCupom(generatedCupomData);

    } catch (err) {
      showNotification(err.response?.data?.message || err.message || t('roulette.error_spinning_wheel'), 'error');
      setSpinning(false);
    }
  };

  const handleAnimationComplete = () => {
    setSpinning(false);
    if (winningItem) {
      showNotification(t('roulette.win_message'), 'success');
      navigate(`/parabens`, { state: { premio: winningItem, cupom: generatedCupom } });
    } else {
      console.error("Winning item is null after spin animation completes.");
      showNotification(t('roulette.error_no_winning_item'), 'error');
    }
  };

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
    <PublicPageLayout maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {config?.title || t('roulette.title')}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
        {config?.description || t('roulette.description')}
      </Typography>

      <Paper elevation={6} sx={{ my: 4, p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <SpinTheWheel
          items={items}
          winningItem={winningItem}
          winningIndex={winningIndex}
          onAnimationComplete={handleAnimationComplete}
        />
      </Paper>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleSpin}
        disabled={spinning || winningIndex !== -1}
        sx={{ mt: 3 }}
      >
        {spinning ? <CircularProgress size={24} /> : t('roulette.spin_button')}
      </Button>
    </PublicPageLayout>
  );
};

export default RoulettePage;
