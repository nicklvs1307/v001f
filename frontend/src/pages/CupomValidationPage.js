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
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material'; // Importar ícones
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh', // Centraliza verticalmente
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Validação de Cupom
        </Typography>

        <Paper elevation={4} sx={{ p: 4, mb: 3, width: '100%', maxWidth: 500, borderRadius: 2 }}>
          <TextField
            label="Código do Cupom"
            fullWidth
            variant="outlined"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            sx={{ mb: 3 }} // Aumentar margin-bottom
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleValidate}
            disabled={loading || !codigo}
            fullWidth
            sx={{ py: 1.5, boxShadow: 3 }} // Aumentar padding vertical e adicionar sombra
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar Cupom'}
          </Button>
        </Paper>

        {validationResult && (
          <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 500, borderRadius: 2, mt: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              {validationResult.success ? (
                <CheckCircleOutline sx={{ color: 'success.main', fontSize: 40, mr: 1 }} />
              ) : (
                <ErrorOutline sx={{ color: 'error.main', fontSize: 40, mr: 1 }} />
              )}
              <Typography variant="h5" color={validationResult.success ? 'success.main' : 'error.main'}>
                {validationResult.success ? 'Validação Bem-Sucedida!' : 'Falha na Validação!'}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {validationResult.message}
            </Typography>
            {validationResult.success && validationResult.cupom && (
              <Box sx={{ textAlign: 'left', mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Detalhes do Cupom:</Typography>
                <Typography variant="body2"><strong>Código:</strong> {validationResult.cupom.codigo}</Typography>
                <Typography variant="body2"><strong>Recompensa:</strong> {validationResult.cupom.recompensa?.name}</Typography>
                <Typography variant="body2"><strong>Valor:</strong> {validationResult.cupom.recompensa?.value}</Typography>
                <Typography variant="body2"><strong>Tipo:</strong> {validationResult.cupom.recompensa?.type}</Typography>
                <Typography variant="body2"><strong>Status:</strong> {validationResult.cupom.status}</Typography>
                <Typography variant="body2"><strong>Validade:</strong> {new Date(validationResult.cupom.dataValidade).toLocaleDateString()}</Typography>
                {validationResult.cupom.dataUtilizacao && (
                  <Typography variant="body2"><strong>Utilizado em:</strong> {new Date(validationResult.cupom.dataUtilizacao).toLocaleDateString()}</Typography>
                )}
              </Box>
            )}
          </Paper>
        )}

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%', maxWidth: 500 }}>{error}</Alert>}
      </Box>
    </Container>
  );
};

export default CupomValidationPage;
