// Forçando a recompilação do arquivo para limpar o cache
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNotification } from '../context/NotificationContext';

const ReputationPage = () => {
      const [loading, setLoading] = useState(false); // Definido como false pois não há fetch inicial de config
      const [success, setSuccess] = useState(false); // Manter por enquanto, para o Alert

      const { showNotification } = useNotification();



  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Reputação
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

      {/* Conteúdo para a nova página de reputação será adicionado aqui */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Comentários e Avaliações
        </Typography>
        <Alert severity="info">
          Esta seção será preenchida com comentários e avaliações de suas integrações.
        </Alert>
      </Box>

    </Container>
  );
};

export default ReputationPage;
