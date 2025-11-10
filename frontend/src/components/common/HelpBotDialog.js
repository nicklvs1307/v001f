import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import aiService from '../../services/aiService';

const HelpBotDialog = ({ open, handleClose }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Olá! Eu sou o assistente virtual. Como posso ajudar?' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const newUserMessage = { role: 'user', content: inputText };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map(msg => ({ role: msg.role === 'bot' ? 'assistant' : 'user', content: msg.content }));
      const botResponseContent = await aiService.getChatCompletion(apiMessages);
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'bot', content: botResponseContent },
      ]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'bot', content: 'Desculpe, não consegui obter uma resposta no momento. Tente novamente mais tarde.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null; // Don't render if not open

  return (
    <Paper
      elevation={5}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        zIndex: 1300, // Ensure it's above most content
      }}
    >
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Assistente Virtual</Typography>
        <IconButton onClick={handleClose} color="inherit" size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              mb: 1,
              display: 'flex',
              justifyContent: msg.role === 'bot' ? 'flex-start' : 'flex-end',
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                bgcolor: msg.role === 'bot' ? 'white' : 'primary.main',
                color: msg.role === 'bot' ? 'black' : 'white',
                maxWidth: '80%',
                borderRadius: msg.role === 'bot' ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              Digitando...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} /> {/* Element to scroll to */}
      </Box>
      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'grey.300', display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Digite sua pergunta..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          sx={{ mr: 1 }}
        />
        <Button onClick={handleSend} variant="contained" disabled={isLoading}>
          Enviar
        </Button>
      </Box>
    </Paper>
  );
};

export default HelpBotDialog;
