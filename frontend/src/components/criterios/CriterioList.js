import React, { useState, useEffect, useContext } from 'react';
import criterioService from '../../services/criterioService';
import AuthContext from '../../context/AuthContext';
import {
  Box,
  Typography,
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const CriterioList = () => {
  const { user: currentUser } = useContext(AuthContext);
  console.log('Role do usuário em CriterioList:', currentUser.role);
  const [criterios, setCriterios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openHelpModal, setOpenHelpModal] = useState(false);
  const [selectedCriterio, setSelectedCriterio] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { showNotification } = useNotification();

  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => setOpenCreateModal(false);

  const handleOpenEditModal = (criterio) => {
    setSelectedCriterio(criterio);
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
  }, []);

  const handleCriterioCreated = async (criterioData) => {
    try {
      const newCriterio = await criterioService.createCriterio(criterioData);
      setCriterios((prev) => [newCriterio, ...prev]);
      handleCloseCreateModal();
      showNotification('Critério criado com sucesso!', 'success');
    } catch (err) {
      showNotification(err.message || 'Erro ao criar critério.', 'error');
    }
  };

  const handleCriterioUpdated = async (criterioData) => {
    try {
      const updated = await criterioService.updateCriterio(selectedCriterio.id, criterioData);
      setCriterios((prev) =>
        prev.map((c) => (c.id === selectedCriterio.id ? updated : c))
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
      setCriterios((prev) => prev.filter((c) => c.id !== selectedCriterio.id));
      handleCloseDeleteConfirm();
      showNotification('Critério deletado com sucesso!', 'success');
    } catch (err) {
      showNotification(err.message || 'Falha ao deletar critério.', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <CircularProgress />;
  }

  const canManageCriteria = currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.TENANT_ADMIN;

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Gerenciamento de Critérios
          </Typography>
          <IconButton onClick={() => setOpenHelpModal(true)} color="primary" aria-label="ajuda sobre critérios">
            <InfoOutlinedIcon />
          </IconButton>
        </Box>
        {canManageCriteria && (
          <Button
            variant="contained"
            onClick={handleOpenCreateModal}
            startIcon={<AddIcon />}
          >
            Criar Novo Critério
          </Button>
        )}
      </Box>

      {criterios.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader aria-label="tabela de critérios">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criterios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((criterio) => (
                  <TableRow hover key={criterio.id}>
                    <TableCell component="th" scope="row">
                      {criterio.name}
                    </TableCell>
                    <TableCell>{criterio.type}</TableCell>
                    <TableCell>{criterio.description || 'N/A'}</TableCell>
                    <TableCell align="right">
                      {canManageCriteria && (
                        <>
                          <IconButton size="small" aria-label="edit" onClick={() => handleOpenEditModal(criterio)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" aria-label="delete" onClick={() => handleOpenDeleteConfirm(criterio)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={criterios.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Itens por página:"
          />
        </>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>
          Nenhum critério encontrado. Clique em "Criar Novo Critério" para começar.
        </Alert>
      )}

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

      {/* Create/Edit Modals */}
      <Modal open={openCreateModal || openEditModal} onClose={openCreateModal ? handleCloseCreateModal : handleCloseEditModal}>
        <Fade in={openCreateModal || openEditModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2" mb={2}>
              {openCreateModal ? 'Criar Novo Critério' : 'Editar Critério'}
            </Typography>
            <CriterioForm
              criterioToEdit={openEditModal ? selectedCriterio : null}
              onSubmit={openCreateModal ? handleCriterioCreated : handleCriterioUpdated}
              onCancel={openCreateModal ? handleCloseCreateModal : handleCloseEditModal}
            />
          </Box>
        </Fade>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Confirmar Deleção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja deletar o critério "{selectedCriterio?.name}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancelar</Button>
          <Button onClick={handleCriterioDeleted} color="error">
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CriterioList;
