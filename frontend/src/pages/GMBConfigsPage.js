// Forçando a recompilação do arquivo para limpar o cache
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
} from '@mui/material';
import { useSnackbar } from '../context/SnackbarContext';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import configService from '../services/configService';
import AuthContext from '../context/AuthContext';

const ConfigPage = () => {
  const { user, refreshUser } = useContext(AuthContext);

      const [config, setConfig] = useState({
        id: null, // Adicionar id ao estado inicial
        primaryColor: '',
        secondaryColor: '',
        restaurantName: '',
        restaurantAddress: '',
        restaurantPhone: '',
        restaurantEmail: '',
        restaurantWebsite: '',
        logoUrl: '',
      });
      const [loading, setLoading] = useState(true);
      const [saving, setSaving] = useState(false);
      const [error, setError] = useState(null); // Adicionado estado de erro local
      const [success, setSuccess] = useState(false); // Adicionado estado de sucesso local
      const [logoFile, setLogoFile] = useState(null); // Adicionado estado para o arquivo de logo
      const [logoUploadError, setLogoUploadError] = useState(null); // Adicionado estado de erro de upload
      const [logoUploadLoading, setLogoUploadLoading] = useState(false); // Adicionado estado de carregamento de upload
      const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);

      const { showSnackbar } = useSnackbar(); // Usar o hook useNotification

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await configService.getTenantConfig();
        // Garantir que as cores tenham um valor padrão se forem nulas
        setConfig({
          ...data,
          primaryColor: data.primaryColor || '#1976d2',
          secondaryColor: data.secondaryColor || '#dc004e',
        });
      } catch (err) {
        showSnackbar('Erro ao carregar configurações.', 'error');
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
    setLogoUploadError(null);
    setLogoUploadSuccess(false);
  };

  const handleLogoUpload = async () => {
    const tenantIdForUpload = config?.id;

    if (!logoFile) {
        showSnackbar('Por favor, selecione um arquivo para upload.', 'warning');
        return;
    }
    if (!tenantIdForUpload) {
        showSnackbar('ID do Tenant não disponível para upload.', 'error');
        return;
    }

    setLogoUploadLoading(true);
    setLogoUploadError(null);
    setLogoUploadSuccess(false);

    try {
      const response = await configService.uploadTenantLogo(tenantIdForUpload, logoFile);
      setConfig((prevConfig) => ({ ...prevConfig, logoUrl: response.logoUrl }));
      setLogoUploadSuccess(true);
      setLogoFile(null); // Limpar o arquivo selecionado após o upload
      if (refreshUser) await refreshUser(); // Atualiza o contexto global do usuário
    } catch (err) {
        showSnackbar(err.message || 'Erro ao fazer upload da logo.', 'error');
        console.error('Erro ao fazer upload da logo:', err);
    } finally {
      setLogoUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await configService.updateTenantConfig(config);
      setSuccess(true);
      if (refreshUser) await refreshUser(); // Atualiza o contexto global do usuário
    } catch (err) {
                showSnackbar(err.message || 'Erro ao salvar configurações.', 'error');
                console.error('Erro ao salvar configurações:', err);    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configurações do Restaurante
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Erros de configuração agora são exibidos via Snackbar global */}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Configurações salvas com sucesso!
        </Alert>
      )}

      {!loading && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Seção de Logo */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Logo do Restaurante</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={config.logoUrl ? `${process.env.REACT_APP_API_URL}${config.logoUrl}` : '/placeholder-logo.png'}
                      alt="Logo do Restaurante"
                      sx={{ width: 120, height: 120, mb: 2, border: '1px solid #ccc' }}
                      variant="rounded"
                    />
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      multiple
                      type="file"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    <label htmlFor="raised-button-file">
                      <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                        Selecionar Logo
                      </Button>
                    </label>
                    {logoFile && (
                      <Typography variant="body2" sx={{ mt: 1 }}>Arquivo selecionado: {logoFile.name}</Typography>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleLogoUpload}
                      disabled={!logoFile || logoUploadLoading}
                      sx={{ mt: 2 }}
                      startIcon={logoUploadLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {logoUploadLoading ? 'Enviando...' : 'Fazer Upload da Logo'}
                    </Button>
                    {/* Erros de upload de logo agora são exibidos via Snackbar global */}
                    {logoUploadSuccess && (
                      <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                        Logo enviada com sucesso!
                      </Alert>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Seção de Informações Gerais */}
            <Grid item xs={12} md={8}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Informações Gerais</Typography>
                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                      label="Nome do Restaurante"
                      name="name"
                      value={config.name}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      required
                    />
                    <TextField
                      label="Endereço"
                      name="address"
                      value={config.address}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Telefone"
                      name="phone"
                      value={config.phone}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Email de Contato"
                      name="email"
                      value={config.email}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      type="email"
                    />
                    <TextField
                      label="Website"
                      name="website"
                      value={config.website}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="CNPJ"
                      name="cnpj"
                      value={config.cnpj}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Inscrição Estadual"
                      name="inscricaoEstadual"
                      value={config.inscricaoEstadual}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Descrição"
                      name="description"
                      value={config.description}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={4}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 3, mb: 2 }}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      Salvar Informações
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Seção de Cores */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Cores da Marca</Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
                    <TextField
                      label="Cor Primária"
                      name="primaryColor"
                      type="color"
                      value={config.primaryColor}
                      onChange={handleChange}
                      sx={{ width: 150 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box sx={{ width: 20, height: 20, bgcolor: config.primaryColor, borderRadius: '50%', border: '1px solid #ccc' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Cor Secundária"
                      name="secondaryColor"
                      type="color"
                      value={config.secondaryColor}
                      onChange={handleChange}
                      sx={{ width: 150 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box sx={{ width: 20, height: 20, bgcolor: config.secondaryColor, borderRadius: '50%', border: '1px solid #ccc' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit} // Reutiliza o handleSubmit para salvar as cores
                    disabled={loading}
                    sx={{ mt: 3 }}
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    Salvar Cores
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default ConfigPage;
