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
    CircularProgress
} from '@mui/material';
import QRCode from 'react-qr-code';
import surveyService from '../../services/surveyService';

const AtendenteQRCodeModal = ({ open, onClose, atendente }) => {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            surveyService.getSurveys()
                .then(data => {
                    // Filtrar apenas pesquisas ativas
                    setSurveys(data.filter(s => s.status === 'active'));
                })
                .catch(err => console.error("Erro ao buscar pesquisas:", err))
                .finally(() => setLoading(false));
        }
    }, [open]);

    const handleClose = () => {
        setSelectedSurvey('');
        onClose();
    };

    const qrCodeValue = selectedSurvey && atendente 
        ? `${window.location.origin}/pesquisa/${atendente.tenantId}/${selectedSurvey}?atendenteId=${atendente.id}`
        : '';

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>QR Code - ${atendente.name}</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                        .container { text-align: center; border: 2px solid #eee; padding: 40px; border-radius: 20px; }
                        h1 { margin-bottom: 10px; }
                        p { color: #666; margin-bottom: 30px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Avalie nosso atendimento</h1>
                        <p>Atendente: <strong>${atendente.name}</strong></p>
                        <div id="qrcode"></div>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                        <script>
                            new QRCode(document.getElementById("qrcode"), {
                                text: "${qrCodeValue}",
                                width: 256,
                                height: 256
                            });
                            window.onload = function() { window.print(); window.close(); };
                        </script>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>Gerar QR Code de Pesquisa</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Selecione a pesquisa que este atendente ({atendente?.name}) irá apresentar aos clientes.
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel id="survey-select-label">Selecione a Pesquisa</InputLabel>
                        <Select
                            labelId="survey-select-label"
                            value={selectedSurvey}
                            label="Selecione a Pesquisa"
                            onChange={(e) => setSelectedSurvey(e.target.value)}
                            disabled={loading}
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

                    {selectedSurvey && (
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                            <QRCode value={qrCodeValue} size={200} />
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Fechar</Button>
                <Button 
                    onClick={handlePrint} 
                    variant="contained" 
                    disabled={!selectedSurvey}
                >
                    Imprimir
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AtendenteQRCodeModal;
