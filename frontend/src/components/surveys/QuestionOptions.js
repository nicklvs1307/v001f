
import React from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const QuestionOptions = ({ qIndex, options, handleOptionChange, handleAddOption, handleRemoveOption }) => {
    return (
        <Box sx={{ mt: 2, ml: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Opções:</Typography>
            {options && options.map((option, oIndex) => (
                <Box key={oIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                        label={`Opção ${oIndex + 1}`}
                        value={option.text || ''}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                        fullWidth
                        size="small"
                        required
                    />
                    <IconButton
                        aria-label="remover opção"
                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                        color="error"
                        size="small"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}
            <Button
                startIcon={<AddIcon />}
                onClick={() => handleAddOption(qIndex)}
                size="small"
                sx={{ mt: 1 }}
            >
                Adicionar Opção
            </Button>
        </Box>
    );
};

export default QuestionOptions;
