import React, { useState } from 'react';
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
import HelpBotDialog from './HelpBotDialog';

const actions = [
  { icon: <SupportAgentIcon />, name: 'Suporte' },
  { icon: <MonetizationOnIcon />, name: 'Financeiro' },
  { icon: <PointOfSaleIcon />, name: 'Vendas' },
  { icon: <ChatIcon />, name: 'Chat' },
];

const SupportSpeedDial = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openHelpBot, setOpenHelpBot] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenHelpBot = () => {
    setOpenHelpBot(true);
  };

  const handleCloseHelpBot = () => {
    setOpenHelpBot(false);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: theme.zIndex.speedDial,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <SpeedDial
        ariaLabel="Menu de Suporte"
        icon={<SpeedDialIcon icon={<HelpOutlineIcon />} />}
        direction="up"
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        FabProps={{
          sx: {
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            pointerEvents: 'auto',
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
              if (action.name === 'Chat') {
                handleOpenHelpBot();
              } else {
              }
              handleClose();
            }}
          />
        ))}
      </SpeedDial>
      <HelpBotDialog open={openHelpBot} handleClose={handleCloseHelpBot} />
    </Box>
  );
};

export default SupportSpeedDial;
