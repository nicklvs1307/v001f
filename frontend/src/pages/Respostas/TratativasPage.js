import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    Typography, Box, Paper, Grid, Card, CardContent, IconButton, 
    Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Chip, Stack, CircularProgress, Divider
} from '@mui/material';
import { 
    WhatsApp as WhatsAppIcon, 
    MoreVert as MoreVertIcon,
    Chat as ChatIcon,
    NoteAlt as NoteIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PageLayout from '../../components/layout/PageLayout';
import dashboardService from '../../services/dashboardService';
import AuthContext from '../../context/AuthContext';
import { formatDateForDisplay } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const STATUS_COLUMNS = {
    'PENDENTE': { name: 'Pendentes', color: '#ff4d4f' },
    'EM_ANDAMENTO': { name: 'Em Atendimento', color: '#faad14' },
    'CONCLUIDO': { name: 'Concluídos', color: '#52c41a' },
};

const TratativasPage = () => {
    const { user } = useContext(AuthContext);
    const [columns, setColumns] = useState({
        'PENDENTE': { items: [] },
        'EM_ANDAMENTO': { items: [] },
        'CONCLUIDO': { items: [] },
    });
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

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

            const newColumns = {
                'PENDENTE': { items: [] },
                'EM_ANDAMENTO': { items: [] },
                'CONCLUIDO': { items: [] },
            };

            data.rows.forEach(fb => {
                const status = fb.status || 'PENDENTE';
                if (newColumns[status]) {
                    newColumns[status].items.push({ ...fb, dndId: fb.sessionId });
                }
            });

            setColumns(newColumns);

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

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColumn = columns[source.droppableId];
        const destColumn = columns[destination.droppableId];
        const sourceItems = [...sourceColumn.items];
        const destItems = [...destColumn.items];
        
        const [removed] = sourceItems.splice(source.index, 1);
        
        if (source.droppableId !== destination.droppableId) {
            destItems.splice(destination.index, 0, { ...removed, status: destination.droppableId });
            
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
                [destination.droppableId]: { ...destColumn, items: destItems },
            });

            try {
                await dashboardService.updateFeedbackStatus(removed.sessionId, { status: destination.droppableId });
                toast.success(`Status atualizado para ${STATUS_COLUMNS[destination.droppableId].name}`);
            } catch (error) {
                console.error("Failed to update status", error);
                toast.error("Erro ao atualizar status.");
                fetchFeedbacks(); // Revert on failure
            }
        } else {
            sourceItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
            });
        }
    };

    const handleOpenDetails = (feedback) => {
        setSelectedFeedback(feedback);
        setNotes(feedback.notes || '');
        setIsModalOpen(true);
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await dashboardService.updateFeedbackStatus(selectedFeedback.sessionId, { notes });
            toast.success("Anotações salvas com sucesso!");
            
            // Atualiza o estado local
            setColumns(prev => {
                const newCols = { ...prev };
                const col = newCols[selectedFeedback.status];
                const index = col.items.findIndex(i => i.sessionId === selectedFeedback.sessionId);
                if (index !== -1) {
                    col.items[index].notes = notes;
                }
                return newCols;
            });
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Erro ao salvar anotações.");
        } finally {
            setSavingNotes(false);
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

    const formatWhatsAppLink = (phone) => {
        if (!phone) return null;
        const cleanPhone = phone.replace(/\D/g, '');
        return `https://wa.me/55${cleanPhone}`;
    };

    return (
        <PageLayout 
            title="Gestão de Tratativas" 
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
                <DragDropContext onDragEnd={onDragEnd}>
                    <Grid container spacing={2} sx={{ height: 'calc(100vh - 250px)', overflowX: 'auto', flexWrap: 'nowrap', pb: 2 }}>
                        {Object.entries(STATUS_COLUMNS).map(([columnId, columnInfo]) => (
                            <Grid item key={columnId} sx={{ minWidth: 350, maxWidth: 400, height: '100%' }}>
                                <Paper 
                                    sx={{ 
                                        p: 2, 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '12px',
                                        borderTop: `4px solid ${columnInfo.color}`
                                    }}
                                >
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {columnInfo.name}
                                        </Typography>
                                        <Chip 
                                            label={columns[columnId].items.length} 
                                            size="small" 
                                            sx={{ backgroundColor: columnInfo.color, color: 'white' }} 
                                        />
                                    </Box>

                                    <Droppable droppableId={columnId}>
                                        {(provided, snapshot) => (
                                            <Box
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                sx={{
                                                    flexGrow: 1,
                                                    overflowY: 'auto',
                                                    background: snapshot.isDraggingOver ? 'rgba(0,0,0,0.02)' : 'transparent',
                                                    transition: 'background 0.2s ease',
                                                    minHeight: 100,
                                                    p: 0.5
                                                }}
                                            >
                                                {columns[columnId].items.map((item, index) => {
                                                    const nps = getNPSInfo(item.responses);
                                                    return (
                                                        <Draggable key={item.dndId} draggableId={item.dndId} index={index}>
                                                            {(provided, snapshot) => (
                                                                <Card
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    onClick={() => handleOpenDetails(item)}
                                                                    sx={{
                                                                        mb: 1.5,
                                                                        cursor: 'pointer',
                                                                        boxShadow: snapshot.isDragging ? 8 : 1,
                                                                        '&:hover': { boxShadow: 4 },
                                                                        borderLeft: `5px solid ${nps.color}`,
                                                                        position: 'relative'
                                                                    }}
                                                                >
                                                                    <CardContent sx={{ p: '12px !important' }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                <CalendarIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                                                                {formatDateForDisplay(item.createdAt, 'dd/MM/yyyy HH:mm')}
                                                                            </Typography>
                                                                            {nps.score !== null && (
                                                                                <Chip 
                                                                                    label={nps.score} 
                                                                                    size="small" 
                                                                                    sx={{ 
                                                                                        height: 20, 
                                                                                        fontSize: '0.7rem',
                                                                                        backgroundColor: nps.color,
                                                                                        color: 'white',
                                                                                        fontWeight: 'bold'
                                                                                    }} 
                                                                                />
                                                                            )}
                                                                        </Box>

                                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center' }}>
                                                                            <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                                            {item.client?.name || 'Cliente Anônimo'}
                                                                        </Typography>

                                                                        <Typography 
                                                                            variant="body2" 
                                                                            color="text.secondary" 
                                                                            sx={{ 
                                                                                mb: 1.5, 
                                                                                display: '-webkit-box',
                                                                                WebkitLineClamp: 2,
                                                                                WebkitBoxOrient: 'vertical',
                                                                                overflow: 'hidden',
                                                                                minHeight: 32,
                                                                                fontSize: '0.8rem'
                                                                            }}
                                                                        >
                                                                            {item.responses.find(r => r.questionType === 'text' || r.answer)?.answer || 'Sem comentário'}
                                                                        </Typography>

                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <Stack direction="row" spacing={1}>
                                                                                {item.client?.phone && (
                                                                                    <Tooltip title="Falar no WhatsApp">
                                                                                        <IconButton 
                                                                                            size="small" 
                                                                                            component="a" 
                                                                                            href={formatWhatsAppLink(item.client.phone)} 
                                                                                            target="_blank"
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            sx={{ color: '#25D366' }}
                                                                                        >
                                                                                            <WhatsAppIcon fontSize="small" />
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                )}
                                                                                {item.notes && (
                                                                                    <Tooltip title="Tem anotações">
                                                                                        <NoteIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5 }} />
                                                                                    </Tooltip>
                                                                                )}
                                                                            </Stack>
                                                                            <IconButton size="small">
                                                                                <MoreVertIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </Box>
                                        )}
                                    </Droppable>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </DragDropContext>
            )}

            {/* Modal de Detalhes */}
            <Dialog 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px' } }}
            >
                {selectedFeedback && (
                    <>
                        <DialogTitle sx={{ backgroundColor: '#f8f9fa', pb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight="bold">Detalhes da Resposta</Typography>
                                <Chip 
                                    label={STATUS_COLUMNS[selectedFeedback.status]?.name} 
                                    sx={{ backgroundColor: STATUS_COLUMNS[selectedFeedback.status]?.color, color: 'white' }} 
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={7}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ChatIcon sx={{ mr: 1, color: 'primary.main' }} /> Questionário
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                                        {selectedFeedback.responses.map((resp, i) => (
                                            <Box key={i} sx={{ mb: 2, p: 1.5, borderRadius: '8px', backgroundColor: '#fdfdfd', border: '1px solid #eee' }}>
                                                <Typography variant="subtitle2" color="primary" gutterBottom>{resp.question}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {resp.questionType.includes('rating') && <StarIcon sx={{ color: '#faad14', fontSize: 18, mr: 0.5 }} />}
                                                    <Typography variant="body1">{resp.answer}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#f8f9fa', mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Dados do Cliente</Typography>
                                        <Stack spacing={1}>
                                            <Typography variant="body2"><strong>Nome:</strong> {selectedFeedback.client?.name || 'Anônimo'}</Typography>
                                            <Typography variant="body2"><strong>Telefone:</strong> {selectedFeedback.client?.phone || 'N/A'}</Typography>
                                            <Typography variant="body2"><strong>E-mail:</strong> {selectedFeedback.client?.email || 'N/A'}</Typography>
                                            {selectedFeedback.client?.phone && (
                                                <Button 
                                                    variant="contained" 
                                                    startIcon={<WhatsAppIcon />} 
                                                    href={formatWhatsAppLink(selectedFeedback.client.phone)}
                                                    target="_blank"
                                                    sx={{ backgroundColor: '#25D366', '&:hover': { backgroundColor: '#1ebe57' }, mt: 1 }}
                                                >
                                                    Falar no WhatsApp
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                        <NoteIcon sx={{ mr: 1 }} /> Anotações Internas
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={8}
                                        placeholder="Descreva o que foi feito ou anote detalhes importantes..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        variant="outlined"
                                        sx={{ backgroundColor: 'white' }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                            <Button onClick={() => setIsModalOpen(false)}>Fechar</Button>
                            <Button 
                                variant="contained" 
                                onClick={handleSaveNotes} 
                                disabled={savingNotes}
                                startIcon={savingNotes ? <CircularProgress size={20} /> : <NoteIcon />}
                            >
                                Salvar Anotações
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </PageLayout>
    );
};

export default TratativasPage;