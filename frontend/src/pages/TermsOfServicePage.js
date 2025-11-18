import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import PublicPageLayout from '../components/layout/PublicPageLayout';

const TermsOfServicePage = () => {
  return (
    <PublicPageLayout>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px' }}>
          <Typography variant="h2" component="h1" sx={{ mb: 4, fontWeight: 700 }}>
            Termos de Serviço
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              1. Termos
            </Typography>
            <Typography variant="body1" paragraph>
              Ao acessar ao site Voltaki, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              2. Uso de Licença
            </Typography>
            <Typography variant="body1" paragraph>
              É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Voltaki, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
            </Typography>
            <ul>
              <li><Typography>modificar ou copiar os materiais;</Typography></li>
              <li><Typography>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</Typography></li>
              <li><Typography>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Voltaki;</Typography></li>
              <li><Typography>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</Typography></li>
              <li><Typography>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</Typography></li>
            </ul>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              3. Isenção de Responsabilidade
            </Typography>
            <Typography variant="body1" paragraph>
              Os materiais no site da Voltaki são fornecidos 'como estão'. A Voltaki não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              4. Limitações
            </Typography>
            <Typography variant="body1" paragraph>
              Em nenhum caso o Voltaki ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Voltaki, mesmo que Voltaki ou um representante autorizado da Voltaki tenha sido notificado oralmente ou por escrito da possibilidade de tais danos.
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Estes termos são efetivos a partir de 18 de Novembro de 2025.
          </Typography>
        </Paper>
      </Container>
    </PublicPageLayout>
  );
};

export default TermsOfServicePage;
