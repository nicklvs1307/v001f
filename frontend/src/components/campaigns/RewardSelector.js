import React, { useState, useEffect } from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, TextField, MenuItem, Box, Typography } from '@mui/material';

const RewardSelector = ({ campaign, recompensas, roletas, dispatch }) => {
    const [rewardType, setRewardType] = useState('none');

    useEffect(() => {
        if (campaign.recompensaId) {
            setRewardType('recompensa');
        } else if (campaign.roletaId) {
            setRewardType('roleta');
        } else {
            setRewardType('none');
        }
    }, [campaign.recompensaId, campaign.roletaId]);

    const handleTypeChange = (event) => {
        const newType = event.target.value;
        setRewardType(newType);
        if (newType === 'none') {
            dispatch({ type: 'FIELD_CHANGE', payload: { field: 'recompensaId', value: null } });
            dispatch({ type: 'FIELD_CHANGE', payload: { field: 'roletaId', value: null } });
        } else if (newType === 'recompensa') {
            dispatch({ type: 'FIELD_CHANGE', payload: { field: 'roletaId', value: null } });
        } else if (newType === 'roleta') {
            dispatch({ type: 'FIELD_CHANGE', payload: { field: 'recompensaId', value: null } });
        }
    };

    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        dispatch({ type: 'FIELD_CHANGE', payload: { field: name, value: value || null } });
    };

    return (
        <FormControl component="fieldset" fullWidth margin="normal">
            <Typography variant="subtitle1" gutterBottom>Tipo de Prêmio</Typography>
            <RadioGroup row name="rewardType" value={rewardType} onChange={handleTypeChange}>
                <FormControlLabel value="none" control={<Radio />} label="Nenhum" />
                <FormControlLabel value="recompensa" control={<Radio />} label="Recompensa" />
                <FormControlLabel value="roleta" control={<Radio />} label="Roleta" />
            </RadioGroup>

            {rewardType === 'recompensa' && (
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Selecione a Recompensa"
                    name="recompensaId"
                    value={campaign.recompensaId || ''}
                    onChange={handleSelectChange}
                >
                    <MenuItem value=""><em>Nenhuma</em></MenuItem>
                    {recompensas.map(r => <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>)}
                </TextField>
            )}

            {rewardType === 'roleta' && (
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Selecione a Roleta"
                    name="roletaId"
                    value={campaign.roletaId || ''}
                    onChange={handleSelectChange}
                >
                    <MenuItem value=""><em>Nenhuma</em></MenuItem>
                    {roletas.map(r => <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>)}
                </TextField>
            )}
        </FormControl>
    );
};

export default RewardSelector;
