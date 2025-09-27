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
import RoletaForm from '../components/roleta/RoletaForm';

const RoletasPage = () => {
  const [roletas, setRoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingRoleta, setEditingRoleta] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [roletaToDelete, setRoletaToDelete] = useState(null);

  useEffect(() => {
    fetchRoletas();
  }, []);

  const fetchRoletas = async () => {
    try {
      setLoading(true);
      const data = await roletaService.getAllRoletas();
      setRoletas(data.roletas && Array.isArray(data.roletas) ? data.roletas : []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar roletas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (roleta = null) => {
    setEditingRoleta(roleta);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingRoleta(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingRoleta) {
        await roletaService.updateRoleta(editingRoleta.id, formData);
      } else {
        await roletaService.createRoleta(formData);
      }
      fetchRoletas();
      handleCloseForm();
    } catch (err) {
      setError(err.message || 'Erro ao salvar roleta.');
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
    try {
      await roletaService.deleteRoleta(roletaToDelete.id);
      fetchRoletas();
      handleCloseConfirm();
    } catch (err) {
      setError(err.message || 'Erro ao deletar roleta.');
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
          onClick={() => handleOpenForm()}
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
                    <Button component={RouterLink} to={`/roletas/${roleta.id}/premios`}>
                      Prêmios
                    </Button>
                    <IconButton color="primary" onClick={() => handleOpenForm(roleta)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleOpenConfirm(roleta)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <RoletaForm
        open={openForm}
        handleClose={handleCloseForm}
        roleta={editingRoleta}
        handleSubmit={handleSubmitForm}
      />

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
          <Button onClick={handleCloseConfirm} color="primary">Cancelar</Button>
          <Button onClick={handleDelete} color="secondary" autoFocus>Deletar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoletasPage;
