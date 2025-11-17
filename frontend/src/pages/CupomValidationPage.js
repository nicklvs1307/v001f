import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Slide,
} from '@mui/material';
import {
  CheckCircleOutline,
  ErrorOutline,
  ConfirmationNumber,
  Redeem,
  Event,
  Person,
  Today,
  AccessTime,
  Close,
  Search,
  QrCodeScanner
} from '@mui/icons-material';
import cupomService from '../services/cupomService';
import { formatDateForDisplay } from '../utils/dateUtils';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CupomValidationPage = () => {
  const { cupomId } = useParams();
  const [codigo, setCodigo] = useState(cupomId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cupom, setCupom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);

  useEffect(() => {
    if (cupomId) {
      handleSearch();
    }
  }, [cupomId]);

  const handleSearch = async () => {
    if (!codigo) return;
    setLoading(true);
    setError('');
    setCupom(null);
    setValidationSuccess(false);
    try {
      const result = await cupomService.getCupomByCodigo(codigo);
      setCupom(result);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Cupom não encontrado ou inválido.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!cupom) return;
    setLoading(true);
    setError('');
    try {
      await cupomService.validateCupom(cupom.codigo);
      setValidationSuccess(true);
      // Update cupom status locally for immediate feedback
      setCupom({ ...cupom, status: 'used', dataUtilizacao: new Date().toISOString() });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao validar cupom.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay state reset to allow for closing animation
    setTimeout(() => {
        setCupom(null);
        setError('');
        setValidationSuccess(false);
        setCodigo('');
    }, 300);
  };

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

  const renderCupomDetails = () => (
    <DialogContent dividers>
        {validationSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleOutline color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h5" gutterBottom>Cupom Validado com Sucesso!</Typography>
                <Typography color="text.secondary">O cupom *{cupom.codigo}* foi marcado como utilizado.</Typography>
            </Box>
        ) : (
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
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </DialogContent>
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)' }}>
            <ConfirmationNumber color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Validação de Cupom
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Insira o código do cupom para verificar sua validade e detalhes.
            </Typography>
            <Box 
                component="form" 
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, maxWidth: 600, mx: 'auto' }}
            >
                <TextField
                    label="Código do Cupom"
                    fullWidth
                    variant="outlined"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    autoFocus
                />
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    onClick={handleSearch}
                    disabled={loading || !codigo}
                    startIcon={<Search />}
                    sx={{ py: 1.5, px: 4, whiteSpace: 'nowrap' }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
                </Button>
            </Box>
            {error && !isModalOpen && <Alert severity="error" sx={{ mt: 3, textAlign: 'left' }}>{error}</Alert>}
        </Paper>

        <Dialog
            open={isModalOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleCloseModal}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {validationSuccess ? "Sucesso" : "Detalhes do Cupom"}
                <IconButton aria-label="close" onClick={handleCloseModal}>
                    <Close />
                </IconButton>
            </DialogTitle>
            {cupom && renderCupomDetails()}
            <DialogActions sx={{ p: 2 }}>
                {validationSuccess ? (
                    <Button onClick={handleCloseModal} variant="contained" fullWidth>Fechar</Button>
                ) : (
                    <Button 
                        onClick={handleValidate} 
                        variant="contained" 
                        color="success" 
                        disabled={loading || cupom?.status !== 'active'}
                        startIcon={<Redeem />}
                        fullWidth
                    >
                        {loading ? <CircularProgress size={24} /> : 'Validar Cupom'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CupomValidationPage;
