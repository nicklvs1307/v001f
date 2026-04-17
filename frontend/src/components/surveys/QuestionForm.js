import React from 'react';
import {
  TextField,
  Paper,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionOptions from './QuestionOptions';

const QuestionForm = ({
  question,
  qIndex,
  criterios,
  criteriosLoading,
  criteriosError,
  formActions,
}) => {
  const { 
    handleQuestionChange,
    handleCriterioChange,
    handleQuestionTypeChange,
    handleOptionChange,
    handleAddOption,
    handleRemoveOption,
    handleRemoveQuestion
  } = formActions;

  return (
    <Paper key={qIndex} elevation={1} sx={{ p: 2, mb: 2, position: 'relative' }}>
      <IconButton
        aria-label="remover pergunta"
        onClick={() => handleRemoveQuestion(qIndex)}
        sx={{ position: 'absolute', top: 8, right: 8 }}
        color="error"
      >
        <DeleteIcon />
      </IconButton>
      <TextField
        label={`Pergunta ${qIndex + 1}`}
        name="text"
        value={question.text || ''}
        onChange={(e) => handleQuestionChange(qIndex, e)}
        fullWidth
        margin="normal"
        required
      />
      <FormControl fullWidth margin="normal" disabled={criteriosLoading}>
        <InputLabel id={`criterio-label-${qIndex}`}>Critério (Opcional)</InputLabel>
        <Select
          labelId={`criterio-label-${qIndex}`}
          id={`criterio-${qIndex}`}
          value={question.criterioId || ''}
          label="Critério (Opcional)"
          onChange={(e) => handleCriterioChange(qIndex, e.target.value)}
        >
          <MenuItem value=""><em>Nenhum</em></MenuItem>
          {criterios.map((criterio) => (
            <MenuItem key={criterio.id} value={criterio.id}>
              {criterio.name}
            </MenuItem>
          ))}
        </Select>
        {criteriosError && <FormHelperText error>{criteriosError}</FormHelperText>}
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel id={`question-type-label-${qIndex}`}>Tipo de Pergunta</InputLabel>
<Select
          labelId={`question-type-label-${qIndex}`}
          id={`question-type-${qIndex}`}
          value={question.type || ''}
          onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
        >
          <MenuItem value="free_text">Texto</MenuItem>
          <MenuItem value="multiple_choice">Múltipla Escolha</MenuItem>
          <MenuItem value="checkbox">Caixa de Seleção</MenuItem>
          <MenuItem value="yes_no">Sim ou Não</MenuItem>
          <MenuItem value="rating_1_5">Avaliação (1-5)</MenuItem>
          <MenuItem value="rating_0_10">Avaliação (0-10)</MenuItem>
        </Select>
      </FormControl>

      {question.allowComments && (
        <TextField
          disabled
          label="Comentário opcional ativado"
          value=""
          size="small"
          sx={{ mt: 1, width: '100%' }}
        />
      )}

      {(question.type === 'multiple_choice' || question.type === 'checkbox' || question.type === 'yes_no') && (
        <QuestionOptions 
          qIndex={qIndex}
          options={question.options}
          handleOptionChange={handleOptionChange}
          handleAddOption={handleAddOption}
          handleRemoveOption={handleRemoveOption}
        />
      )}
    </Paper>
  );
};

export default QuestionForm;