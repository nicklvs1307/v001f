import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Wheel } from 'react-custom-roulette';
import { SketchPicker } from 'react-color';
import roletaService from '../services/roletaService';
import recompensaService from '../services/recompensaService'; // Para buscar recompensas
import Autocomplete from '@mui/material/Autocomplete';


const RoletaFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    active: true,
  });
  const [premios, setPremios] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayColorPicker, setDisplayColorPicker] = useState(null);

  // Função para obter uma cor de texto contrastante (preto ou branco)
  const getContrastColor = (hexColor) => {
    if (!hexColor) return '#000000';
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  useEffect(() => {
        const fetchRecompensas = async () => {
            try {
                // No modo de edição, busca todas as recompensas (null). Na criação, apenas as ativas (true).
                const activeFilter = isEditing ? null : true;
                const response = await recompensaService.getAll(activeFilter);
                setRecompensas(response || []);
            } catch (err) {
                setError('Erro ao buscar recompensas.');
            }
        };

        fetchRecompensas();

    if (isEditing) {
      setLoading(true);
      roletaService.getRoletaById(id)
        .then(response => {
          const { nome, descricao, active, premios } = response.data;
          setFormData({ nome, descricao, active });
          setPremios(premios.map(p => ({
            id: p.id,
            option: p.nome,
            recompensaId: p.recompensaId,
            porcentagem: p.porcentagem,
            style: { backgroundColor: p.cor, textColor: getContrastColor(p.cor) },
          })));
        })
        .catch(err => setError('Erro ao buscar dados da roleta.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const totalPercentage = useMemo(() => {
    return premios.reduce((acc, premio) => acc + (Number(premio.porcentagem) || 0), 0);
  }, [premios]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePremioChange = (index, field, value) => {
    const newPremios = [...premios];
    if (field === 'recompensa') {
      const selectedRecompensa = recompensas.find(r => r.id === value);
      newPremios[index].option = selectedRecompensa ? selectedRecompensa.nome : '';
      newPremios[index].recompensaId = value;
    } else {
      newPremios[index][field] = value;
    }
    setPremios(newPremios);
  };

  const handlePremioStyleChange = (index, property, value) => {
    const newPremios = [...premios];
    newPremios[index].style[property] = value;
    if (property === 'backgroundColor') {
      newPremios[index].style.textColor = getContrastColor(value);
    }
    setPremios(newPremios);
  };

  const addPremio = () => {
    const newColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    setPremios([...premios, {
      option: '',
      recompensaId: null,
      porcentagem: 0,
      style: { backgroundColor: newColor, textColor: getContrastColor(newColor) },
    }]);
  };

  const removePremio = (index) => {
    const newPremios = premios.filter((_, i) => i !== index);
    setPremios(newPremios);
  };

  const handleColorClick = (index) => {
    setDisplayColorPicker(displayColorPicker === index ? null : index);
  };

  const handleColorClose = () => {
    setDisplayColorPicker(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalPercentage !== 100) {
      setError('A soma das porcentagens dos prêmios deve ser exatamente 100%.');
      return;
    }
    setError('');
    setLoading(true);

    const payload = {
      ...formData,
      premios: premios.map(p => ({
        id: p.id,
        nome: p.option,
        recompensaId: p.recompensaId,
        porcentagem: Number(p.porcentagem),
        cor: p.style.backgroundColor,
      })),
    };

    try {
      if (isEditing) {
        await roletaService.updateRoleta(id, payload);
      } else {
        await roletaService.createRoleta(payload);
      }
      navigate('/dashboard/roletas');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao salvar a roleta.');
      setLoading(false);
    }
  };

  const wheelData = useMemo(() => {
    return premios.length > 0 ? premios : [{ option: 'Vazio', percentage: 100, style: { backgroundColor: '#cccccc', textColor: '#000000' } }];
  }, [premios]);

  if (loading && isEditing) {
    return <Container><CircularProgress /></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard/roletas')}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? 'Editar Roleta' : 'Nova Roleta'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Coluna do Formulário */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Dados da Roleta</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="nome"
                    label="Nome da Roleta"
                    fullWidth
                    required
                    value={formData.nome}
                    onChange={handleFormChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="descricao"
                    label="Descrição"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.descricao}
                    onChange={handleFormChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={formData.active} onChange={handleFormChange} name="active" />}
                    label="Ativa"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Prêmios da Roleta
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Total: <span style={{ color: totalPercentage === 100 ? 'green' : 'red', fontWeight: 'bold' }}>{totalPercentage}%</span> / 100%
                </Typography>
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addPremio}
                  variant="outlined"
                >
                  Adicionar Prêmio
                </Button>
              </Box>

              {premios.map((premio, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #ddd' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <Autocomplete
                        options={recompensas}
                        getOptionLabel={(option) => option.nome || ''}
                        value={recompensas.find(r => r.id === premio.recompensaId) || null}
                        onChange={(event, newValue) => {
                          handlePremioChange(index, 'recompensa', newValue ? newValue.id : null);
                        }}
                        renderInput={(params) => <TextField {...params} label="Recompensa" />}
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                {option.nome}
                            </Box>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Porcentagem (%)"
                        type="number"
                        value={premio.porcentagem}
                        onChange={(e) => handlePremioChange(index, 'porcentagem', e.target.value)}
                        fullWidth
                        inputProps={{ min: 0, step: "0.01" }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Tooltip title="Clique para escolher a cor">
                        <Box
                          onClick={() => handleColorClick(index)}
                          sx={{
                            width: '100%',
                            height: 40,
                            backgroundColor: premio.style.backgroundColor,
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            borderRadius: 1,
                          }}
                        />
                      </Tooltip>
                      {displayColorPicker === index && (
                        <Box sx={{ position: 'absolute', zIndex: 2 }}>
                          <Box sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} onClick={handleColorClose} />
                          <SketchPicker
                            color={premio.style.backgroundColor || '#FFFFFF'}
                            onChange={(color) => handlePremioStyleChange(index, 'backgroundColor', color.hex)}
                          />
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton onClick={() => removePremio(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Paper>
          </Grid>

          {/* Coluna da Pré-visualização */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: '20px' }}>
              <Typography variant="h6" gutterBottom align="center">Pré-visualização</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Wheel
                  mustStartSpinning={false}
                  prizeNumber={0}
                  data={wheelData}
                  outerBorderColor={"#eeeeee"}
                  outerBorderWidth={10}
                  innerBorderColor={"#dddddd"}
                  innerBorderWidth={10}
                  radiusLineColor={"#dddddd"}
                  radiusLineWidth={2}
                  fontSize={12}
                  textDistance={60}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/dashboard/roletas')} sx={{ mr: 2 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || totalPercentage !== 100}
          >
            {loading ? <CircularProgress size={24} /> : (isEditing ? 'Salvar Alterações' : 'Criar Roleta')}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default RoletaFormPage;
