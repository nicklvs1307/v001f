import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { 
    Typography, Box, Paper, Grid, Card, CardContent, IconButton, 
    Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Chip, Stack, CircularProgress, Divider, List, ListItem, ListItemText
} from '@mui/material';
import { 
    WhatsApp as WhatsAppIcon, 
    MoreVert as MoreVertIcon,
    Chat as ChatIcon,
    NoteAlt as NoteIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Star as StarIcon,
    Send as SendIcon
} from '@mui/icons-material';
import PageLayout from '../../components/layout/PageLayout';
import dashboardService from '../../services/dashboardService';
import AuthContext from '../../context/AuthContext';
import { formatDateForDisplay } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const ReplicasPage = () => {
    const { user } = useContext(AuthContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replicas, setReplicas] = useState([]);
    const [newReplicaMessage, setNewReplicaMessage] = useState('');
    const [sendingReplica, setSendingReplica] = useState(false);
    const messagesEndRef = useRef(null);

    // Filtros de data
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());

    const fetchFeedbacks = useCallback(async () => {
        if (!user?.tenantId) return;

        try {
            setLoading(true);
            const params = { 
                tenantId: user.tenantId, 
                limit: 100,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };
            const data = await dashboardService.getAllFeedbacks(params);
            setFeedbacks(data.rows || []);
        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
            toast.error("Erro ao carregar feedbacks.");
        } finally {
            setLoading(false);
        }
    }, [user, startDate, endDate]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleOpenDetails = async (feedback) => {
        setSelectedFeedback(feedback);
        setIsModalOpen(true);
        // Load replicas
        try {
            const fetchedReplicas = await dashboardService.getReplicas(feedback.sessionId);
            setReplicas(fetchedReplicas);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to fetch replicas", error);
            toast.error("Erro ao carregar histórico de mensagens.");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isModalOpen) {
            scrollToBottom();
        }
    }, [replicas, isModalOpen]);

    const handleSendReplica = async () => {
        if (!newReplicaMessage.trim()) return;

        setSendingReplica(true);
        try {
            const newReplica = await dashboardService.createReplica(selectedFeedback.sessionId, { message: newReplicaMessage });
            setReplicas([...replicas, newReplica]);
            setNewReplicaMessage('');
            toast.success("Mensagem enviada!");
        } catch (error) {
            console.error("Failed to send replica", error);
            toast.error("Erro ao enviar mensagem.");
        } finally {
            setSendingReplica(false);
        }
    };

    const getNPSInfo = (responses) => {
        const npsResponse = responses.find(r => r.questionType === 'rating_0_10');
        if (!npsResponse) return { color: '#8c8c8c', label: 'N/A', score: null };

        const score = npsResponse.ratingValue;
        if (score >= 9) return { color: '#52c41a', label: 'Promotor', score };
        if (score >= 7) return { color: '#faad14', label: 'Neutro', score };
        return { color: '#ff4d4f', label: 'Detrator', score };
    };

    return (
        <PageLayout 
            title="Gestão de Réplicas" 
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
        >
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {feedbacks.map((item) => {
                        const nps = getNPSInfo(item.responses);
                        const comment = item.responses.find(r => r.questionType === 'text' || r.answer)?.answer || 'Sem comentário';
                        
                        return (
                            <Grid item xs={12} md={6} lg={4} key={item.sessionId}>
                                <Card 
                                    onClick={() => handleOpenDetails(item)}
                                    sx={{ 
                                        cursor: 'pointer', 
                                        transition: '0.3s',
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                                        borderLeft: `6px solid ${nps.color}`,
                                        height: '100%'
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                {formatDateForDisplay(item.createdAt, 'dd/MM/yyyy HH:mm')}
                                            </Typography>
                                            {nps.score !== null && (
                                                <Chip 
                                                    label={`${nps.score} - ${nps.label}`} 
                                                    size="small" 
                                                    sx={{ backgroundColor: nps.color, color: 'white', fontWeight: 'bold' }} 
                                                />
                                            )}
                                        </Box>
                                        
                                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center' }}>
                                            <PersonIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                                            {item.client?.name || 'Cliente Anônimo'}
                                        </Typography>
                                        
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            sx={{ 
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                minHeight: 40,
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            "{comment}"
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                startIcon={<ChatIcon />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDetails(item);
                                                }}
                                            >
                                                Responder
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                    {feedbacks.length === 0 && (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography variant="h6" color="textSecondary">
                                    Nenhuma resposta encontrada neste período.
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Modal de Conversa */}
            <Dialog 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', height: '80vh' } }}
            >
                {selectedFeedback && (
                    <>
                        <DialogTitle sx={{ borderBottom: '1px solid #eee', px: 3, py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        {selectedFeedback.client?.name || 'Cliente Anônimo'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {formatDateForDisplay(selectedFeedback.createdAt, 'dd/MM/yyyy HH:mm')}
                                    </Typography>
                                </Box>
                                <IconButton onClick={() => setIsModalOpen(false)}>
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        
                        <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0, height: '100%', backgroundColor: '#f5f7fb' }}>
                            {/* Conteúdo Original do Cliente */}
                            <Box sx={{ p: 3, backgroundColor: 'white', mb: 2, borderBottom: '1px solid #eee' }}>
                                <Typography variant="subtitle2" color="primary" gutterBottom>Feedback Original</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedFeedback.responses.map((resp, i) => (
                                        <Chip 
                                            key={i} 
                                            label={`${resp.question}: ${resp.answer}`} 
                                            variant="outlined" 
                                            size="small"
                                            sx={{ maxWidth: '100%' }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* Área de Chat */}
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                                {replicas.length === 0 ? (
                                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 4 }}>
                                        Nenhuma réplica enviada ainda. Inicie a conversa.
                                    </Typography>
                                ) : (
                                    replicas.map((rep) => (
                                        <Box 
                                            key={rep.id} 
                                            sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'flex-end', 
                                                mb: 2 
                                            }}
                                        >
                                            <Paper 
                                                sx={{ 
                                                    p: 2, 
                                                    backgroundColor: '#dcf8c6', // WhatsApp-like green
                                                    maxWidth: '80%',
                                                    borderRadius: '12px 0 12px 12px'
                                                }}
                                            >
                                                <Typography variant="body1">{rep.message}</Typography>
                                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: 'rgba(0,0,0,0.45)' }}>
                                                    {formatDateForDisplay(rep.createdAt, 'HH:mm')}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Área de Input */}
                            <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #eee' }}>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item xs>
                                        <TextField
                                            fullWidth
                                            placeholder="Digite sua mensagem..."
                                            variant="outlined"
                                            size="small"
                                            multiline
                                            maxRows={4}
                                            value={newReplicaMessage}
                                            onChange={(e) => setNewReplicaMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendReplica();
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            endIcon={sendingReplica ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                            onClick={handleSendReplica}
                                            disabled={sendingReplica || !newReplicaMessage.trim()}
                                        >
                                            Enviar
                                        </Button>
                                    </Grid>
                                </Grid>
                                {!selectedFeedback.client?.phone && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                        Aviso: Este cliente não possui telefone cadastrado. A mensagem será salva apenas internamente.
                                    </Typography>
                                )}
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </PageLayout>
    );
};

export default ReplicasPage;