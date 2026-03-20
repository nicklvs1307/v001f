import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, Grid, Slider, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GlassCard from './GlassCard';

const CalculatorSection = () => {
  const [faturamento, setFaturamento] = useState(15000);
  const [investimento, setInvestimento] = useState(2000);
  const [taxa, setTaxa] = useState(20);
  const [reducao, setReducao] = useState(50);

  const stats = useMemo(() => {
    const economiaTaxas = faturamento * (taxa / 100);
    const economiaMarketing = investimento * (reducao / 100);
    const economiaTotal = economiaTaxas + economiaMarketing;
    const potencialAnual = economiaTotal * 12;

    return {
      economiaTaxas,
      economiaMarketing,
      economiaTotal,
      potencialAnual,
      chartData: [
        { name: 'Taxas', value: economiaTaxas, color: '#FF5722' },
        { name: 'Marketing', value: economiaMarketing, color: '#4A90E2' },
      ]
    };
  }, [faturamento, investimento, taxa, reducao]);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Box
      id="calculadora"
      sx={{
        py: { xs: 8, md: 15 },
        backgroundColor: '#0D1B2A',
        position: 'relative',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.2rem', md: '3.8rem' },
              mb: 3,
              lineHeight: 1.1
            }}
          >
            Veja quanto você <Box component="span" sx={{ color: '#FF5722', textShadow: '0 0 15px rgba(255, 87, 34, 0.4)' }}>deixa na mesa</Box> hoje!
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '800px', mx: 'auto', fontWeight: 400 }}>
            Simule sua economia potencial ao trazer o cliente para sua própria base e reduzir a dependência de aplicativos e tráfego pago constante.
          </Typography>
        </Box>

        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <GlassCard sx={{ p: 5, borderLeft: '6px solid #FF5722' }}>
              <Typography variant="h5" sx={{ mb: 5, fontWeight: 800, color: '#FF5722', display: 'flex', alignItems: 'center', gap: 2 }}>
                Configure seus Números
              </Typography>
              
              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Faturamento Mensal (Apps)</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#FF5722' }}>{formatCurrency(faturamento)}</Typography>
                </Box>
                <Slider
                  value={faturamento}
                  min={0}
                  max={500000}
                  step={5000}
                  onChange={(e, val) => setFaturamento(val)}
                  sx={{ color: '#FF5722' }}
                />
              </Box>

              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Investimento em Marketing</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#4A90E2' }}>{formatCurrency(investimento)}</Typography>
                </Box>
                <Slider
                  value={investimento}
                  min={0}
                  max={50000}
                  step={500}
                  onChange={(e, val) => setInvestimento(val)}
                  sx={{ color: '#4A90E2' }}
                />
              </Box>

              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Taxa Média dos Apps</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#FF5722' }}>{taxa}%</Typography>
                </Box>
                <Slider
                  value={taxa}
                  min={0}
                  max={35}
                  step={1}
                  onChange={(e, val) => setTaxa(val)}
                  sx={{ color: '#FF5722' }}
                />
              </Box>

              <Box sx={{ mb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Redução de Custo de Marketing</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#4A90E2' }}>{reducao}%</Typography>
                </Box>
                <Slider
                  value={reducao}
                  min={0}
                  max={100}
                  step={5}
                  onChange={(e, val) => setReducao(val)}
                  sx={{ color: '#4A90E2' }}
                />
              </Box>
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <GlassCard sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(255, 87, 34, 0.05)' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Economia Taxas</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>{formatCurrency(stats.economiaTaxas)}</Typography>
                  </GlassCard>
                </Grid>
                <Grid item xs={6}>
                  <GlassCard sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(74, 144, 226, 0.05)' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Economia Marketing</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>{formatCurrency(stats.economiaMarketing)}</Typography>
                  </GlassCard>
                </Grid>
              </Grid>

              <GlassCard sx={{ p: 5, textAlign: 'center', border: '2px solid #2A9D8F', backgroundColor: 'rgba(42, 157, 147, 0.05)' }}>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, fontWeight: 500 }}>Economia Total Mensal</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#2A9D8F', textShadow: '0 0 20px rgba(42, 157, 147, 0.3)' }}>{formatCurrency(stats.economiaTotal)}</Typography>
              </GlassCard>

              <GlassCard sx={{ p: 5, textAlign: 'center', backgroundColor: 'rgba(74, 144, 226, 0.1)', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, fontWeight: 500 }}>Potencial de Economia Anual</Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, color: '#4A90E2', textShadow: '0 0 30px rgba(74, 144, 226, 0.4)' }}>{formatCurrency(stats.potencialAnual)}</Typography>
              </GlassCard>

              <Box sx={{ height: 180, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#1a2a3a', border: 'none', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CalculatorSection;

