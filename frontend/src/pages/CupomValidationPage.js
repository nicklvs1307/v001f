import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import cupomService from '../services/cupomService';

const CupomValidationPage = () => {
  const [codigo, setCodigo] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    setLoading(true);
    setError('');
    setValidationResult(null);
    try {
      const result = await cupomService.validateCupom(codigo);
      setValidationResult({ success: true, message: result.message, cupom: result.cupom });
    } catch (err) {
      setValidationResult({ success: false, message: err.message || 'Erro ao validar cupom.' });
      setError(err.message || 'Erro ao validar cupom.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Validação de Cupom
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Código do Cupom"
          fullWidth
          variant="outlined"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleValidate}
          disabled={loading || !codigo}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Validar Cupom'}
        </Button>
      </Paper>

      {validationResult && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color={validationResult.success ? 'success.main' : 'error.main'}>
            {validationResult.success ? 'Validação Bem-Sucedida!' : 'Falha na Validação!'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {validationResult.message}
          </Typography>
          {validationResult.success && validationResult.cupom && (
            <Box>
              <Typography variant="subtitle1">Detalhes do Cupom:</Typography>
              <Typography variant="body2">Código: {validationResult.cupom.codigo}</Typography>
              <Typography variant="body2">Recompensa: {validationResult.cupom.recompensa?.name}</Typography>
              <Typography variant="body2">Valor: {validationResult.cupom.recompensa?.value}</Typography>
              <Typography variant="body2">Tipo: {validationResult.cupom.recompensa?.type}</Typography>
              <Typography variant="body2">Status: {validationResult.cupom.status}</Typography>
              <Typography variant="body2">Validade: {new Date(validationResult.cupom.dataValidade).toLocaleDateString()}</Typography>
              {validationResult.cupom.dataUtilizacao && (
                <Typography variant="body2">Utilizado em: {new Date(validationResult.cupom.dataUtilizacao).toLocaleDateString()}</Typography>
              )}
            </Box>
          )}
        </Paper>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Container>
  );
};

export default CupomValidationPage;
