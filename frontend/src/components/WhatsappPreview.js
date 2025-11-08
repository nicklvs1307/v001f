import React from 'react';
import { Box, Paper, Typography, Card, CardMedia } from '@mui/material';
import { styled } from '@mui/material/styles';

const PreviewContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#e5ddd5', // Fundo padrão do WhatsApp
  backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', // Textura do WhatsApp
  padding: theme.spacing(2),
  borderRadius: '8px',
  width: '100%',
  maxWidth: '360px', // Largura similar a de um celular
  margin: '0 auto',
  border: '1px solid #ccc',
}));

const MessageBubble = styled(Paper)(({ theme }) => ({
  backgroundColor: '#dcf8c6', // Verde claro para mensagem enviada
  padding: theme.spacing(1, 1.5),
  borderRadius: '12px 12px 0 12px', // Bordas arredondadas típicas
  maxWidth: '80%',
  marginLeft: 'auto', // Alinha à direita
  wordBreak: 'break-word',
  boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  textAlign: 'right',
  marginTop: theme.spacing(0.5),
}));

const WhatsappPreview = ({ message, imagePreview }) => {
  // Substitui variáveis por valores de exemplo
  const getSampleMessage = (msg) => {
    return msg
      .replace(/{{nome_cliente}}/g, 'Fulano')
      .replace(/{{codigo_premio}}/g, 'PRM-123XYZ')
      .replace(/{{data_validade}}/g, '31/12/2025')
      .replace(/{{nome_recompensa}}/g, 'Café Grátis')
      .replace(/{{nome_campanha}}/g, 'Campanha de Fim de Ano');
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <PreviewContainer>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <MessageBubble>
            {imagePreview && (
              <Card sx={{ mb: 1, borderRadius: '6px' }}>
                <CardMedia
                  component="img"
                  image={imagePreview}
                  alt="Preview da imagem da campanha"
                  sx={{ maxHeight: 150, objectFit: 'cover' }}
                />
              </Card>
            )}
            <Typography variant="body2" component="p">
              {getSampleMessage(message || '')}
            </Typography>
            <TimeStamp>
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </TimeStamp>
          </MessageBubble>
        </Box>
      </PreviewContainer>
    </Box>
  );
};

export default WhatsappPreview;
