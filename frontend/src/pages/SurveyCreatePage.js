import React, { useState, useEffect } from 'react';
import { Container, Typography, Alert } from '@mui/material';
import SurveyForm from '../components/surveys/SurveyForm';
import TemplateSelection from '../components/surveys/TemplateSelection';
import surveyService from '../services/surveyService';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from '../context/SnackbarContext'; // Import useNotification

const SurveyCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar(); // Get showNotification

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Keep local error for now, might be used by SurveyForm
  const [success, setSuccess] = useState(false);
  const [initialData, setInitialData] = useState({});
  
  // Gerencia a etapa do formulário: 'selectTemplate' ou 'fillForm'
  const [formStep, setFormStep] = useState(id ? 'fillForm' : 'selectTemplate');

  useEffect(() => {
    if (id) {
      setLoading(true);
      surveyService.getSurveyById(id)
        .then(survey => {
          // Garante que questions[...].options seja sempre um array para evitar erros de validação no backend
          const cleanedSurvey = {
            ...survey,
            questions: survey.questions.map(q => ({
              ...q,
              options: Array.isArray(q.options) ? q.options : []
            }))
          };
          setInitialData(cleanedSurvey);
          setFormStep('fillForm');
        })
        .catch(err => showSnackbar(err.message || 'Erro ao carregar pesquisa para edição.', 'error')) // Use showNotification
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSelectTemplate = (template) => {
    // O templateData já vem como um objeto do backend, contendo a chave 'questions'
    setInitialData({
      title: template.title,
      description: template.description,
      ...template.templateData, // Espalha o objeto que contém a propriedade 'questions'
    });
    setFormStep('fillForm');
  };

  const handleStartFromScratch = () => {
    setInitialData({ title: '', description: '', questions: [] });
    setFormStep('fillForm');
  };

  const handleSubmit = async (surveyData) => {
    setLoading(true);
    setError(null); // Keep setError for now, in case SurveyForm uses it
    setSuccess(false);

    try {
      if (id) {
        await surveyService.updateSurvey(id, surveyData);
      } else {
        await surveyService.createSurvey(surveyData);
      }
      setSuccess(true);
      showSnackbar(`Pesquisa ${id ? 'atualizada' : 'criada'} com sucesso!`, 'success'); // Add success notification
      setTimeout(() => navigate('/pesquisas'), 2000);
    } catch (err) {
      showSnackbar(err.message || `Erro ao ${id ? 'atualizar' : 'criar'} pesquisa.`, 'error'); // Use showNotification
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = id ? 'Editar Pesquisa' : 'Criar Nova Pesquisa';

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        {pageTitle}
      </Typography>

      {/* {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} */} {/* Remove local error display */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Pesquisa {id ? 'atualizada' : 'criada'} com sucesso! Redirecionando...
        </Alert>
      )}

      {loading && id && <Typography>Carregando pesquisa...</Typography>}

      {formStep === 'selectTemplate' && !id && (
        <TemplateSelection
          onSelectTemplate={handleSelectTemplate}
          onStartFromScratch={handleStartFromScratch}
        />
      )}

      {formStep === 'fillForm' && (
        <SurveyForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </Container>
  );
};

export default SurveyCreatePage;