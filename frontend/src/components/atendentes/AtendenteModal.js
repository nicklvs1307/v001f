
import React from 'react';
import {
    Modal,
    Backdrop,
    Fade,
    Box,
    Alert
} from '@mui/material';
import AtendenteForm from './AtendenteForm';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const AtendenteModal = ({ open, onClose, onAtendenteCreated, onAtendenteUpdated, initialData, formError, onError }) => {
    return (
        <Modal
            aria-labelledby="atendente-modal-title"
            aria-describedby="atendente-modal-description"
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
                    <AtendenteForm
                        initialData={initialData}
                        onAtendenteCreated={onAtendenteCreated}
                        onAtendenteUpdated={onAtendenteUpdated}
                        onError={onError}
                        onClose={onClose}
                    />
                </Box>
            </Fade>
        </Modal>
    );
};

export default AtendenteModal;
