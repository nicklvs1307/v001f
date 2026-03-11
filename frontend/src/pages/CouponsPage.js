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
  TablePagination,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GavelIcon from '@mui/icons-material/Gavel';
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
  
  // Estados para paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCupons, setTotalCupons] = useState(0);

  // Estado para o valor do input de busca, separado dos filtros da API
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    recompensaId: '',
    startDate: null,
    endDate: null,
    useStartDate: null,
    useEndDate: null,
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para cancelamento
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchCupons = useCallback(async (appliedFilters, currentPage, currentRowsPerPage) => {
    try {
      setLoading(true);
      const data = await cupomService.getAllCupons({
        ...appliedFilters,
        page: currentPage + 1,
        limit: currentRowsPerPage
      });
      
      if (data && data.cupons) {
        setCupons(data.cupons);
        setTotalCupons(data.total);
      } else {
        setCupons(Array.isArray(data) ? data : []);
        setTotalCupons(Array.isArray(data) ? data.length : 0);
      }
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
      setPage(0); // Volta para a primeira página ao pesquisar
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Efeito para buscar os dados quando os filtros ou paginação mudam
  useEffect(() => {
    fetchCupons(filters, page, rowsPerPage);
  }, [filters, page, rowsPerPage, fetchCupons]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleNonSearchFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0); // Reseta para a primeira página ao mudar filtros
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
      useStartDate: null,
      useEndDate: null,
    });
    setPage(0);
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
      fetchCupons(filters, page, rowsPerPage);
      handleCloseGenerateForm();
    } catch (err) {
      setNotification({ open: true, message: err.message || 'Falha ao gerar cupom.', severity: 'error' });
    }
  };

  const handleRowClick = (cupom) => {
    setSelectedCupom(cupom);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedCupom(null);
  };

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
      fetchCupons(filters, page, rowsPerPage);
    } catch (err) {
      setNotification({ open: true, message: err.message || 'Falha ao cancelar o cupom.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateCupom = async () => {
    if (!selectedCupom) return;

    setIsSubmitting(true);
    try {
      await cupomService.validateCupom(selectedCupom.codigo);
      setNotification({ open: true, message: 'Cupom validado com sucesso!', severity: 'success' });
      handleCloseDetailsDialog();
      fetchCupons(filters, page, rowsPerPage);
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
      case 'canceled':
        color = 'error';
        label = 'Cancelado';
        break;
      default:
        color = 'default';
        label = status;
    }

    return <Chip label={label} color={color} size="small" />;
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  if (loading && cupons.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando cupons...</Typography>
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

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
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
                <MenuItem value="canceled">Cancelado</MenuItem>
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
              label="Gerado em (Início)"
              value={filters.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Gerado em (Fim)"
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
              size="small"
              sx={{ height: '40px' }}
            >
              Limpar
            </Button>
          </Grid>

          {/* Segunda linha de filtros para utilização */}
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
              FILTRAR POR DATA DE UTILIZAÇÃO:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Usado em (Início)"
              value={filters.useStartDate}
              onChange={(date) => handleDateChange('useStartDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Usado em (Fim)"
              value={filters.useEndDate}
              onChange={(date) => handleDateChange('useEndDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : cupons.map((cupom) => (
                <TableRow 
                  key={cupom.id} 
                  onClick={() => handleRowClick(cupom)} 
                  hover
                  style={{ cursor: 'pointer' }}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCupons}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
        />
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
              <Typography variant="body2" color="text.secondary">{selectedCupom.recompensa?.description}</Typography>
            </Box>

            {selectedCupom.recompensa?.conditionDescription && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                    <GavelIcon sx={{ mr: 1 }} /> Regras e Condições
                  </Typography>
                  <Box sx={{ mt: 1, p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {selectedCupom.recompensa.conditionDescription}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                <AssignmentIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Origem (Pesquisa)
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedCupom.pesquisa?.title || 'Origem não identificada'}
              </Typography>
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
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            >
              Validar Cupom
            </Button>
          </DialogActions>
        </Dialog>
      )}

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
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Cancelamento'}
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