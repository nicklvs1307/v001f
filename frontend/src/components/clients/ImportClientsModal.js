import React, { useState } from 'react';
import { Modal, Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import apiAuthenticated from '../../services/apiAuthenticated';

const ImportClientsModal = ({ open, onClose }) => {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleImport = async () => {
        if (!file) {
            setError('Por favor, selecione um arquivo.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setImporting(true);
        setError('');
        setImportResult(null);

        try {
            const response = await apiAuthenticated.post('/clients/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImportResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Ocorreu um erro ao importar os clientes.');
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setImporting(false);
        setImportResult(null);
        setError('');
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{ ...style, width: 400 }}>
                <Typography variant="h6" component="h2">Importar Clientes Saipos</Typography>
                <Typography sx={{ mt: 2 }}>
                    Selecione o arquivo .xlsx para importar os clientes.
                </Typography>
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    style={{ marginTop: '16px' }}
                />
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {importResult && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        <p>Importação concluída!</p>
                        <p>Clientes importados: {importResult.importedCount}</p>
                        <p>Clientes ignorados (duplicados): {importResult.skippedCount}</p>
                        {importResult.errors && importResult.errors.length > 0 && (
                            <div>
                                <p>Erros:</p>
                                <ul>
                                    {importResult.errors.map((err, index) => (
                                        <li key={index}>{JSON.stringify(err.row)} - {err.error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Alert>
                )}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose} sx={{ mr: 1 }}>Cancelar</Button>
                    <Button onClick={handleImport} variant="contained" disabled={importing}>
                        {importing ? <CircularProgress size={24} /> : 'Importar'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default ImportClientsModal;
