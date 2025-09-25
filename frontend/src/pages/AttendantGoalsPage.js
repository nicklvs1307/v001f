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

const AtendenteMetasPage = () => {
  const [atendentes, setAtendentes] = useState([]);
  const [metas, setMetas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

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
        atendenteId: atendenteId, // Garante que o atendenteId esteja presente
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
      await atendenteMetaService.createOrUpdateMeta(atendenteId, metaData);
      setSaveSuccess(true);
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
                <TableCell>Meta Respostas</TableCell>
                <TableCell>Meta Cadastros</TableCell>
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
                      <TextField
                        type="number"
                        size="small"
                        value={metas[atendente.id]?.responsesGoal || ''}
                        onChange={(e) => handleMetaChange(atendente.id, 'responsesGoal', e.target.value)}
                      />
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
                  <TableCell colSpan={5} align="center">Nenhum atendente encontrado.</TableCell>
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
