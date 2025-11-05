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
  Modal,
  useTheme,
  IconButton,
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline, ConfirmationNumber, Redeem, Event, Person, Today, AccessTime, Close } from '@mui/icons-material';
import cupomService from '../services/cupomService';
import { format } from 'date-fns';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const CupomValidationPage = () => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCupom, setSelectedCupom] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const theme = useTheme();

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSelectedCupom(null);
    try {
      const result = await cupomService.getCupomByCodigo(codigo);
      setSelectedCupom(result);
      setOpenModal(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao buscar cupom.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setLoading(true);
    setError('');
    try {
      await cupomService.validateCupom(selectedCupom.codigo);
      setOpenModal(false);
      alert('Cupom validado com sucesso!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao validar cupom.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await cupomService.deleteCupom(selectedCupom.id);
      setOpenModal(false);
      alert('Cupom deletado com sucesso!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao deletar cupom.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCupom(null);
    setError('');
  };

  const getStatusChip = (cupom) => {
    switch (cupom.status) {
      case 'active':
        return <Chip label="Ativo" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pendente" color="info" size="small" />;
      case 'used':
        return <Chip label="Utilizado" color="warning" size="small" />;
      case 'expired':
        return <Chip label="Expirado" color="error" size="small" />;
      default:
        return <Chip label={cupom.status} size="small" />;
    }
  };

  const renderCupomDetails = (cupom) => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
        <ConfirmationNumber sx={{ mr: 1 }} /> Detalhes do Cupom
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" component="h3" color="text.primary">{cupom.recompensa?.name}</Typography>
          <Typography variant="body2" color="text.secondary">{cupom.recompensa?.description}</Typography>
        </Grid>
        <Grid item xs={12}><Divider /></Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Código do Cupom</Typography>
          <Typography variant="h6" component="p" fontWeight="bold">{cupom.codigo}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Status</Typography>
          {getStatusChip(cupom)}
        </Grid>
        <Grid item xs={12}><Divider /></Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}><Person sx={{ mr: 1 }} /> Cliente</Typography>
          <Typography variant="body1">{cupom.cliente?.name || 'Não identificado'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}><Today sx={{ mr: 1 }} /> Gerado em</Typography>
          <Typography variant="body1">{format(new Date(cupom.dataGeracao), 'dd/MM/yyyy HH:mm')}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}><Event sx={{ mr: 1 }} /> Válido até</Typography>
          <Typography variant="body1">{format(new Date(cupom.dataValidade), 'dd/MM/yyyy')}</Typography>
        </Grid>
        {cupom.status === 'used' && cupom.dataUtilizacao && (
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}><AccessTime sx={{ mr: 1 }} /> Utilizado em</Typography>
            <Typography variant="body1">{format(new Date(cupom.dataUtilizacao), 'dd/MM/yyyy HH:mm')}</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 4, sm: 8 }, mb: 4 }}>
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
            onClick={handleSearch}
            disabled={loading || !codigo}
            sx={{ py: 1.5, px: 4, whiteWhiteSpace: 'nowrap' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
          </Button>
        </Box>
      </Paper>



      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
          {selectedCupom && renderCupomDetails(selectedCupom)}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
          <Box sx={{ mt: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
            <Button variant="contained" color="success" onClick={handleValidate} disabled={loading || selectedCupom?.status !== 'active'} fullWidth>
              Validar Cupom
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete} disabled={loading} fullWidth>
              Excluir Cupom
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default CupomValidationPage;