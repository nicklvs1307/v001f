import React from 'react';
import {
  Box,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  useTheme
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ChatIcon from '@mui/icons-material/Chat';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const actions = [
  { icon: <SupportAgentIcon />, name: 'Suporte' },
  { icon: <MonetizationOnIcon />, name: 'Financeiro' },
  { icon: <PointOfSaleIcon />, name: 'Vendas' },
  { icon: <ChatIcon />, name: 'Chat' },
];

const SupportSpeedDial = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: theme.zIndex.speedDial,
      }}
    >
      <SpeedDial
        ariaLabel="Menu de Suporte"
        icon={<SpeedDialIcon icon={<HelpOutlineIcon />} />}
        direction="up"
        FabProps={{
          sx: {
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          },
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => {
              // Lógica para cada ação pode ser adicionada aqui
              console.log(`${action.name} clicado`);
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default SupportSpeedDial;
