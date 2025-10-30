import React, { useState } from 'react';
import { 
    Modal, Box, Typography, Button, CircularProgress, Alert, 
    IconButton, Paper, Tooltip 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import apiAuthenticated from '../../services/apiAuthenticated';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

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
            <Paper sx={style}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">Importar Clientes Saipos</Typography>
                    <IconButton onClick={handleClose}>X</IconButton>
                </Box>
                <Typography sx={{ mt: 2 }}>
                    Selecione o arquivo .xlsx para importar os clientes.
                </Typography>
                
                <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        Selecionar Arquivo
                        <VisuallyHiddenInput type="file" accept=".xlsx" onChange={handleFileChange} />
                    </Button>
                    {file && <Typography sx={{ mt: 1 }}>{file.name}</Typography>}
                </Box>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                
                {importResult && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        <p>Importação concluída!</p>
                        <p>Clientes importados: {importResult.importedCount}</p>
                        <p>Clientes ignorados (duplicados): {importResult.skippedCount}</p>
                        {importResult.errors && importResult.errors.length > 0 && (
                            <Tooltip title={importResult.errors.map((err, index) => `${JSON.stringify(err.row)} - ${err.error}`).join(', ')}>
                                <p>Erros: {importResult.errors.length}</p>
                            </Tooltip>
                        )}
                    </Alert>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose} sx={{ mr: 1 }}>Cancelar</Button>
                    <Button onClick={handleImport} variant="contained" disabled={importing || !file}>
                        {importing ? <CircularProgress size={24} /> : 'Importar'}
                    </Button>
                </Box>
            </Paper>
        </Modal>
    );
};

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 500,
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
};

export default ImportClientsModal;

