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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';
import roletaService from '../services/roletaService';

const RoletasPage = () => {
  const [roletas, setRoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [roletaToDelete, setRoletaToDelete] = useState(null);

  useEffect(() => {
    fetchRoletas();
  }, []);

  const fetchRoletas = async () => {
    try {
      setLoading(true);
      const response = await roletaService.getAll();
      setRoletas(response.data || []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar roletas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirm = (roleta) => {
    setRoletaToDelete(roleta);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setRoletaToDelete(null);
  };

  const handleDelete = async () => {
    if (!roletaToDelete) return;
    try {
      await roletaService.deleteRoleta(roletaToDelete.id);
      fetchRoletas(); // Re-fetch the list after deletion
    } catch (err) {
      setError(err.message || 'Erro ao deletar roleta.');
    } finally {
      handleCloseConfirm();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando roletas...</Typography>
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
        <Typography variant="h4" component="h1">Roletas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/dashboard/roletas/nova"
        >
          Nova Roleta
        </Button>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roletas.map((roleta) => (
                <TableRow key={roleta.id}>
                  <TableCell>{roleta.nome}</TableCell>
                  <TableCell>{roleta.descricao}</TableCell>
                  <TableCell>{roleta.active ? 'Ativa' : 'Inativa'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      component={RouterLink}
                      to={`/dashboard/roletas/editar/${roleta.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenConfirm(roleta)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja deletar a roleta "{roletaToDelete?.nome}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" autoFocus>Deletar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoletasPage;
