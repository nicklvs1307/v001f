import React from 'react';
import { Box } from '@mui/material';

const GlassCard = ({ children, sx = {}, ...props }) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        borderRadius: '30px',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '30px',
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none'
        },
        '&:hover': {
          transform: 'translateY(-12px)',
          boxShadow: '0 20px 60px rgba(255, 87, 34, 0.15)',
          borderColor: 'rgba(255, 87, 34, 0.3)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassCard;

