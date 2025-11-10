import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Tooltip as MuiTooltip, // Renamed to avoid conflict with recharts Tooltip
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import MessageIcon from '@mui/icons-material/Message';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventIcon from '@mui/icons-material/Event';
import campanhaService from '../services/campanhaService';
import AuthContext from '../context/AuthContext';

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [campaign, setCampaign] = useState(null);
  const [campaignLogs, setCampaignLogs] = useState([]);
  const [campaignReport, setCampaignReport] = useState(null); // New state for the report
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true); // New loading state
  const [error, setError] = useState('');
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      setLoading(true);
      try {
        const response = await campanhaService.getById(id);
        setCampaign(response.data);
      } catch (err) {
        setError('Falha ao carregar detalhes da campanha. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCampaignLogs = async () => {
      setLogsLoading(true);
      try {
        const response = await campanhaService.getLogs(id);
        setCampaignLogs(response.data);
      } catch (err) {
        console.error("Erro ao buscar logs da campanha:", err);
        // Não define erro global para não bloquear a página se só os logs falharem
      } finally {
        setLogsLoading(false);
      }
    };

    const fetchCampaignReport = async () => {
      setReportLoading(true);
      try {
        const response = await campanhaService.getCampaignReport(id);
        setCampaignReport(response.data);
      } catch (err) {
        console.error("Erro ao buscar relatório da campanha:", err);
        // Não define erro global para não bloquear a página se só o relatório falhar
      } finally {
        setReportLoading(false);
      }
    };

    if (user?.tenantId && id) {
      fetchCampaignDetails();
      fetchCampaignLogs();
      fetchCampaignReport(); // Fetch the new report data
    }
  }, [id, user]);

  const handleOpenTestDialog = () => setTestDialogOpen(true);
  const handleCloseTestDialog = () => {
    setTestDialogOpen(false);
    setTestPhoneNumber('');
  };

  const handleSendTest = async () => {
    if (!testPhoneNumber) return;
    try {
      await campanhaService.sendTest(id, { testPhoneNumber });
      // Adicionar notificação de sucesso
    } catch (err) {
      setError('Falha ao enviar teste da campanha.');
    } finally {
      handleCloseTestDialog();
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      draft: { label: 'Rascunho', color: 'default' },
      scheduled: { label: 'Agendada', color: 'info' },
      processing: { label: 'Processando', color: 'warning' },
      sent: { label: 'Enviada', color: 'success' },
      failed: { label: 'Falhou', color: 'error' },
    };
    const { label, color } = statusMap[status] || { label: 'Desconhecido', color: 'default' };
    return <Chip label={label} color={color} />;
  };

  const getLogStatusChip = (status) => {
    const statusMap = {
      sent: { label: 'Enviado', color: 'success' },
      failed: { label: 'Falhou', color: 'error' },
      skipped: { label: 'Ignorado', color: 'default' },
    };
    const { label, color } = statusMap[status] || { label: 'Desconhecido', color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

  if (loading || reportLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
    if (!campaign) return <Alert severity="info">Campanha não encontrada.</Alert>;
  if (!campaignReport) return <Alert severity="info">Relatório da campanha não disponível.</Alert>;

  const imageUrl = campaign.mediaUrl ? `${process.env.REACT_APP_API_URL}${campaign.mediaUrl}` : null;

  // Usar estatísticas do relatório
  const totalRecipients = campaignReport.abTest.summary.totalRecipients;
  const sentCount = campaignReport.delivery.sent || 0;
  const failedCount = campaignReport.delivery.failed || 0;
  const skippedCount = campaignReport.delivery.skipped || 0;
  const overallConversionRate = campaignReport.abTest.summary.totalConversionRate;
  const totalLogs = campaignLogs.length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard/cupons/campanhas')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {campaign.nome}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Coluna da Esquerda: Detalhes da Campanha */}
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            {imageUrl && (
              <CardMedia
                component="img"
                height="300"
                image={imageUrl}
                alt={`Imagem da campanha ${campaign.nome}`}
                sx={{ objectFit: 'contain', p: 1, backgroundColor: '#f5f5f5' }}
              />
            )}
            <CardContent>
              <Typography variant="h6" gutterBottom>Variações de Mensagem</Typography>
              {campaign.mensagens.map((msg, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, whiteSpace: 'pre-wrap', backgroundColor: '#fafafa' }}>
                  <Typography variant="body2">{msg}</Typography>
                </Paper>
              ))}
            </CardContent>
          </Card>

          {/* Tabela de Logs Detalhados */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Logs de Envio</Typography>
              {logsLoading ? (
                <CircularProgress size={24} />
              ) : totalLogs === 0 ? (
                <Typography variant="body2" color="text.secondary">Nenhum log de envio encontrado para esta campanha.</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Telefone</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Erro</TableCell>
                        <TableCell>Data/Hora</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {campaignLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.client?.name || 'N/A'}</TableCell>
                          <TableCell>{log.client?.phone || 'N/A'}</TableCell>
                          <TableCell>{getLogStatusChip(log.status)}</TableCell>
                          <TableCell>
                            <MuiTooltip title={log.errorMessage || 'Sem erro'}>
                              <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                                {log.errorMessage || '-'}
                              </Typography>
                            </MuiTooltip>
                          </TableCell>
                          <TableCell>{new Date(log.sentAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Coluna da Direita: Status, Estatísticas e Ações */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Status da Campanha</Typography>
                  {getStatusChip(campaign.status)}
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    <ListItem>
                      <ListItemIcon><EventIcon /></ListItemIcon>
                      <ListItemText primary="Criada em" secondary={new Date(campaign.createdAt).toLocaleString()} />
                    </ListItem>
                    {campaign.startDate && (
                      <ListItem>
                        <ListItemIcon><ScheduleIcon /></ListItemIcon>
                        <ListItemText primary="Início agendado" secondary={new Date(campaign.startDate).toLocaleString()} />
                      </ListItem>
                    )}
                    {campaign.dataValidade && (
                      <ListItem>
                        <ListItemIcon><EventIcon color="error" /></ListItemIcon>
                        <ListItemText primary="Data de Validade" secondary={new Date(campaign.dataValidade).toLocaleString()} />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Estatísticas de Envio</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><PeopleIcon /></ListItemIcon>
                      <ListItemText primary="Total de Destinatários" secondary={totalRecipients} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Mensagens Enviadas" secondary={sentCount} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText primary="Mensagens com Falha" secondary={failedCount} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><MessageIcon color="disabled" /></ListItemIcon>
                      <ListItemText primary="Mensagens Ignoradas" secondary={skippedCount} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><BarChartIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="Taxa de Conversão Geral" secondary={`${overallConversionRate}%`} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {campaignReport.abTest.variants.length > 1 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Resultados do Teste A/B</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Variante</TableCell>
                            <TableCell align="right">Destinatários</TableCell>
                            <TableCell align="right">Conversões</TableCell>
                            <TableCell align="right">Taxa de Conversão</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {campaignReport.abTest.variants.map((variant) => (
                            <TableRow key={variant.variant}>
                              <TableCell>{variant.variant}</TableCell>
                              <TableCell align="right">{variant.recipients}</TableCell>
                              <TableCell align="right">{variant.conversions}</TableCell>
                              <TableCell align="right">{`${variant.conversionRate}%`}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    <Typography variant="subtitle1" gutterBottom>Comparativo de Conversão</Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={campaignReport.abTest.variants}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="variant" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="conversionRate" name="Taxa de Conversão (%)" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Ações</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/dashboard/cupons/campanhas/editar/${campaign.id}`)}
                    >
                      Editar Campanha
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<SendIcon />}
                      onClick={handleOpenTestDialog}
                    >
                      Enviar Teste
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Test Send Dialog */}
      <Dialog open={testDialogOpen} onClose={handleCloseTestDialog}>
        <DialogTitle>Enviar Campanha de Teste</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Digite o número de WhatsApp para enviar um teste da campanha "{campaign?.nome}".
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Número do WhatsApp"
            type="tel"
            fullWidth
            variant="standard"
            value={testPhoneNumber}
            onChange={(e) => setTestPhoneNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestDialog}>Cancelar</Button>
          <Button onClick={handleSendTest} disabled={!testPhoneNumber}>Enviar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignDetailsPage;
