import React from 'react';
import { Box, Paper, Typography, Card, CardMedia } from '@mui/material';
import { styled } from '@mui/material/styles';

const PreviewContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#e5ddd5',
  backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
  padding: theme.spacing(2),
  borderRadius: '8px',
  width: '100%',
  maxWidth: '360px',
  margin: '0 auto',
  border: '1px solid #ccc',
}));

const MessageBubble = styled(Paper)(({ theme }) => ({
  backgroundColor: '#dcf8c6',
  padding: theme.spacing(1, 1.5),
  borderRadius: '12px 12px 0 12px',
  maxWidth: '80%',
  marginLeft: 'auto',
  wordBreak: 'break-word',
  boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  textAlign: 'right',
  marginTop: theme.spacing(0.5),
}));

const MessageContent = styled(Typography)({
  whiteSpace: 'pre-wrap', // Essencial para renderizar quebras de linha
});

const WhatsappPreview = ({ message, imagePreview }) => {
  const formatWhatsappText = (text) => {
    let formattedText = text;

    // Substitui variáveis por valores de exemplo
    formattedText = formattedText
      .replace(/{{nome_cliente}}/g, 'Fulano')
      .replace(/{{codigo_premio}}/g, 'PRM-123XYZ')
      .replace(/{{data_validade}}/g, '31/12/2025')
      .replace(/{{nome_recompensa}}/g, 'Café Grátis')
      .replace(/{{nome_campanha}}/g, 'Campanha de Fim de Ano');

    // Escapa HTML para segurança antes de aplicar formatação
    formattedText = formattedText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Aplica formatação (Negrito, Itálico, Riscado)
    // Negrito: *texto*
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    // Itálico: _texto_
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    // Riscado: ~texto~
    formattedText = formattedText.replace(/~(.*?)~/g, '<s>$1</s>');

    return formattedText;
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
            <MessageContent
              variant="body2"
              component="p"
              dangerouslySetInnerHTML={{ __html: formatWhatsappText(message || '') }}
            />
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
