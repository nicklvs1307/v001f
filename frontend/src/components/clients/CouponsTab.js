import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import { format } from 'date-fns';
import CupomDetailsModal from '../coupons/CupomDetailsModal';

const CouponsTab = ({ coupons, isUsed = false }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCupom, setSelectedCupom] = useState(null);

    if (!coupons || coupons.length === 0) {
        return (
            <Box sx={{ mt: 3 }}>
                <Typography>Nenhum cupom para exibir.</Typography>
            </Box>
        );
    }

    const handleCardClick = (cupom) => {
        setSelectedCupom(cupom);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedCupom(null);
    };

    return (
        <>
            <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                    {coupons.map((cupom) => (
                        <Grid item xs={12} md={6} key={cupom.id}>
                            <Paper 
                                sx={{ p: 2, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                                onClick={() => handleCardClick(cupom)}
                            >
                                <Typography variant="h6">{cupom.recompensa?.name || 'Recompensa não encontrada'}</Typography>
                                <Typography variant="body2" color="text.secondary">Código: {cupom.codigo}</Typography>
                                {isUsed ? (
                                    <Chip label={`Usado em: ${format(new Date(cupom.dataUtilizacao), 'dd/MM/yyyy')}`} color="success" size="small" sx={{ mt: 1 }} />
                                ) : (
                                    <Chip label={`Válido até: ${format(new Date(cupom.dataValidade), 'dd/MM/yyyy')}`} color="primary" size="small" sx={{ mt: 1 }} />
                                )}
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <CupomDetailsModal
                open={modalOpen}
                onClose={handleCloseModal}
                cupom={selectedCupom}
            />
        </>
    );
};

export default CouponsTab;
