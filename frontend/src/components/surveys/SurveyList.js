import React, { useState } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Button,
    IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate } from 'react-router-dom';
import useSurveys from '../../hooks/useSurveys';
import usePermissions from '../../hooks/usePermissions';
import SurveyModal from './SurveyModal';
import ConfirmationDialog from '../layout/ConfirmationDialog';
import { formatDateForDisplay } from '../../utils/dateUtils';

const SurveyList = () => {
    const { surveys, loading, error, createSurvey, updateSurvey, deleteSurvey } = useSurveys();
    const { canCreateSurvey, canViewSurveyResults, canEditSurvey, canDeleteSurvey } = usePermissions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [formError, setFormError] = useState('');
    const navigate = useNavigate();

    const handleOpenModal = (survey = null) => {
        setSelectedSurvey(survey);
        setIsModalOpen(true);
        setFormError('');
    };

    const handleCloseModal = () => {
        setSelectedSurvey(null);
        setIsModalOpen(false);
        setFormError('');
    };

    const handleOpenConfirm = (survey) => {
        setSelectedSurvey(survey);
        setIsConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setSelectedSurvey(null);
        setIsConfirmOpen(false);
    };

    const handleViewResults = (surveyId) => {
        navigate(`/surveys/${surveyId}/results`);
    };

    const handleSurveyCreate = async (surveyData) => {
        try {
            await createSurvey(surveyData);
            handleCloseModal();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleSurveyUpdate = async (surveyData) => {
        try {
            await updateSurvey(selectedSurvey.id, surveyData);
            handleCloseModal();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleSurveyDelete = async () => {
        try {
            await deleteSurvey(selectedSurvey.id);
            handleCloseConfirm();
        } catch (err) {
            // You might want to show an error to the user
            console.error(err);
        }
    };

    const handleFormError = (msg) => {
        setFormError(msg);
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>Gerenciamento de Pesquisas</Typography>
            {canCreateSurvey && (
                <Button
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={() => handleOpenModal()}
                    startIcon={<AddIcon />}
                >
                    Criar Nova Pesquisa
                </Button>
            )}

            {error && <Alert severity="error">{error}</Alert>}
            <List>
                {surveys.length > 0 ? (
                    surveys.map((survey) => (
                        <ListItem
                            key={survey.id}
                            divider
                            secondaryAction={
                                <>
                                    {canViewSurveyResults && (
                                        <IconButton edge="end" aria-label="ver resultados" onClick={() => handleViewResults(survey.id)}>
                                            <BarChartIcon />
                                        </IconButton>
                                    )}
                                    {canEditSurvey(survey) && (
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenModal(survey)}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                    {canDeleteSurvey(survey) && (
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleOpenConfirm(survey)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </>
                            }
                        >
                            <ListItemText
                                primary={survey.title}
                                secondary={`Criado por: ${survey.creator_name} | Tenant: ${survey.tenant_name} | Em: ${formatDateForDisplay(survey.created_at, 'dd/MM/yyyy')}`}
                            />
                        </ListItem>
                    ))
                ) : (
                    <Typography>Nenhuma pesquisa encontrada.</Typography>
                )}
            </List>

            <SurveyModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSurveyCreated={handleSurveyCreate}
                onSurveyUpdated={handleSurveyUpdate}
                initialData={selectedSurvey}
                formError={formError}
                onError={handleFormError}
            />

            <ConfirmationDialog
                open={isConfirmOpen}
                onClose={handleCloseConfirm}
                onConfirm={handleSurveyDelete}
                title="Confirmar Deleção"
                description={`Tem certeza que deseja deletar a pesquisa "${selectedSurvey?.title}"? Esta ação é irreversível.`}
            />
        </Box>
    );
};

export default SurveyList;
