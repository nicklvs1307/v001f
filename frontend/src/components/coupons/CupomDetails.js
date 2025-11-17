import React from 'react';
import {
  Grid,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  Person,
  Today,
  Event,
  AccessTime,
} from '@mui/icons-material';
import { formatDateForDisplay } from '../../utils/dateUtils';

const getStatusChip = (status) => {
  const statusMap = {
    active: { label: 'Ativo', color: 'success' },
    pending: { label: 'Pendente', color: 'info' },
    used: { label: 'Utilizado', color: 'warning' },
    expired: { label: 'Expirado', color: 'error' },
  };
  const { label, color } = statusMap[status] || { label: status, color: 'default' };
  return <Chip label={label} color={color} size="small" sx={{ fontWeight: 'bold' }} />;
};

const CupomDetails = ({ cupom }) => {
  if (!cupom) return null;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" component="h3" color="text.primary">{cupom.recompensa?.name}</Typography>
        <Typography variant="body2" color="text.secondary">{cupom.recompensa?.description}</Typography>
      </Grid>
      <Grid item xs={12}><Divider /></Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" color="text.secondary">Código</Typography>
        <Typography variant="h6" component="p" fontWeight="bold">{cupom.codigo}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" color="text.secondary">Status</Typography>
        {getStatusChip(cupom.status)}
      </Grid>
      <Grid item xs={12}><Divider /></Grid>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}><Person sx={{ mr: 1 }} /> Cliente</Typography>
        <Typography variant="body1">{cupom.cliente?.name || 'Não identificado'}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}><Today sx={{ mr: 1 }} /> Gerado em</Typography>
        <Typography variant="body1">{formatDateForDisplay(cupom.dataGeracao, 'dd/MM/yyyy HH:mm')}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}><Event sx={{ mr: 1 }} /> Válido até</Typography>
        <Typography variant="body1">{formatDateForDisplay(cupom.dataValidade, 'dd/MM/yyyy')}</Typography>
      </Grid>
      {cupom.status === 'used' && cupom.dataUtilizacao && (
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}><AccessTime sx={{ mr: 1 }} /> Utilizado em</Typography>
          <Typography variant="body1">{formatDateForDisplay(cupom.dataUtilizacao, 'dd/MM/yyyy HH:mm')}</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default CupomDetails;
