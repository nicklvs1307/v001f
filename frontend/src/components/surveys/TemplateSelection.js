import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import surveyTemplateService from '../../services/surveyTemplateService';

const TemplateSelection = ({ onSelectTemplate, onStartFromScratch }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await surveyTemplateService.getAllTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err.message || 'Falha ao carregar os modelos de pesquisa.');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Comece com um Modelo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Escolha um dos nossos modelos pré-prontos para começar rapidamente ou inicie uma pesquisa em branco.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Card para começar do zero */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '2px dashed #ccc' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div">
                Começar do Zero
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crie uma pesquisa personalizada a partir de uma tela em branco.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={onStartFromScratch}>
                Criar Pesquisa em Branco
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Cards dos templates */}
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Chip label={template.targetAudience || 'Geral'} color="primary" size="small" sx={{ mb: 1 }} />
                <Typography variant="h6" component="div">
                  {template.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {template.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => onSelectTemplate(template)}>
                  Usar este Modelo
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TemplateSelection;
