import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Box, Typography, Paper, CircularProgress, Container, 
    Button, Alert 
} from '@mui/material';
import QRCode from 'react-qr-code';
import publicSurveyService from '../services/publicSurveyService';
import PrintIcon from '@mui/icons-material/Print';

const SurveyPublicQrCodePage = () => {
    const { tenantId, pesquisaId } = useParams();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        publicSurveyService.getPublicSurveyById(pesquisaId)
            .then(data => setSurvey(data))
            .catch(err => setError('Não foi possível encontrar a pesquisa.'))
            .finally(() => setLoading(false));
    }, [pesquisaId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

    const publicUrl = `${window.location.origin}/pesquisa/${tenantId}/${pesquisaId}`;

    return (
        <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: '20px' }} className="print-area">
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    QR Code da Pesquisa
                </Typography>
                <Typography variant="h4" color="primary" sx={{ mb: 3 }}>
                    {survey.title}
                </Typography>
                
                <Box sx={{ p: 2, background: 'white', display: 'inline-block', borderRadius: '15px', border: '1px solid #eee' }}>
                    <QRCode value={publicUrl} size={250} />
                </Box>
                
                <Typography variant="body1" sx={{ mt: 3, color: 'text.secondary' }}>
                    Escaneie para avaliar nosso atendimento!
                </Typography>
                
                <Typography variant="caption" sx={{ mt: 2, display: 'block', wordBreak: 'break-all' }}>
                    {publicUrl}
                </Typography>

                <Box sx={{ mt: 4 }} className="no-print">
                    <Button 
                        variant="contained" 
                        startIcon={<PrintIcon />} 
                        onClick={handlePrint}
                        size="large"
                    >
                        Imprimir QR Code
                    </Button>
                </Box>
            </Paper>

            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-area, .print-area * {
                            visibility: visible;
                        }
                        .print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            box-shadow: none !important;
                            border: none !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </Container>
    );
};

export default SurveyPublicQrCodePage;
