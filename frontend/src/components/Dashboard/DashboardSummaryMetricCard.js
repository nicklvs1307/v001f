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
        <Paper elevation={0} sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            borderLeft: `4px solid ${color || theme.palette.primary.main}`,
            border: '1px solid #e2e8f0',
            borderLeftColor: color || theme.palette.primary.main,
            borderRadius: '12px',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            '&:hover': {
                transform: onClick ? 'translateY(-2px)' : 'none',
                boxShadow: onClick ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
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
