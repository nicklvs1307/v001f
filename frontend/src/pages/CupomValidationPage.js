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
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline, ConfirmationNumber, Redeem, Event, Person, Today, AccessTime } from '@mui/icons-material';
import cupomService from '../services/cupomService';
import { format } from 'date-fns';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const CupomValidationPage = () => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCupom, setSelectedCupom] = useState(null);
  const [openModal, setOpenModal] = useState(false);

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
            onClick={handleSearch}
            disabled={loading || !codigo}
            sx={{ py: 1.5, px: 4, whiteSpace: 'nowrap' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {selectedCupom && renderCupomDetails(selectedCupom)}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" color="success" onClick={handleValidate} disabled={loading}>
              Validar Cupom
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>
              Excluir Cupom
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default CupomValidationPage;