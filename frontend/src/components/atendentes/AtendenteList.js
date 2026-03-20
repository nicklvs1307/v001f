import React, { useState, useContext } from 'react';
import useAtendentes from '../../hooks/useAtendentes';
import AuthContext from '../../context/AuthContext';
import AtendenteModal from './AtendenteModal';
import AtendenteQRCodeModal from './AtendenteQRCodeModal';
import AtendenteAutomationModal from './AtendenteAutomationModal';
import ConfirmationDialog from '../layout/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import { 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    CircularProgress, 
    Alert,
    Button,
    IconButton,
    Tooltip,
    Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SendIcon from '@mui/icons-material/Send';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const AtendenteList = () => {
    const { user } = useContext(AuthContext);
    const { atendentes, loading, error, createAtendente, updateAtendente, deleteAtendente } = useAtendentes();
    const { showNotification } = useNotification();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    
    const [selectedAtendente, setSelectedAtendente] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [sendAll, setSendAll] = useState(false);
    const [formError, setFormError] = useState('');


    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedIds(atendentes.map((n) => n.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        const selectedIndex = selectedIds.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedIds, id);
        } else {
            newSelected = newSelected.concat(
                selectedIds.slice(0, selectedIndex),
                selectedIds.slice(selectedIndex + 1),
            );
        }
        setSelectedIds(newSelected);
    };

    const handleOpenModal = (atendente = null) => {
        setSelectedAtendente(atendente);
        setFormError(''); // Clear previous errors
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedAtendente(null);
        setIsModalOpen(false);
        setFormError(''); // Also clear errors on close
    };
    
    const handleOpenQrModal = (atendente) => {
        setSelectedAtendente(atendente);
        setIsQrModalOpen(true);
    };

    const handleCloseQrModal = () => {
        setSelectedAtendente(null);
        setIsQrModalOpen(false);
    };

    const handleOpenAutoModal = (atendente = null, all = false) => {
        if (atendente) {
            setSelectedIds([atendente.id]);
            setSendAll(false);
        } else if (all) {
            setSendAll(true);
        } else {
            setSendAll(false);
        }
        setIsAutoModalOpen(true);
    };

    const handleCloseAutoModal = () => {
        setIsAutoModalOpen(false);
        if (!sendAll && selectedIds.length === 1) {
            setSelectedIds([]);
        }
    };
    


    const handleOpenConfirm = (atendente) => {
        setSelectedAtendente(atendente);
        setIsConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setSelectedAtendente(null);
        setIsConfirmOpen(false);
    };

    const handleAtendenteCreate = async (atendenteData) => {
        try {
            await createAtendente(atendenteData);
            showNotification('Atendente criado com sucesso!', 'success');
            handleCloseModal();
        } catch (err) {
            setFormError(err.message);
            showNotification(err.message, 'error');
        }
    };

    const handleAtendenteUpdate = async (atendenteData) => {
        try {
            await updateAtendente(selectedAtendente.id, atendenteData);
            showNotification('Atendente atualizado com sucesso!', 'success');
            handleCloseModal();
        } catch (err) {
            setFormError(err.message);
            showNotification(err.message, 'error');
        }
    };

    const handleAtendenteDelete = async () => {
        try {
            await deleteAtendente(selectedAtendente.id);
            showNotification('Atendente deletado com sucesso!', 'success');
            handleCloseConfirm();
        } catch (err) {
            showNotification(err.message, 'error');
            console.error(err);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">Atendentes</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {(user?.role?.name?.toLowerCase() === 'super admin' || user?.role?.name?.toLowerCase() === 'admin') && (
                        <>
                            <Button
                                variant="outlined"
                                color="success"
                                startIcon={<WhatsAppIcon />}
                                onClick={() => handleOpenAutoModal(null, true)}
                                disabled={atendentes.length === 0}
                            >
                                Enviar para Todos
                            </Button>
                            {selectedIds.length > 0 && (
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<SendIcon />}
                                    onClick={() => handleOpenAutoModal()}
                                >
                                    Enviar ({selectedIds.length})
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenModal()}
                            >
                                Novo Atendente
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Paper elevation={2}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedIds.length > 0 && selectedIds.length < atendentes.length}
                                        checked={atendentes.length > 0 && selectedIds.length === atendentes.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>Nome</TableCell>
                                <TableCell>WhatsApp</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {atendentes.map((atendente) => (
                                <TableRow 
                                    key={atendente.id}
                                    selected={selectedIds.indexOf(atendente.id) !== -1}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedIds.indexOf(atendente.id) !== -1}
                                            onChange={() => handleSelectOne(atendente.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{atendente.name}</TableCell>
                                    <TableCell>{atendente.phone || '---'}</TableCell>
                                    <TableCell>{atendente.status === 'active' ? 'Ativo' : 'Inativo'}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Enviar Link via WhatsApp">
                                            <IconButton 
                                                color="success" 
                                                onClick={() => handleOpenAutoModal(atendente)}
                                                disabled={!atendente.phone}
                                            >
                                                <WhatsAppIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Gerar QR Code de Pesquisa">
                                            <IconButton color="info" onClick={() => handleOpenQrModal(atendente)}>
                                                <QrCodeIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton color="primary" onClick={() => handleOpenModal(atendente)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="secondary" onClick={() => handleOpenConfirm(atendente)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <AtendenteModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onAtendenteCreated={handleAtendenteCreate}
                onAtendenteUpdated={handleAtendenteUpdate}
                initialData={selectedAtendente}
                formError={formError}
                onError={setFormError}
            />

            <AtendenteQRCodeModal 
                open={isQrModalOpen}
                onClose={handleCloseQrModal}
                atendente={selectedAtendente}
            />

            <AtendenteAutomationModal
                open={isAutoModalOpen}
                onClose={handleCloseAutoModal}
                selectedIds={selectedIds}
                all={sendAll}
            />

            <ConfirmationDialog
                open={isConfirmOpen}
                onClose={handleCloseConfirm}
                onConfirm={handleAtendenteDelete}
                title="Confirmar Exclusão"
                description={`Tem certeza que deseja deletar o atendente ${selectedAtendente?.name}?`}
            />
        </Box>
    );
};

export default AtendenteList;
