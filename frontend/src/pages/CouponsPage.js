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
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Divider,
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
import { debounce } from 'lodash';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { formatDateForDisplay } from '../utils/dateUtils';

const CupomListPage = () => {
  const [cupons, setCupons] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openGenerateForm, setOpenGenerateForm] = useState(false);
  const [newCupomData, setNewCupomData] = useState({
    recompensaId: '',
    clienteId: '', // Opcional
    dataValidade: '',
  });
  const [selectedCupom, setSelectedCupom] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    recompensaId: '',
    startDate: null,
    endDate: null,
  });

  const fetchCupons = useCallback(async (appliedFilters) => {
    try {
      setLoading(true);
      const data = await cupomService.getAllCupons(appliedFilters);
      setCupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar cupons.');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(debounce(fetchCupons, 500), [fetchCupons]);

  useEffect(() => {
    debouncedFetch(filters);
    fetchRecompensas();
  }, [filters, debouncedFetch]);

  const fetchRecompensas = async () => {
    try {
      const data = await recompensaService.getAll();
      setRecompensas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar recompensas:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFilters((prev) => ({ ...prev, [name]: date }));
  };

  const handleClearFilters = () => {
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
      fetchCupons(filters);
      handleCloseGenerateForm();
    } catch (err) {
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

  const getStatusChip = (status) => {
    let color;
    let label;

    switch (status) {
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

  if (loading) {
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

                <Grid item xs={12} md={4}>

                  <TextField

                    fullWidth

                    label="Pesquisar por prêmio ou cliente"

                    name="search"

                    value={filters.search}

                    onChange={handleFilterChange}

                    variant="outlined"

                    size="small"

                  />

                </Grid>

                <Grid item xs={12} md={2}>

                  <FormControl fullWidth size="small">

                    <InputLabel>Status</InputLabel>

                    <Select

                      name="status"

                      value={filters.status}

                      onChange={handleFilterChange}

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

                <Grid item xs={12} md={3}>

                  <FormControl fullWidth size="small">

                    <InputLabel>Recompensa</InputLabel>

                    <Select

                      name="recompensaId"

                      value={filters.recompensaId}

                      onChange={handleFilterChange}

                      label="Recompensa"

                    >

                      <MenuItem value="">Todas</MenuItem>

                      {recompensas.map((r) => (

                        <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>

                      ))}

                    </Select>

                  </FormControl>

                </Grid>

                <Grid item xs={12} md={3}>

                  <DatePicker

                    label="Data Início"

                    value={filters.startDate}

                    onChange={(date) => handleDateChange('startDate', date)}

                    inputFormat="dd/MM/yyyy"

                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}

                  />

                </Grid>

                <Grid item xs={12} md={3}>

                  <DatePicker

                    label="Data Fim"

                    value={filters.endDate}

                    onChange={(date) => handleDateChange('endDate', date)}

                    inputFormat="dd/MM/yyyy"

                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}

                  />

                </Grid>

                <Grid item xs={12} md={2}>

                  <Button

                    fullWidth

                    variant="outlined"

                    onClick={handleClearFilters}

                  >

                    Limpar Filtros

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
                <TableCell>Empresa</TableCell>
                <TableCell>Data Geração</TableCell>
                <TableCell>Data Utilização</TableCell>
                <TableCell>Validade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cupons.map((cupom) => (
                <TableRow key={cupom.id} onClick={() => handleRowClick(cupom)} style={{ cursor: 'pointer' }}>
                  <TableCell>{cupom.codigo}</TableCell>
                  <TableCell>{cupom.recompensa?.name}</TableCell>
                  <TableCell>{cupom.cliente?.name || 'N/A'}</TableCell>
                  <TableCell>{cupom.tenant?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDateForDisplay(cupom.dataGeracao, 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{cupom.dataUtilizacao ? formatDateForDisplay(cupom.dataUtilizacao, 'dd/MM/yyyy') : 'N/A'}</TableCell>
                  <TableCell>{formatDateForDisplay(cupom.dataValidade, 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{getStatusChip(cupom.status)}</TableCell>
                  <TableCell align="right">
                    {/* Ações como reenviar, editar validade, etc. */}
                    <IconButton color="primary" disabled={cupom.status !== 'active'}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" disabled={cupom.status !== 'active'}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para Detalhes do Cupom */}
      {selectedCupom && (
        <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog}>
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
              <Typography variant="body1" color="text.secondary">{selectedCupom.cliente?.name || 'N/A'}</Typography>
              <Typography variant="body2" color="text.secondary"><EmailIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 'small' }} /> {selectedCupom.cliente?.email || 'N/A'}</Typography>
              <Typography variant="body2" color="text.secondary"><PhoneIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 'small' }} /> {selectedCupom.cliente?.phone || 'N/A'}</Typography>
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
                  {selectedCupom.status === 'used' ? <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> : <CancelIcon sx={{ verticalAlign: 'middle', mr: 1 }} />} Data de Utilização
                </Typography>
                <Typography variant="body2" color="text.secondary">{selectedCupom.dataUtilizacao ? formatDateForDisplay(selectedCupom.dataUtilizacao, 'dd/MM/yyyy HH:mm') : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" component="div">
                  Status
                </Typography>
                {getStatusChip(selectedCupom.status)}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailsDialog} color="primary">
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog para Gerar Novo Cupom */}}
      <Dialog open={openGenerateForm} onClose={handleCloseGenerateForm}>
        <DialogTitle>Gerar Novo Cupom</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Recompensa</InputLabel>
            <Select
              name="recompensaId"
              value={newCupomData.recompensaId}
              onChange={handleGenerateCupomChange}
              label="Recompensa"
            >
              {recompensas.map((recompensa) => (
                <MenuItem key={recompensa.id} value={recompensa.id}>
                  {recompensa.name} ({recompensa.value} - {recompensa.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="clienteId"
            label="ID do Cliente (Opcional)"
            type="text"
            fullWidth
            variant="outlined"
            value={newCupomData.clienteId}
            onChange={handleGenerateCupomChange}
          />
          <DatePicker
            label="Data de Validade"
            value={newCupomData.dataValidade || null}
            onChange={(date) => handleGenerateCupomChange({ target: { name: 'dataValidade', value: date } })}
            inputFormat="dd/MM/yyyy"
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGenerateForm} color="secondary">Cancelar</Button>
          <Button onClick={handleGenerateCupomSubmit} color="primary">Gerar Cupom</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CupomListPage;
