
import React from 'react';
import {
    Modal,
    Backdrop,
    Fade,
    Box,
    Alert
} from '@mui/material';
import SurveyForm from './SurveyForm';

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

const SurveyModal = ({ open, onClose, onSurveyCreated, onSurveyUpdated, initialData, formError, onError }) => {
    return (
        <Modal
            aria-labelledby="survey-modal-title"
            aria-describedby="survey-modal-description"
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
                    <SurveyForm
                        initialData={initialData}
                        onSurveyCreated={onSurveyCreated}
                        onSurveyUpdated={onSurveyUpdated}
                        onError={onError}
                        onClose={onClose}
                    />
                </Box>
            </Fade>
        </Modal>
    );
};

export default SurveyModal;
