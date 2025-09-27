import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Icon,
  Chip,
  Divider,
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline, ConfirmationNumber, Redeem, Event, Person, Today, AccessTime } from '@mui/icons-material';
import cupomService from '../services/cupomService';
import { format } from 'date-fns';

const CupomValidationPage = () => {
  const [codigo, setCodigo] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    setLoading(true);
    setError('');
    setValidationResult(null);
    try {
      const result = await cupomService.validateCupom(codigo);
      setValidationResult({ success: true, message: result.message, cupom: result.cupom });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao validar cupom.';
      setValidationResult({ success: false, message: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (cupom) => {
    const isExpired = new Date(cupom.dataValidade) < new Date();
    if (cupom.status === 'used') {
      return <Chip label="Utilizado" color="warning" />;
    }
    if (isExpired) {
      return <Chip label="Expirado" color="error" />;
    }
    return <Chip label="Ativo" color="success" />;
  };

  const renderCupomDetails = (cupom) => (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 4, backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
        <ConfirmationNumber sx={{ mr: 1 }} /> Detalhes do Cupom
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1"><strong>Código:</strong> {cupom.codigo}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1, color: 'text.secondary' }} />
            <strong>Cliente:</strong> {cupom.cliente?.name || 'Não identificado'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Today sx={{ mr: 1, color: 'text.secondary' }} />
            <strong>Gerado em:</strong> {format(new Date(cupom.dataGeracao), 'dd/MM/yyyy HH:mm')}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Event sx={{ mr: 1, color: 'text.secondary' }} />
            <strong>Validade:</strong> {format(new Date(cupom.dataValidade), 'dd/MM/yyyy')}
          </Typography>
        </Grid>
        {cupom.status === 'used' && cupom.dataUtilizacao && (
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
              <strong>Utilizado em:</strong> {format(new Date(cupom.dataUtilizacao), 'dd/MM/yyyy HH:mm')}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <Typography variant="body1"><strong>Status:</strong> {getStatusChip(cupom)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Redeem sx={{ mr: 1 }} /> Recompensa
          </Typography>
          <Typography variant="body1"><strong>Nome:</strong> {cupom.recompensa?.name}</Typography>
          <Typography variant="body1"><strong>Tipo:</strong> {cupom.recompensa?.type}</Typography>
          <Typography variant="body1"><strong>Valor:</strong> {cupom.recompensa?.value}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Validação de Cupom
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Insira o código do cupom para verificar sua validade e detalhes.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Código do Cupom"
            fullWidth
            variant="outlined"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleValidate}
            disabled={loading || !codigo}
            sx={{ py: 1.5, px: 4, whiteSpace: 'nowrap' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar'}
          </Button>
        </Box>
      </Paper>

      {validationResult && (
        <Box sx={{ mt: 4 }}>
          <Alert
            severity={validationResult.success ? 'success' : 'error'}
            iconMapping={{
              success: <CheckCircleOutline fontSize="inherit" />,
              error: <ErrorOutline fontSize="inherit" />,
            }}
            sx={{ mb: 2, '.MuiAlert-message': { fontSize: '1.1rem', fontWeight: 'bold' } }}
          >
            {validationResult.message}
          </Alert>
          {validationResult.success && validationResult.cupom && renderCupomDetails(validationResult.cupom)}
        </Box>
      )}

      {error && !validationResult?.success && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
    </Container>
  );
};

export default CupomValidationPage;