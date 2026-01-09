import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import franchisorReportService from '../services/franchisorReportService';

const FranchisorReportsPage = () => {
    const [format, setFormat] = useState('pdf');
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await franchisorReportService.getConsolidatedReport(format);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading report:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Relatórios Consolidados
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>Formato</InputLabel>
                        <Select
                            value={format}
                            label="Formato"
                            onChange={(e) => setFormat(e.target.value)}
                        >
                            <MenuItem value={'pdf'}>PDF</MenuItem>
                            <MenuItem value={'csv'}>CSV</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        onClick={handleDownload}
                        disabled={loading}
                    >
                        {loading ? 'Gerando...' : 'Baixar Relatório'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default FranchisorReportsPage;
