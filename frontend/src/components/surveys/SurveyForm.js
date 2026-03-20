import React from 'react';
import useSurveyForm from '../../hooks/useSurveyForm';
import useCriterios from '../../hooks/useCriterios';
import useAtendentes from '../../hooks/useAtendentes';
import useRoletas from '../../hooks/useRoletas';
import useRecompensas from '../../hooks/useRecompensas';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  FormControlLabel,
  Switch,
  Grid,
  Stack,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  IconButton,
} from '@mui/material';
import { Alert } from '@mui/material';
import { SURVEY_STATUS } from '../../constants/surveyStatus';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionForm from './QuestionForm';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const DAYS_OF_WEEK = [
  { id: 1, label: 'Segunda' },
  { id: 2, label: 'Terça' },
  { id: 3, label: 'Quarta' },
  { id: 4, label: 'Quinta' },
  { id: 5, label: 'Sexta' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

const SurveyForm = ({ initialData = {}, onSubmit, loading = false, error = null }) => {
  const formActions = useSurveyForm(initialData);
  const { survey, setSurvey, errors, handleChange, handleAddQuestion, rewardType, handleRewardChange } = formActions;

  const handleAddOperatingHours = () => {
    setSurvey(prev => ({
      ...prev,
      operatingHours: [...(prev.operatingHours || []), { days: [], startTime: '18:00', endTime: '23:00' }]
    }));
  };

  const handleRemoveOperatingHours = (index) => {
    setSurvey(prev => ({
      ...prev,
      operatingHours: prev.operatingHours.filter((_, i) => i !== index)
    }));
  };

  const handleOperatingHoursChange = (index, field, value) => {
    setSurvey(prev => {
      const newHours = [...prev.operatingHours];
      newHours[index] = { ...newHours[index], [field]: value };
      return { ...prev, operatingHours: newHours };
    });
  };

  const { criterios, loading: criteriosLoading, error: criteriosError } = useCriterios();
  const { atendentes, loading: atendentesLoading, error: atendentesError } = useAtendentes();
  const { roletas, loading: roletasLoading, error: roletasError } = useRoletas();
  const { recompensas, loading: recompensasLoading, error: recompensasError } = useRecompensas();

  const handleSubmit = (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    onSubmit(survey); // Passa os dados do estado 'survey' para a função pai
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Informações Básicas da Pesquisa</Typography>
        <TextField
          label="Título da Pesquisa"
          name="title"
          value={survey.title || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Descrição da Pesquisa"
          name="description"
          value={survey.description || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Recompensa da Pesquisa</Typography>
        <FormControl component="fieldset">
          <FormLabel component="legend">Tipo de Recompensa</FormLabel>
          <RadioGroup row name="rewardType" value={rewardType} onChange={handleRewardChange}>
            <FormControlLabel value="" control={<Radio />} label="Nenhuma" />
            <FormControlLabel value="recompensa" control={<Radio />} label="Recompensa Direta" />
            <FormControlLabel value="roleta" control={<Radio />} label="Roleta" />
          </RadioGroup>
        </FormControl>

        {rewardType === 'recompensa' && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="recompensa-label">Selecione a Recompensa</InputLabel>
            <Select
              labelId="recompensa-label"
              name="recompensaId"
              value={survey.recompensaId || ''}
              onChange={handleRewardChange}
              label="Selecione a Recompensa"
            >
              {recompensasLoading ? <MenuItem>Carregando...</MenuItem> : (recompensas || []).map(r => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
            {recompensasError && <FormHelperText error>{recompensasError}</FormHelperText>}
          </FormControl>
        )}

        {rewardType === 'roleta' && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="roleta-label">Selecione a Roleta</InputLabel>
              <Select
                labelId="roleta-label"
                name="roletaId"
                value={survey.roletaId || ''}
                onChange={handleRewardChange}
                label="Selecione a Roleta"
              >
                {roletasLoading ? <MenuItem>Carregando...</MenuItem> : (roletas || []).map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </Select>
              {roletasError && <FormHelperText error>{roletasError}</FormHelperText>}
            </FormControl>
            <TextField
              label="Mensagem Customizada do Prêmio (Opcional)"
              name="roletaPrizeMessage"
              value={survey.roletaPrizeMessage || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              helperText="Se deixado em branco, usará a mensagem padrão das automações. Placeholders disponíveis: {{cliente}}, {{premio}}, {{cupom}}."
            />
          </>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Configurações Adicionais</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Switch checked={survey.isOpen} onChange={handleChange} name="isOpen" color="primary" />}
              label="Pesquisa Aberta"
            />
            <Typography variant="caption" display="block" sx={{ ml: 4 }}>
              Pode ser respondida por qualquer pessoa sem login.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Switch checked={survey.askForAttendant} onChange={handleChange} name="askForAttendant" color="primary" />}
              label="Pedir Atendente"
            />
            <Typography variant="caption" display="block" sx={{ ml: 4 }}>
              Permite que o respondente selecione um atendente.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Switch checked={survey.askForCpf || false} onChange={handleChange} name="askForCpf" color="primary" />}
              label="Pedir CPF"
            />
            <Typography variant="caption" display="block" sx={{ ml: 4 }}>
              Solicita o CPF do cliente na identificação.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch 
                  checked={survey.requireCpf || false} 
                  onChange={handleChange} 
                  name="requireCpf" 
                  color="primary" 
                  disabled={!survey.askForCpf}
                />
              }
              label="Exigir CPF"
            />
            <Typography variant="caption" display="block" sx={{ ml: 4 }}>
              Torna o preenchimento do CPF obrigatório.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Limite de Respostas por Cliente"
              name="responseLimit"
              type="number"
              value={survey.responseLimit || 0}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
              helperText="Defina quantas vezes o mesmo cliente pode participar. 0 significa sem limite."
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Número de Respondentes Esperados (Opcional)"
              name="expectedRespondents"
              type="number"
              value={survey.expectedRespondents || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Data de Início (Opcional)"
              value={survey.startDate ? new Date(survey.startDate) : null}
              onChange={(newValue) => formActions.handleDateChange('startDate', newValue)}
              inputFormat="dd/MM/yyyy"
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Data de Término (Opcional)"
              value={survey.endDate ? new Date(survey.endDate) : null}
              onChange={(newValue) => formActions.handleDateChange('endDate', newValue)}
              inputFormat="dd/MM/yyyy"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status da Pesquisa</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={survey.status || SURVEY_STATUS.DRAFT}
                label="Status da Pesquisa"
                onChange={handleChange}
              >
                <MenuItem value={SURVEY_STATUS.DRAFT}>Rascunho</MenuItem>
                <MenuItem value={SURVEY_STATUS.PENDING}>Pendente</MenuItem>
                <MenuItem value={SURVEY_STATUS.ACTIVE}>Ativa</MenuItem>
                <MenuItem value={SURVEY_STATUS.INACTIVE}>Inativa</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Horário de Funcionamento</Typography>
        <Typography variant="caption" display="block" sx={{ mb: 2 }}>
          Defina os horários em que a pesquisa estará disponível para ser respondida. Se não houver nenhum configurado, ela estará sempre aberta.
        </Typography>
        
        <Stack spacing={2}>
          {(survey.operatingHours || []).map((config, index) => (
            <Paper variant="outlined" sx={{ p: 2 }} key={index}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Dias da Semana</InputLabel>
                    <Select
                      multiple
                      value={config.days}
                      onChange={(e) => handleOperatingHoursChange(index, 'days', e.target.value)}
                      input={<OutlinedInput label="Dias da Semana" />}
                      renderValue={(selected) => selected.map(id => DAYS_OF_WEEK.find(d => d.id === id)?.label).join(', ')}
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <MenuItem key={day.id} value={day.id}>
                          <Checkbox checked={config.days.indexOf(day.id) > -1} />
                          <ListItemText primary={day.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="Início"
                    type="time"
                    size="small"
                    value={config.startTime}
                    onChange={(e) => handleOperatingHoursChange(index, 'startTime', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    label="Fim"
                    type="time"
                    size="small"
                    value={config.endTime}
                    onChange={(e) => handleOperatingHoursChange(index, 'endTime', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton color="error" onClick={() => handleRemoveOperatingHours(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
        
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddOperatingHours}
          variant="outlined"
          size="small"
          sx={{ mt: 2 }}
        >
          Adicionar Horário
        </Button>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Segurança do Link</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={survey.isLinkExpirable || false}
                  onChange={(e) => handleChange({ target: { name: 'isLinkExpirable', value: e.target.checked, type: 'checkbox', checked: e.target.checked } })}
                  name="isLinkExpirable"
                  color="primary"
                />
              }
              label="Link e QR Code Expiráveis"
            />
            <Typography variant="caption" display="block" sx={{ ml: 4 }}>
              Se ativado, o link deixará de funcionar após o tempo definido.
            </Typography>
          </Grid>
          {survey.isLinkExpirable && (
            <Grid item xs={12} sm={6}>
              <TextField
                label="Horas para Expirar"
                name="linkExpirationHours"
                type="number"
                value={survey.linkExpirationHours || 24}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 1 }}
                helperText="O link expirará após este número de horas a partir da geração."
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Perguntas
      </Typography>

      {criteriosError && <Alert severity="error">{criteriosError}</Alert>}
      {atendentesError && <Alert severity="error">{atendentesError}</Alert>}

      <Stack spacing={2}>
        {(survey?.questions || []).map((question, qIndex) => (
          <QuestionForm
            key={qIndex}
            question={question}
            qIndex={qIndex}
            criterios={criterios}
            criteriosLoading={criteriosLoading}
            formActions={formActions}
          />
        ))}
      </Stack>

      <Button
        startIcon={<AddIcon />}
        onClick={handleAddQuestion}
        variant="outlined"
        sx={{ mt: 2, mb: 4 }}
      >
        Adicionar Pergunta
      </Button>

      {error && <FormHelperText error>{error}</FormHelperText>}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading || Object.keys(errors).length > 0}
      >
        {loading ? <CircularProgress size={24} /> : 'Salvar Pesquisa'}
      </Button>
    </Box>
  );
};

export default SurveyForm;