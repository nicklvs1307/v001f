import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
} from '@mui/material';
import gmbConfigService from '../services/gmbConfigService';
import gmbReviewService from '../services/gmbReviewService';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';

const ReputacaoPage = () => {
  const { user } = useContext(AuthContext);
  const [config, setConfig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [replyingToReview, setReplyingToReview] = useState(null);
  const [replyComment, setReplyComment] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState(null);
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const fetchConfig = async () => {
    try {
      const data = await gmbConfigService.getConfig();
      if (data && data.accessToken) {
        setConfig(data);
        fetchReviews();
      }
    } catch (err) {
      // Se der 404 ou outro erro, significa que não está configurado.
      setConfig(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await gmbReviewService.getAllReviews();
      setReviews(data);
    } catch (err) {
      setReviewsError('Erro ao carregar avaliações GMB.');
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (user) { // Só executa quando o usuário estiver carregado
      fetchConfig();
    }
  }, [user]);

  const handleSyncReviews = async () => {
    setSyncingReviews(true);
    setReviewsError(null);
    try {
      await gmbReviewService.syncReviews();
      fetchReviews(); // Recarrega as avaliações
      setSnackbarMessage('Sincronização iniciada com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setReviewsError(err.message || 'Erro ao sincronizar avaliações.');
    } finally {
      setSyncingReviews(false);
    }
  };

  const handleReplyClick = (review) => {
    setReplyingToReview(review);
    setReplyComment(review.replyComment || '');
    setReplyError(null);
  };

  const handleSendReply = async () => {
    setReplyLoading(true);
    setReplyError(null);
    try {
      await gmbReviewService.replyToReview(replyingToReview.id, replyComment);
      setReviews(prevReviews =>
        prevReviews.map(r =>
          r.id === replyingToReview.id ? { ...r, replyComment, repliedAt: new Date().toISOString() } : r
        )
      );
      setReplyingToReview(null);
      setReplyComment('');
      setSnackbarMessage('Resposta enviada com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setReplyError(err.message || 'Erro ao enviar resposta.');
    } finally {
      setReplyLoading(false);
    }
  };

  if (loadingConfig) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Verificando integração com o Google...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reputação Online (Google Meu Negócio)
      </Typography>

      {!config ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Conecte sua conta do Google</Typography>
          <Typography sx={{ mb: 3 }}>
            Para gerenciar suas avaliações do Google Meu Negócio, você precisa autorizar o acesso à sua conta.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            href="http://localhost:3001/api/gmb-auth"
            component="a"
          >
            Conectar com o Google
          </Button>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Avaliações Recebidas</Typography>
          <Button variant="outlined" sx={{ mb: 2 }} onClick={handleSyncReviews} disabled={syncingReviews}>
            {syncingReviews ? <CircularProgress size={20} /> : 'Sincronizar Avaliações'}
          </Button>
          {reviewsError && <Alert severity="error" sx={{ mb: 2 }}>{reviewsError}</Alert>}
          {loadingReviews ? (
            <CircularProgress />
          ) : (
            <List>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <React.Fragment key={review.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`${review.reviewerName || 'Anônimo'} - ${review.starRating} Estrelas`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">{review.comment}</Typography>
                            {review.repliedAt && <Typography variant="caption" display="block" color="text.secondary">Respondido em: {new Date(review.repliedAt).toLocaleDateString()}</Typography>}
                            {review.replyComment && <Typography variant="caption" display="block" color="text.secondary">Sua resposta: {review.replyComment}</Typography>}
                          </>
                        }
                      />
                      {!review.repliedAt && (
                        <Button size="small" onClick={() => handleReplyClick(review)}>Responder</Button>
                      )}
                    </ListItem>
                    {replyingToReview?.id === review.id && (
                      <Box sx={{ mt: 1, mb: 2, ml: 2, width: '100%' }}>
                        <TextField
                          label="Sua Resposta"
                          multiline
                          rows={3}
                          fullWidth
                          value={replyComment}
                          onChange={(e) => setReplyComment(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        {replyError && <Alert severity="error" sx={{ mb: 1 }}>{replyError}</Alert>}
                        <Button variant="contained" size="small" onClick={handleSendReply} disabled={replyLoading}>
                          {replyLoading ? <CircularProgress size={20} /> : 'Enviar Resposta'}
                        </Button>
                      </Box>
                    )}
                    <Divider component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography>Nenhuma avaliação encontrada.</Typography>
              )}
            </List>
          )}
        </Paper>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReputacaoPage;
