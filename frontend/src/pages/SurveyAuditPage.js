import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, Chip,
  IconButton, Drawer, Divider, List, ListItem, ListItemText,
  CircularProgress, Alert, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  EventNote as SurveyIcon,
  ConfirmationNumber as CouponIcon
} from '@mui/icons-material';
import auditService from '../services/auditService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SurveyAuditPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ participations: [], total: 0 });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState('');

  const fetchParticipations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await auditService.getParticipations(page + 1, rowsPerPage, search);
      setData(result);
    } catch (err) {
      setError('Erro ao carregar histórico de pesquisas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    fetchParticipations();
  }, [fetchParticipations]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = async (session) => {
    setSelectedSession(session);
    setLoadingDetails(true);
    setDetails(null);
    try {
      const result = await auditService.getParticipationDetails(session.respondentSessionId);
      setDetails(result);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes da participação.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCancelParticipation = async () => {
    if (!cancelReason.trim()) {
      alert("Por favor, informe o motivo do cancelamento.");
      return;
    }
    setCanceling(true);
    try {
      await auditService.cancelParticipation(selectedSession.respondentSessionId, cancelReason);
      setCancelDialogOpen(false);
      setCancelReason('');
      // Recarregar detalhes e lista
      handleViewDetails(selectedSession);
      fetchParticipations();
    } catch (err) {
      console.error(err);
      alert('Erro ao cancelar participação.');
    } finally {
      setCanceling(false);
    }
  };

  const getStatusChip = (status) => {
    const configs = {
      active: { label: 'Ativo', color: 'success' },
      used: { label: 'Usado', color: 'primary' },
      expired: { label: 'Expirado', color: 'default' },
      canceled: { label: 'Cancelado', color: 'error' },
      pending: { label: 'Pendente', color: 'warning' }
    };
    const config = configs[status] || configs.pending;
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Histórico de Pesquisas
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          onClick={fetchParticipations}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
        <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
        <TextField
          fullWidth
          variant="standard"
          placeholder="Pesquisar por cliente, telefone ou título da pesquisa..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{ disableUnderline: true }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: '15px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pesquisa</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cupom / Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : data.participations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  Nenhuma participação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              data.participations.map((row) => (
                <TableRow key={row.respondentSessionId} hover>
                  <TableCell>
                    {format(new Date(row.participationDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.clientName || 'Anônimo'}</Typography>
                      <Typography variant="caption" color="textSecondary">{row.clientPhone}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{row.surveyTitle}</TableCell>
                  <TableCell>
                    {row.couponCode ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#eee', px: 0.5 }}>
                          {row.couponCode}
                        </Typography>
                        {getStatusChip(row.couponStatus)}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary">Sem prêmio</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver Detalhes">
                      <IconButton color="primary" onClick={() => handleViewDetails(row)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página"
        />
      </TableContainer>

      {/* Drawer de Detalhes */}
      <Drawer
        anchor="right"
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 0 } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Detalhes da Participação</Typography>
            <IconButton onClick={() => setSelectedSession(null)}><CancelIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
          ) : details ? (
            <Box>
              {/* Info Cliente */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fcfcfc' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" /> DADOS DO CLIENTE
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{details.client?.name || 'Anônimo'}</Typography>
                <Typography variant="body2">{details.client?.phone || 'Telefone não informado'}</Typography>
                <Typography variant="body2">{details.client?.email || 'Sem e-mail'}</Typography>
              </Paper>

              {/* Info Pesquisa */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SurveyIcon fontSize="small" /> PESQUISA: {details.survey?.title}
                </Typography>
                <List dense>
                  {details.responses.map((resp, idx) => (
                    <ListItem key={resp.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', px: 0, mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{idx + 1}. {resp.pergunta?.text}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ pl: 2, borderLeft: '2px solid #ddd', mt: 0.5 }}>
                        {resp.ratingValue !== null ? `Nota: ${resp.ratingValue}` : resp.selectedOption || resp.textValue || '(Sem resposta)'}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Info Cupom */}
              {details.coupon && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3, border: '1px dashed orange' }}>
                  <Typography variant="subtitle2" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CouponIcon fontSize="small" /> PRÊMIO GERADO
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>{details.coupon.codigo}</Typography>
                      <Typography variant="caption">{details.coupon.recompensa?.title}</Typography>
                    </Box>
                    {getStatusChip(details.coupon.status)}
                  </Box>
                </Paper>
              )}

              {/* Ações de Cancelamento */}
              {details.coupon && details.coupon.status !== 'canceled' && (
                <Box sx={{ mt: 4 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="error" 
                    startIcon={<CancelIcon />}
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Cancelar Pesquisa e Invalidar Cupom
                  </Button>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    Isso marcará o cupom como "Cancelado" e ele não poderá mais ser utilizado pelo cliente.
                  </Typography>
                </Box>
              )}
              
              {details.coupon?.status === 'canceled' && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="error" variant="outlined">
                    <Typography variant="subtitle2">Participação Cancelada</Typography>
                    <Typography variant="body2"><strong>Motivo:</strong> {details.coupon.cancellationReason || 'Não informado'}</Typography>
                  </Alert>
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="warning">Não foi possível carregar os detalhes.</Alert>
          )}
        </Box>
      </Drawer>

      {/* Diálogo de Confirmação */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Confirmar Cancelamento?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você está prestes a cancelar esta participação de <strong>{selectedSession?.clientName}</strong>. 
            O cupom <strong>{selectedSession?.couponCode}</strong> será invalidado permanentemente.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Motivo do Cancelamento"
            type="text"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
          <Button 
            onClick={handleCancelParticipation} 
            color="error" 
            variant="contained" 
            disabled={canceling}
          >
            {canceling ? <CircularProgress size={20} color="inherit" /> : 'Sim, Cancelar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SurveyAuditPage;
