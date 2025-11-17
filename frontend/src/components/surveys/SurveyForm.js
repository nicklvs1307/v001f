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
} from '@mui/material';
import { Alert } from '@mui/material';
import { SURVEY_STATUS } from '../../constants/surveyStatus';
import AddIcon from '@mui/icons-material/Add';
import QuestionForm from './QuestionForm';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const SurveyForm = ({ initialData = {}, onSubmit, loading = false, error = null }) => {
  const formActions = useSurveyForm(initialData);
  const { survey, errors, handleChange, handleAddQuestion, rewardType, handleRewardChange } = formActions;

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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Data de Início (Opcional)"
                value={survey.startDate ? new Date(survey.startDate) : null}
                onChange={(newValue) => formActions.handleDateChange('startDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Data de Término"
                value={survey.endDate ? new Date(survey.endDate) : null}
                onChange={(newValue) => formActions.handleDateChange('endDate', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    required
                    error={!!errors.endDate}
                    helperText={errors.endDate}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Data de Vencimento (Opcional)"
                value={survey.dueDate ? new Date(survey.dueDate) : null}
                onChange={(newValue) => formActions.handleDateChange('dueDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </LocalizationProvider>
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