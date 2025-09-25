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
import roletaPremioService from '../services/roletaPremioService';
import RoletaPremioForm from '../components/roleta/RoletaPremioForm';

const RoletaPremiosPage = () => {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingPremio, setEditingPremio] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [premioToDelete, setPremioToDelete] = useState(null);

  useEffect(() => {
    fetchPremios();
  }, []);

  const fetchPremios = async () => {
    try {
      setLoading(true);
      const data = await roletaPremioService.getAllPremios();
      setPremios(data.premios && Array.isArray(data.premios) ? data.premios : []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar prêmios da roleta.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (premio = null) => {
    setEditingPremio(premio);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingPremio(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingPremio) {
        await roletaPremioService.updatePremio(editingPremio.id, formData);
      } else {
        await roletaPremioService.createPremio(formData);
      }
      fetchPremios();
      handleCloseForm();
    } catch (err) {
      setError(err.message || 'Erro ao salvar prêmio.');
    }
  };

  const handleOpenConfirm = (premio) => {
    setPremioToDelete(premio);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setPremioToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await roletaPremioService.deletePremio(premioToDelete.id);
      fetchPremios();
      handleCloseConfirm();
    } catch (err) {
      setError(err.message || 'Erro ao deletar prêmio.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando prêmios...</Typography>
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
        <Typography variant="h4" component="h1">Prêmios da Roleta</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Novo Prêmio
        </Button>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome do Prêmio</TableCell>
                <TableCell>Recompensa Associada</TableCell>
                <TableCell>Probabilidade (Peso)</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {premios.map((premio) => (
                <TableRow key={premio.id}>
                  <TableCell>{premio.nome}</TableCell>
                  <TableCell>{premio.recompensa?.name || 'N/A'}</TableCell>
                  <TableCell>{premio.probabilidade}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenForm(premio)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleOpenConfirm(premio)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <RoletaPremioForm
        open={openForm}
        handleClose={handleCloseForm}
        premio={editingPremio}
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
            Tem certeza que deseja deletar o prêmio "{premioToDelete?.nome}"?
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

export default RoletaPremiosPage;