import React, { useState, useContext } from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import AuthContext from '../../context/AuthContext';
import automationService from '../../services/automationService';

const AutomationTester = ({ automationType, onTestSent }) => {
  const { user } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendTest = async () => {
    if (!phoneNumber) {
      onTestSent({ success: false, message: 'Por favor, insira um número de telefone.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tenantId: user.tenantId, // Pega o tenantId do usuário logado
        phoneNumber: phoneNumber,
      };

      let response;
      switch (automationType) {
        case 'daily-report':
          response = await automationService.testDailyReport(payload);
          break;
        case 'birthday':
          response = await automationService.testBirthday(payload);
          break;
        case 'coupon-reminder':
          response = await automationService.testCouponReminder(payload);
          break;
        case 'roleta-prize':
          response = await automationService.testRoletaPrize(payload);
          break;
        default:
          throw new Error('Tipo de automação desconhecido.');
      }
      onTestSent({ success: true, message: response.data.message || 'Mensagem de teste enviada com sucesso!' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Falha ao enviar mensagem de teste.';
      onTestSent({ success: false, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
      <TextField
        label="Número para Teste (com DDI+DDD)"
        variant="outlined"
        size="small"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Ex: 5511999998888"
        sx={{ flexGrow: 1 }}
      />
      <Button
        variant="outlined"
        onClick={handleSendTest}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Enviando...' : 'Enviar Teste'}
      </Button>
    </Box>
  );
};

export default AutomationTester;
