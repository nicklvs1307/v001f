import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Divider,
  Snackbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import cupomService from '../services/cupomService';
import recompensaService from '../services/recompensaService';
import { formatDateForDisplay } from '../utils/dateUtils';

const CupomListPage = () => {
  const [cupons, setCupons] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openGenerateForm, setOpenGenerateForm] = useState(false);
  const [newCupomData, setNewCupomData] = useState({
    recompensaId: '',
    clienteId: '',
    dataValidade: '',
  });
  const [selectedCupom, setSelectedCupom] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  
  // Estado para o valor do input de busca, separado dos filtros da API
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    recompensaId: '',
    startDate: null,
    endDate: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estados para cancelamento
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchCupons = useCallback(async (appliedFilters) => {
    // ... (mantém o existente)
  }, []);

  // ... (mantém efeitos e handlers existentes até handleCloseDetailsDialog)

  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancelReason('');
  };

  const handleCancelCupom = async () => {
    if (!selectedCupom || !cancelReason.trim()) {
      setNotification({ open: true, message: 'Motivo do cancelamento é obrigatório.', severity: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      await cupomService.cancelCupom(selectedCupom.id, cancelReason);
      setNotification({ open: true, message: 'Cupom cancelado com sucesso!', severity: 'success' });
      handleCloseCancelDialog();
      handleCloseDetailsDialog();
      fetchCupons(filters);
    } catch (err) {
      setNotification({ open: true, message: err.message || 'Falha ao cancelar o cupom.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (mantém o restante até o return)
      const data = await cupomService.getAllCupons(appliedFilters);
      setCupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar cupons.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para aplicar o debounce na busca
  useEffect(() => {
    const timerId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500); // 500ms de delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Efeito para buscar os dados quando os filtros (exceto o search) mudam
  useEffect(() => {
    fetchCupons(filters);
  }, [filters, fetchCupons]);

  useEffect(() => {
    const fetchRecompensas = async () => {
      try {
        const data = await recompensaService.getAll();
        setRecompensas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao buscar recompensas:', err);
      }
    };
    fetchRecompensas();
  }, []);

  const handleNonSearchFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (name, date) => {
    setFilters((prev) => ({ ...prev, [name]: date }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      search: '',
      status: '',
      recompensaId: '',
      startDate: null,
      endDate: null,
    });
  };

  const handleOpenGenerateForm = () => {
    setOpenGenerateForm(true);
  };

  const handleCloseGenerateForm = () => {
    setOpenGenerateForm(false);
    setNewCupomData({
      recompensaId: '',
      clienteId: '',
      dataValidade: '',
    });
  };

  const handleGenerateCupomChange = (e) => {
    const { name, value } = e.target;
    setNewCupomData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateCupomSubmit = async () => {
    try {
      await cupomService.generateCupom(newCupomData);
      setNotification({ open: true, message: 'Cupom gerado com sucesso!', severity: 'success' });
      fetchCupons(filters);
      handleCloseGenerateForm();
    } catch (err) {
      setNotification({ open: true, message: err.message || 'Falha ao gerar cupom.', severity: 'error' });
    }
  };

  const handleRowClick = (cupom) => {
    if (cupom.status === 'used' || cupom.status === 'expired') return;
    setSelectedCupom(cupom);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedCupom(null);
  };

  const handleValidateCupom = async () => {
    if (!selectedCupom) return;

    setIsSubmitting(true);
    try {
      await cupomService.validateCupom(selectedCupom.codigo);
      setNotification({ open: true, message: 'Cupom validado com sucesso!', severity: 'success' });
      handleCloseDetailsDialog();
      fetchCupons(filters);
    } catch (err) {
      setNotification({ open: true, message: err.message || 'Falha ao validar o cupom.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusChip = (status) => {
    let color;
    let label;

    switch (status) {
      case 'active':
        color = 'primary';
        label = 'Ativo';
        break;
      case 'pending':
        color = 'warning';
        label = 'Pendente';
        break;
      case 'used':
        color = 'success';
        label = 'Utilizado';
        break;
      case 'expired':
        color = 'error';
        label = 'Expirado';
        break;
      default:
        color = 'default';
        label = status;
    }

    return <Chip label={label} color={color} size="small" />;
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // O loading principal agora é mais sobre a busca inicial
  if (loading && cupons.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando cupons...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Gestão de Cupons</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenGenerateForm}
        >
          Gerar Novo Cupom
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Pesquisar por prêmio ou cliente"
              name="search"
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleNonSearchFilterChange}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="used">Utilizado</MenuItem>
                <MenuItem value="expired">Expirado</MenuItem>
                <MenuItem value="pending">Pendente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Recompensa</InputLabel>
              <Select
                name="recompensaId"
                value={filters.recompensaId}
                onChange={handleNonSearchFilterChange}
                label="Recompensa"
              >
                <MenuItem value="">Todas</MenuItem>
                {recompensas.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Data Início"
              value={filters.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Data Fim"
              value={filters.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Recompensa</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Data Geração</TableCell>
                <TableCell>Validade</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && cupons.map((cupom) => (
                <TableRow 
                  key={cupom.id} 
                  onClick={() => handleRowClick(cupom)} 
                  hover
                  style={{ cursor: (cupom.status === 'used' || cupom.status === 'expired') ? 'default' : 'pointer' }}
                >
                  <TableCell>{cupom.codigo}</TableCell>
                  <TableCell>{cupom.recompensa?.name}</TableCell>
                  <TableCell>{cupom.client?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDateForDisplay(cupom.dataGeracao)}</TableCell>
                  <TableCell>{formatDateForDisplay(cupom.dataValidade)}</TableCell>
                  <TableCell>{getStatusChip(cupom.status)}</TableCell>
                </TableRow>
              ))}
              {!loading && cupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">Nenhum cupom encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedCupom && (
        <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Detalhes do Cupom</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                <CardGiftcardIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Recompensa
              </Typography>
              <Typography variant="body1" color="text.secondary">{selectedCupom.recompensa?.name}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Cliente
              </Typography>
              <Typography variant="body1" color="text.secondary">{selectedCupom.client?.name || 'N/A'}</Typography>
              <Typography variant="body2" color="text.secondary"><EmailIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 'small' }} /> {selectedCupom.client?.email || 'N/A'}</Typography>
              <Typography variant="body2" color="text.secondary"><PhoneIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 'small' }} /> {selectedCupom.client?.phone || 'N/A'}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" component="div">
                  <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Empresa
                </Typography>
                <Typography variant="body2" color="text.secondary">{selectedCupom.tenant?.name || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" component="div">
                  <CalendarTodayIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Data de Geração
                </Typography>
                <Typography variant="body2" color="text.secondary">{formatDateForDisplay(selectedCupom.dataGeracao, 'dd/MM/yyyy HH:mm')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" component="div">
                  <CalendarTodayIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Data de Validade
                </Typography>
                <Typography variant="body2" color="text.secondary">{formatDateForDisplay(selectedCupom.dataValidade, 'dd/MM/yyyy HH:mm')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" component="div">
                  {selectedCupom.status === 'used' ? <CheckCircleIcon color="success" sx={{ verticalAlign: 'middle', mr: 1 }} /> : <CancelIcon color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />} Data de Utilização
                </Typography>
                <Typography variant="body2" color="text.secondary">{selectedCupom.dataUtilizacao ? formatDateForDisplay(selectedCupom.dataUtilizacao, 'dd/MM/yyyy HH:mm') : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" component="div">
                  Status
                </Typography>
                {getStatusChip(selectedCupom.status)}
                
                {selectedCupom.status === 'canceled' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#fff5f5', borderRadius: 1, border: '1px solid #ffc1c1' }}>
                    <Typography variant="caption" color="error" sx={{ fontWeight: 700, display: 'block' }}>MOTIVO DO CANCELAMENTO:</Typography>
                    <Typography variant="body2">{selectedCupom.cancellationReason || 'Não informado'}</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailsDialog}>Fechar</Button>
            
            {(selectedCupom.status === 'active' || selectedCupom.status === 'pending') && (
              <Button 
                onClick={handleOpenCancelDialog}
                color="error"
                variant="outlined"
                disabled={isSubmitting}
                startIcon={<CancelIcon />}
              >
                Cancelar
              </Button>
            )}

            <Button 
              onClick={handleValidateCupom} 
              color="primary" 
              variant="contained"
              disabled={isSubmitting || (selectedCupom.status !== 'active' && selectedCupom.status !== 'pending')}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              Validar Cupom
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog para Gerar Novo Cupom ... (código omitido para brevidade) */}

      {/* Dialog para Cancelar Cupom */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancelar Cupom</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Você tem certeza que deseja cancelar este cupom? Esta ação é irreversível.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Motivo do Cancelamento"
            type="text"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            helperText="Por favor, informe o motivo para registro."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            Voltar
          </Button>
          <Button 
            onClick={handleCancelCupom} 
            color="error" 
            variant="contained"
            disabled={isSubmitting || !cancelReason.trim()}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Confirmar Cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CupomListPage;
