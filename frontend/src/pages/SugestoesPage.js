import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import surveyTemplateService from '../services/surveyTemplateService';
import { useNavigate } from 'react-router-dom';

const SugestoesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'create' ou 'overwrite'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [existingSurveyId, setExistingSurveyId] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState('');
  
  // Estados para o Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success', 'error', 'warning', 'info'

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await surveyTemplateService.getAllTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err.message || 'Falha ao carregar sugestões de pesquisa.');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleOpenDialog = (type, template) => {
    setDialogType(type);
    setSelectedTemplate(template);
    setSurveyTitle(template.title);
    setSurveyDescription(template.description);
    setExistingSurveyId(''); // Limpar para nova operação
    setDialogError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    setSurveyTitle('');
    setSurveyDescription('');
    setExistingSurveyId('');
    setDialogError('');
  };

  const handleCreateSurvey = async () => {
    setDialogLoading(true);
    setDialogError('');
    try {
      const newSurveyData = {
        title: surveyTitle,
        description: surveyDescription,
        // questions virão do template no backend
      };
      const response = await surveyTemplateService.createSurveyFromTemplate(
        selectedTemplate.id,
        newSurveyData
      );
      navigate(`/surveys/edit/${response.survey.id}`); // Redirecionar para a página de edição da nova pesquisa
      handleCloseDialog();
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Erro ao criar pesquisa a partir do template.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleOverwriteSurvey = async () => {
    setDialogLoading(true);
    setDialogError('');
    try {
      await surveyTemplateService.overwriteSurveyWithTemplate(
        selectedTemplate.id,
        existingSurveyId
      );
      navigate(`/surveys/edit/${existingSurveyId}`); // Redirecionar para a página de edição da pesquisa sobrescrita
      handleCloseDialog();
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Erro ao sobrescrever pesquisa.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleViewQuestions = (template) => {
    setSnackbarMessage('Funcionalidade de visualização de perguntas em desenvolvimento. Verifique o console.');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando sugestões...</Typography>
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
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sugestões de Pesquisas
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Escolha um template abaixo para criar uma nova pesquisa ou sobrescrever uma existente.
        </Typography>

        <Grid container spacing={3}>
          {templates.length > 0 ? (
            templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {template.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">Tipo: {template.type}</Typography>
                      {template.targetAudience && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Público: {template.targetAudience}</Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handleViewQuestions(template)}>
                      Questões
                    </Button>
                    <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenDialog('create', template)}>
                      Cadastrar
                    </Button>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog('overwrite', template)}>
                      Sobrescrever
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography>Nenhum template de pesquisa encontrado.</Typography>
            </Grid>
          )}
        </Grid>

        {/* Dialog para Cadastrar/Sobrescrever Pesquisa */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{dialogType === 'create' ? 'Criar Nova Pesquisa' : 'Sobrescrever Pesquisa Existente'}</DialogTitle>
          <DialogContent>
            {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
            {selectedTemplate && (
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  label="Título da Pesquisa"
                  fullWidth
                  margin="normal"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  disabled={dialogType === 'overwrite'}
                />
                <TextField
                  label="Descrição da Pesquisa"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  disabled={dialogType === 'overwrite'}
                />
                {dialogType === 'overwrite' && (
                  <TextField
                    label="ID da Pesquisa Existente para Sobrescrever"
                    fullWidth
                    margin="normal"
                    value={existingSurveyId}
                    onChange={(e) => setExistingSurveyId(e.target.value)}
                    helperText="Insira o ID da pesquisa que deseja sobrescrever."
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
            <Button
              onClick={dialogType === 'create' ? handleCreateSurvey : handleOverwriteSurvey}
              color="primary"
              disabled={dialogLoading}
            >
              {dialogLoading ? <CircularProgress size={24} /> : (dialogType === 'create' ? 'Criar' : 'Sobrescrever')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SugestoesPage;