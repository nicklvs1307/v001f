import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import cupomService from '../services/cupomService';
import recompensaService from '../services/recompensaService';

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

  useEffect(() => {
    fetchCupons();
    fetchRecompensas();
  }, []);

  const fetchCupons = async () => {
    try {
      setLoading(true);
      const data = await cupomService.getAllCupons();
      setCupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar cupons.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecompensas = async () => {
    try {
      const data = await recompensaService.getAllRecompensas();
      setRecompensas(data);
    } catch (err) {
      console.error('Erro ao buscar recompensas:', err);
    }
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
      fetchCupons();
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
                  <TableCell>{new Date(cupom.dataGeracao).toLocaleDateString()}</TableCell>
                  <TableCell>{cupom.dataUtilizacao ? new Date(cupom.dataUtilizacao).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{new Date(cupom.dataValidade).toLocaleDateString()}</TableCell>
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
          <DialogContent>
            <DialogContentText>
              <strong>Código:</strong> {selectedCupom.codigo}
            </DialogContentText>
            <DialogContentText>
              <strong>Recompensa:</strong> {selectedCupom.recompensa?.name}
            </DialogContentText>
            <DialogContentText>
              <strong>Cliente:</strong> {selectedCupom.cliente?.name || 'N/A'}
            </DialogContentText>
            <DialogContentText>
              <strong>Email do Cliente:</strong> {selectedCupom.cliente?.email || 'N/A'}
            </DialogContentText>
            <DialogContentText>
              <strong>Telefone do Cliente:</strong> {selectedCupom.cliente?.phone || 'N/A'}
            </DialogContentText>
            <DialogContentText>
              <strong>Empresa:</strong> {selectedCupom.tenant?.name || 'N/A'}
            </DialogContentText>
            <DialogContentText>
              <strong>Data de Geração:</strong> {new Date(selectedCupom.dataGeracao).toLocaleString()}
            </DialogContentText>
            <DialogContentText>
              <strong>Data de Validade:</strong> {new Date(selectedCupom.dataValidade).toLocaleString()}
            </DialogContentText>
            <DialogContentText>
              <strong>Data de Utilização:</strong> {selectedCupom.dataUtilizacao ? new Date(selectedCupom.dataUtilizacao).toLocaleString() : 'N/A'}
            </DialogContentText>
            <DialogContentText>
              <strong>Status:</strong> {selectedCupom.status}
            </DialogContentText>
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
          <TextField
            margin="dense"
            name="dataValidade"
            label="Data de Validade"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            value={newCupomData.dataValidade}
            onChange={handleGenerateCupomChange}
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
