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
import recompensaService from '../services/recompensaService';
import RecompensaForm from '../components/recompensas/RecompensaForm';

const RecompensaListPage = () => {
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingRecompensa, setEditingRecompensa] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [recompensaToDelete, setRecompensaToDelete] = useState(null);

  useEffect(() => {
    fetchRecompensas();
  }, []);

  const fetchRecompensas = async () => {
    try {
      setLoading(true);
      const data = await recompensaService.getAll();
      setRecompensas(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar recompensas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (recompensa = null) => {
    setEditingRecompensa(recompensa);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingRecompensa(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingRecompensa) {
        await recompensaService.updateRecompensa(editingRecompensa.id, formData);
      } else {
        await recompensaService.createRecompensa(formData);
      }
      fetchRecompensas(); // Recarrega a lista inteira
      handleCloseForm();
    } catch (err) {
      setError(err.message || 'Erro ao salvar recompensa.');
    }
  };

  const handleOpenConfirm = (recompensa) => {
    setRecompensaToDelete(recompensa);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setRecompensaToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await recompensaService.deleteRecompensa(recompensaToDelete.id);
      fetchRecompensas();
      handleCloseConfirm();
    } catch (err) {
      setError(err.message || 'Erro ao deletar recompensa.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Recompensas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Nova Recompensa
        </Button>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : recompensas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Nenhuma recompensa encontrada.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                recompensas.map((recompensa) => (
                  <TableRow key={recompensa.id}>
                    <TableCell>{recompensa.name}</TableCell>
                    <TableCell>{recompensa.description}</TableCell>
                    <TableCell>{recompensa.value}</TableCell>
                    <TableCell>{recompensa.type}</TableCell>
                    <TableCell>{recompensa.active ? 'Ativo' : 'Inativo'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenForm(recompensa)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleOpenConfirm(recompensa)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <RecompensaForm
        open={openForm}
        handleClose={handleCloseForm}
        recompensa={editingRecompensa}
        handleSubmit={handleSubmitForm}
      />

      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Exclusão"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja deletar a recompensa {recompensaToDelete?.name}?
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

export default RecompensaListPage;
