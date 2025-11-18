import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import PublicPageLayout from '../components/layout/PublicPageLayout';

const PrivacyPolicyPage = () => {
  return (
    <PublicPageLayout>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px' }}>
          <Typography variant="h2" component="h1" sx={{ mb: 4, fontWeight: 700 }}>
            Política de Privacidade
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              1. Introdução
            </Typography>
            <Typography variant="body1" paragraph>
              A sua privacidade é importante para nós. É política do Voltaki respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Voltaki, e outros sites que possuímos e operamos.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              2. Coleta de Dados
            </Typography>
            <Typography variant="body1" paragraph>
              Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
            </Typography>
            <Typography variant="body1" paragraph>
              Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              3. Uso de Cookies
            </Typography>
            <Typography variant="body1" paragraph>
              Nosso site pode usar cookies para melhorar a experiência do usuário. Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo. Eles nos ajudam a entender como você usa nosso site e a personalizar sua experiência.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              4. Links para Sites de Terceiros
            </Typography>
            <Typography variant="body1" paragraph>
              O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              5. Seus Direitos
            </Typography>
            <Typography variant="body1" paragraph>
              Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez не possamos fornecer alguns dos serviços desejados.
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Esta política é efetiva a partir de 18 de Novembro de 2025.
          </Typography>
        </Paper>
      </Container>
    </PublicPageLayout>
  );
};

export default PrivacyPolicyPage;
