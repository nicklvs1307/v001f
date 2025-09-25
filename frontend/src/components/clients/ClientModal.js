
import React from 'react';
import {
    Modal,
    Backdrop,
    Fade,
    Box,
    Alert
} from '@mui/material';
import ClientForm from './ClientForm';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
};

const ClientModal = ({ open, onClose, onClientCreated, onClientUpdated, initialData, formError, onError }) => {
    return (
        <Modal
            aria-labelledby="client-modal-title"
            aria-describedby="client-modal-description"
            open={open}
            onClose={onClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={open}>
                <Box sx={modalStyle}>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <ClientForm
                        initialData={initialData}
                        onClientCreated={onClientCreated}
                        onClientUpdated={onClientUpdated}
                        onError={onError}
                        onClose={onClose}
                    />
                </Box>
            </Fade>
        </Modal>
    );
};

export default ClientModal;
