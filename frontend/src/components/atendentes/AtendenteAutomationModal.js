import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Box, 
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import surveyService from '../../services/surveyService';
import atendenteService from '../../services/atendenteService';
import { useNotification } from '../../context/NotificationContext';

const AtendenteAutomationModal = ({ open, onClose, selectedIds, all }) => {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        if (open) {
            setLoading(true);
            surveyService.getSurveysList()
                .then(data => {
                    setSurveys(data.filter(s => s.status === 'active'));
                })
                .catch(err => console.error("Erro ao buscar pesquisas:", err))
                .finally(() => setLoading(false));
        }
    }, [open]);

    const handleSend = async () => {
        if (!selectedSurvey) return;
        
        setSending(true);
        try {
            const result = await atendenteService.sendSurveyLink({
                pesquisaId: selectedSurvey,
                atendenteIds: selectedIds,
                all: all
            });
            
            showNotification(`Sucesso! ${result.results.success} mensagens enviadas. ${result.results.failed} falhas.`, 'success');
            onClose();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Erro ao enviar links.', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Disparar Link de Pesquisa</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        {all 
                            ? "Você está enviando o link para TODOS os atendentes ativos." 
                            : `Você está enviando o link para ${selectedIds.length} atendente(s) selecionado(s).`
                        }
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel id="auto-survey-select-label">Selecione a Pesquisa</InputLabel>
                        <Select
                            labelId="auto-survey-select-label"
                            value={selectedSurvey}
                            label="Selecione a Pesquisa"
                            onChange={(e) => setSelectedSurvey(e.target.value)}
                            disabled={loading || sending}
                        >
                            {loading ? (
                                <MenuItem disabled><CircularProgress size={20} /></MenuItem>
                            ) : (
                                surveys.map(s => (
                                    <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={sending}>Cancelar</Button>
                <Button 
                    onClick={handleSend} 
                    variant="contained" 
                    disabled={!selectedSurvey || sending}
                    startIcon={sending && <CircularProgress size={20} color="inherit" />}
                >
                    {sending ? 'Enviando...' : 'Confirmar Envio'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AtendenteAutomationModal;
