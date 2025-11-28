import React from 'react';
import {
    Typography,
    Box,
    Paper,
    useTheme
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const MetricCard = ({ title, value, percentage, arrow, color, children, onClick }) => {
    const theme = useTheme();

    return (
        <Paper elevation={2} sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            borderLeft: `4px solid ${color || theme.palette.primary.main}`,
            backgroundColor: 'white',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
                transform: onClick ? 'scale(1.02)' : 'none',
                boxShadow: onClick ? theme.shadows[4] : theme.shadows[2],
            }
        }}
        onClick={onClick}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
                    {title}
                </Typography>
                {children}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Typography variant="h6" component="div" fontWeight="bold">
                    {value} {arrow === 'up' && <ArrowUpwardIcon color="success" fontSize="small" />}
                    {arrow === 'down' && <ArrowDownwardIcon color="error" fontSize="small" />}
                </Typography>
                {percentage && (
                    <Typography variant="body2" color="text.secondary">
                        {percentage}%
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default MetricCard;
