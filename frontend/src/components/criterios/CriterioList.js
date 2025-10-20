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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CriterioForm from './CriterioForm';
import { ROLES } from '../../constants/roles';
import { useNotification } from '../../context/NotificationContext';

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
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openHelpModal, setOpenHelpModal] = useState(false); // State for the help modal
  const [selectedCriterio, setSelectedCriterio] = useState(null);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => setOpenCreateModal(false);

  const handleOpenEditModal = (criterio) => {
    setSelectedCriterio(criterio);
    setFormData(criterio);
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => {
    setSelectedCriterio(null);
    setOpenEditModal(false);
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
    } catch (err) {
      showNotification(err.message || 'Falha ao buscar critérios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriterios();
  }, [showNotification]);

  const handleCriterioCreated = async (criterioData) => {
    try {
      const newCriterio = await criterioService.createCriterio(criterioData);
      setCriterios((prevCriterios) => [...prevCriterios, newCriterio]);
      handleCloseCreateModal();
      showNotification('Critério criado com sucesso!', 'success');
    } catch (err) {
      showNotification(err.message || 'Erro ao criar critério.', 'error');
    }
  };

  const handleCriterioUpdated = async (criterioData) => {
    try {
      await criterioService.updateCriterio(selectedCriterio.id, criterioData);
      setCriterios((prevCriterios) =>
        prevCriterios.map((criterio) =>
          criterio.id === selectedCriterio.id ? { ...criterio, ...criterioData } : criterio
        )
      );
      handleCloseEditModal();
      showNotification('Critério atualizado com sucesso!', 'success');
    } catch (err) {
      showNotification(err.message || 'Erro ao atualizar critério.', 'error');
    }
  };

  const handleCriterioDeleted = async () => {
    try {
      await criterioService.deleteCriterio(selectedCriterio.id);
      setCriterios((prevCriterios) =>
        prevCriterios.filter((criterio) => criterio.id !== selectedCriterio.id)
      );
      handleCloseDeleteConfirm();
      showNotification('Critério deletado com sucesso!', 'success');
    } catch (err) {
      showNotification(err.message || 'Falha ao deletar critério.', 'error');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Gerenciamento de Critérios
        </Typography>
        <IconButton onClick={() => setOpenHelpModal(true)} color="primary" aria-label="ajuda sobre critérios">
          <InfoOutlinedIcon />
        </IconButton>
      </Box>

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
                primary={`${criterio.name} (${criterio.type})`}
                secondary={criterio.description}
              />
            </ListItem>
          ))
        ) : (
          <Typography>Nenhum critério encontrado.</Typography>
        )}
      </List>

      {/* Help Modal */}
      <Dialog open={openHelpModal} onClose={() => setOpenHelpModal(false)} maxWidth="md">
        <DialogTitle>Ajuda: Entendendo e Cadastrando Critérios</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography variant="body1" gutterBottom>
              Critérios são as bases para as perguntas da sua pesquisa. Cada critério que você cria pode ser associado a uma ou mais perguntas, permitindo agrupar os resultados e analisar o desempenho de áreas específicas do seu negócio.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>Como Cadastrar:</Typography>
            <ol>
              <li>Clique no botão <strong>"Criar Novo Critério"</strong>.</li>
              <li>Preencha o nome (ex: "Atendimento", "Qualidade do Produto").</li>
              <li>Selecione o <strong>Tipo de Critério</strong> que melhor se encaixa na sua pergunta.</li>
              <li>Adicione uma descrição (opcional).</li>
              <li>Salve.</li>
            </ol>
            <Typography variant="h6" sx={{ mt: 2 }}>Tipos de Critérios e Exemplos:</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" component="div"><strong>NPS (Net Promoter Score)</strong></Typography>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <strong>Uso:</strong> Mede a lealdade do cliente com uma única pergunta de escala.<br />
                <strong>Exemplo de Pergunta:</strong> "Em uma escala de 0 a 10, o quanto você recomendaria nosso restaurante a um amigo?"
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" component="div"><strong>CSAT (Customer Satisfaction Score)</strong></Typography>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <strong>Uso:</strong> Mede a satisfação com um serviço ou produto específico, geralmente com uma escala de 1 a 5.<br />
                <strong>Exemplo de Pergunta:</strong> "Qual o seu nível de satisfação com a limpeza do ambiente?" (com respostas de "Muito Insatisfeito" a "Muito Satisfeito").
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" component="div"><strong>CES (Customer Effort Score)</strong></Typography>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <strong>Uso:</strong> Mede o esforço que o cliente precisou fazer para resolver um problema ou usar um serviço.<br />
                <strong>Exemplo de Pergunta:</strong> "O quão fácil foi fazer o seu pedido?" (com respostas de "Muito Difícil" a "Muito Fácil").
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" component="div"><strong>Star (Avaliação por Estrelas)</strong></Typography>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <strong>Uso:</strong> Uma avaliação visual simples, geralmente de 1 a 5 estrelas.<br />
                <strong>Exemplo de Pergunta:</strong> "Como você avalia a nossa sobremesa?"
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" component="div"><strong>Text (Texto Livre)</strong></Typography>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <strong>Uso:</strong> Permite que o cliente deixe um comentário aberto. Este tipo de critério não gera um score numérico, mas é ótimo para coletar feedback qualitativo.<br />
                <strong>Exemplo de Pergunta:</strong> "Deixe sua sugestão ou comentário."
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHelpModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

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
            <CriterioForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCriterioCreated}
              loading={formLoading}
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
            {selectedCriterio && (
              <CriterioForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCriterioUpdated}
                loading={formLoading}
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
