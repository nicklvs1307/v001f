import React, { useState, useEffect, useContext } from 'react';
import criterioService from '../../services/criterioService';
import AuthContext from '../../context/AuthContext';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  Backdrop,
  Fade,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CriterioForm from './CriterioForm';
import { ROLES } from '../../constants/roles'; // Importando a constante ROLES
import { useNotification } from '../../context/NotificationContext'; // Import useNotification

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const CriterioList = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [criterios, setCriterios] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(''); // Removed
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedCriterio, setSelectedCriterio] = useState(null);
  // const [formError, setFormError] = useState(''); // Removed
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const { showNotification } = useNotification(); // Get showNotification

  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    // setFormError(''); // Removed
  };

  const handleOpenEditModal = (criterio) => {
    setSelectedCriterio(criterio);
    setFormData(criterio);
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => {
    setSelectedCriterio(null);
    setOpenEditModal(false);
    // setFormError(''); // Removed
  };

  const handleOpenDeleteConfirm = (criterio) => {
    setSelectedCriterio(criterio);
    setOpenDeleteConfirm(true);
  };
  const handleCloseDeleteConfirm = () => {
    setSelectedCriterio(null);
    setOpenDeleteConfirm(false);
  };

  const fetchCriterios = async () => {
    try {
      setLoading(true);
      const data = await criterioService.getAllCriterios();
      setCriterios(data);
      // setError(''); // Removed
    } catch (err) {
      showNotification(err.message || 'Falha ao buscar critérios.', 'error'); // Show error notification
      // setError(err.message || 'Falha ao buscar critérios.'); // Removed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriterios();
  }, [showNotification]); // Add showNotification to dependencies

  const handleCriterioCreated = async (criterioData) => {
    try {
      // setFormError(''); // Removed
      const newCriterio = await criterioService.createCriterio(criterioData);
      setCriterios((prevCriterios) => [...prevCriterios, newCriterio]);
      handleCloseCreateModal();
      showNotification('Critério criado com sucesso!', 'success'); // Show success notification
    } catch (err) {
      showNotification(err.message || 'Erro ao criar critério.', 'error'); // Show error notification
      // setFormError(err.message || 'Erro ao criar critério.'); // Removed
    }
  };

  const handleCriterioUpdated = async (criterioData) => {
    try {
      // setFormError(''); // Removed
      await criterioService.updateCriterio(selectedCriterio.id, criterioData);
      setCriterios((prevCriterios) =>
        prevCriterios.map((criterio) =>
          criterio.id === selectedCriterio.id ? { ...criterio, ...criterioData } : criterio
        )
      );
      handleCloseEditModal();
      showNotification('Critério atualizado com sucesso!', 'success'); // Show success notification
    } catch (err) {
      showNotification(err.message || 'Erro ao atualizar critério.', 'error'); // Show error notification
      // setFormError(err.message || 'Erro ao atualizar critério.'); // Removed
    }
  };

  const handleCriterioDeleted = async () => {
    try {
      await criterioService.deleteCriterio(selectedCriterio.id);
      setCriterios((prevCriterios) =>
        prevCriterios.filter((criterio) => criterio.id !== selectedCriterio.id)
      );
      handleCloseDeleteConfirm();
      showNotification('Critério deletado com sucesso!', 'success'); // Show success notification
    } catch (err) {
      showNotification(err.message || 'Falha ao deletar critério.', 'error'); // Show error notification
      // setError(err.message || 'Falha ao deletar critério.'); // Removed
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Gerenciamento de Critérios</Typography>
      {(currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === ROLES.ADMIN) && (
        <Button
          variant="contained"
          sx={{ mb: 2 }}
          onClick={handleOpenCreateModal}
          startIcon={<AddIcon />}
        >
          Criar Novo Critério
        </Button>
      )}

      {/* error && <Alert severity="error">{error}</Alert> */}
      <List>
        {criterios.length > 0 ? (
          criterios.map((criterio) => (
            <ListItem
              key={criterio.id}
              divider
              secondaryAction={
                <>
                  {(currentUser.role === ROLES.SUPER_ADMIN ||
                    (currentUser.role === ROLES.ADMIN && criterio.tenantId === currentUser.tenantId)) && (
                      <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditModal(criterio)}>
                        <EditIcon />
                      </IconButton>
                    )}
                  {(currentUser.role === ROLES.SUPER_ADMIN ||
                    (currentUser.role === ROLES.TENANT_ADMIN && criterio.tenantId === currentUser.tenantId)) && (
                      <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteConfirm(criterio)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                </>
              }
            >
              <ListItemText
                primary={criterio.name}
                secondary={criterio.description}
              />
            </ListItem>
          ))
        ) : (
          <Typography>Nenhum critério encontrado.</Typography>
        )}
      </List>

      {/* Modal para criar novo critério */}
      <Modal
        aria-labelledby="create-criterio-modal-title"
        aria-describedby="create-criterio-modal-description"
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openCreateModal}>
          <Box sx={modalStyle}>
            {/* formError was removed, global notification will handle it */}
            <CriterioForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCriterioCreated}
              loading={formLoading}
              // error={formError} // Removed
            />
          </Box>
        </Fade>
      </Modal>

      {/* Modal para editar critério */}
      <Modal
        aria-labelledby="edit-criterio-modal-title"
        aria-describedby="edit-criterio-modal-description"
        open={openEditModal}
        onClose={handleCloseEditModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openEditModal}>
          <Box sx={modalStyle}>
            {/* formError was removed, global notification will handle it */}
            {selectedCriterio && (
              <CriterioForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCriterioUpdated}
                loading={formLoading}
                // error={formError} // Removed
              />
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Diálogo de Confirmação para Deleção */}
      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmar Deleção"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja deletar o critério "{selectedCriterio?.name}"? Esta ação é irreversível.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancelar</Button>
          <Button onClick={handleCriterioDeleted} autoFocus color="error">
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CriterioList;
