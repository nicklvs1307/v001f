import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  TextField,
} from '@mui/material';
import atendenteService from '../services/atendenteService';
import atendenteMetaService from '../services/atendenteMetaService';
import recompensaService from '../services/recompensaService'; // Importar recompensaService
import {
  FormControl, // Adicionar FormControl
  InputLabel,   // Adicionar InputLabel
  Select,      // Adicionar Select
  MenuItem,    // Adicionar MenuItem
} from '@mui/material'; // Adicionar componentes de formulário

const AtendenteMetasPage = () => {
  const [atendentes, setAtendentes] = useState([]);
  const [metas, setMetas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [recompensas, setRecompensas] = useState([]); // Novo estado para recompensas

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const fetchedAtendentes = await atendenteService.getAllAtendentes();
        setAtendentes(fetchedAtendentes);

        const fetchedMetas = await atendenteMetaService.getAllMetasByTenant();
        const metasMap = fetchedMetas.reduce((acc, meta) => {
          acc[meta.atendenteId] = meta;
          return acc;
        }, {});
        setMetas(metasMap);

        // Buscar recompensas
        const fetchedRecompensas = await recompensaService.getAll();
        setRecompensas(fetchedRecompensas);

      } catch (err) {
        setError(err.message || 'Falha ao carregar dados de atendentes e metas.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMetaChange = (atendenteId, field, value) => {
    setMetas((prevMetas) => ({
      ...prevMetas,
      [atendenteId]: {
        ...prevMetas[atendenteId],
        atendenteId: atendenteId,
        [field]: value,
      },
    }));
  };

  const handleSaveMeta = async (atendenteId) => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const metaData = metas[atendenteId];
      if (!metaData || (!metaData.npsGoal && !metaData.responsesGoal && !metaData.registrationsGoal)) {
        throw new Error("Preencha ao menos uma meta para salvar.");
      }
      // Certificar que recompensaId é null se for uma string vazia
      if (metaData.recompensaId === '') {
        metaData.recompensaId = null;
      }
      await atendenteMetaService.createOrUpdateMeta(atendenteId, metaData);
      setSaveSuccess(true);
      // Após salvar, buscar as metas novamente para garantir que os dados de recompensa e período estão atualizados
      const fetchedMetas = await atendenteMetaService.getAllMetasByTenant();
      const metasMap = fetchedMetas.reduce((acc, meta) => {
        acc[meta.atendenteId] = meta;
        return acc;
      }, {});
      setMetas(metasMap);
    } catch (err) {
      setSaveError(err.message || 'Erro ao salvar meta.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando metas de atendentes...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Metas de Atendentes
      </Typography>

      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
      {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Meta salva com sucesso!</Alert>}

      <Paper elevation={2} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Atendente</TableCell>
                <TableCell>Meta NPS</TableCell>
                <TableCell>Prêmio NPS</TableCell>
                <TableCell>Meta Respostas</TableCell>
                <TableCell>Prêmio Respostas</TableCell>
                <TableCell>Meta Cadastros</TableCell>
                <TableCell>Prêmio Cadastros</TableCell>
                <TableCell>Período de Apuração</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {atendentes.length > 0 ? (
                atendentes.map((atendente) => (
                  <TableRow key={atendente.id}>
                    <TableCell>{atendente.name}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={metas[atendente.id]?.npsGoal || ''}
                        onChange={(e) => handleMetaChange(atendente.id, 'npsGoal', e.target.value)}
                        inputProps={{ step: "0.01" }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Prêmio</InputLabel>
                        <Select
                          value={metas[atendente.id]?.recompensaId || ''}
                          label="Prêmio"
                          onChange={(e) => handleMetaChange(atendente.id, 'recompensaId', e.target.value)}
                        >
                          <MenuItem value="">Nenhum</MenuItem>
                          {recompensas.map((r) => (
                            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={metas[atendente.id]?.responsesGoal || ''}
                        onChange={(e) => handleMetaChange(atendente.id, 'responsesGoal', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Prêmio</InputLabel>
                        <Select
                          value={metas[atendente.id]?.recompensaId || ''} // Usando o mesmo recompensaId para todas as metas por simplicidade
                          label="Prêmio"
                          onChange={(e) => handleMetaChange(atendente.id, 'recompensaId', e.target.value)}
                        >
                          <MenuItem value="">Nenhum</MenuItem>
                          {recompensas.map((r) => (
                            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={metas[atendente.id]?.registrationsGoal || ''}
                        onChange={(e) => handleMetaChange(atendente.id, 'registrationsGoal', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Prêmio</InputLabel>
                        <Select
                          value={metas[atendente.id]?.recompensaId || ''} // Usando o mesmo recompensaId para todas as metas por simplicidade
                          label="Prêmio"
                          onChange={(e) => handleMetaChange(atendente.id, 'recompensaId', e.target.value)}
                        >
                          <MenuItem value="">Nenhum</MenuItem>
                          {recompensas.map((r) => (
                            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Período</InputLabel>
                        <Select
                          value={metas[atendente.id]?.period || 'MENSAL'}
                          label="Período"
                          onChange={(e) => handleMetaChange(atendente.id, 'period', e.target.value)}
                        >
                          <MenuItem value="DIARIO">Diário</MenuItem>
                          <MenuItem value="SEMANAL">Semanal</MenuItem>
                          <MenuItem value="MENSAL">Mensal</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSaveMeta(atendente.id)}
                        disabled={saving}
                      >
                        {saving ? <CircularProgress size={20} /> : 'Salvar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">Nenhum atendente encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AtendenteMetasPage;
