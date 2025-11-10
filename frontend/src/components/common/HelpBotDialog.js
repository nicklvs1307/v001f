import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
} from '@mui/material';

const HelpBotDialog = ({ open, handleClose }) => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Olá! Eu sou o assistente virtual. Como posso ajudar?' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessages = [...messages, { from: 'user', text: inputText }];
    // Simulate a bot response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        { from: 'bot', text: 'Obrigado por sua pergunta. Estou aprendendo e em breve poderei ajudar com mais informações.' },
      ]);
    }, 500);

    setInputText('');
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Assistente Virtual de Ajuda</DialogTitle>
      <DialogContent>
        <Paper
          elevation={0}
          sx={{
            height: 400,
            overflowY: 'auto',
            p: 2,
            mb: 2,
            bgcolor: 'grey.100',
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                mb: 1,
                display: 'flex',
                justifyContent: msg.from === 'bot' ? 'flex-start' : 'flex-end',
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  bgcolor: msg.from === 'bot' ? 'white' : 'primary.main',
                  color: msg.from === 'bot' ? 'black' : 'white',
                  maxWidth: '80%',
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Paper>
            </Box>
          ))}
        </Paper>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Digite sua pergunta..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fechar</Button>
        <Button onClick={handleSend} variant="contained">
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpBotDialog;
