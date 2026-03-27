import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FaShieldAlt } from 'react-icons/fa';
import GlassCard from './GlassCard';

const chartData = [
  { name: 'Taxas de Plataforma', value: 26, color: '#FF5722' },
  { name: 'Marketing', value: 8, color: '#4A90E2' },
  { name: 'Custo Operacional', value: 60, color: '#5A6A7B' },
  { name: 'Seu Lucro Líquido', value: 6, color: '#2A9D8F' },
];

const FeesSection = () => {
  const data = useMemo(() => chartData, []);
  return (
    <Box
      id="taxas"
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
            O <Box component="span" sx={{ color: '#FF5722', textShadow: '0 0 15px rgba(255, 87, 34, 0.4)' }}>Sócio Oculto</Box> que Leva seu Lucro
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '800px', mx: 'auto' }}>
            A cada venda realizada por aplicativos, uma fatia gigante da sua margem desaparece antes mesmo de chegar ao seu bolso.
          </Typography>
        </Box>

        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 450, width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={110}
                    outerRadius={150}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="rgba(0,0,0,0.5)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2a3a', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '15px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" sx={{ color: '#2A9D8F', fontWeight: 600, fontSize: '1.2rem', mb: 0 }}>Seu Lucro</Typography>
                <Typography variant="h2" sx={{ color: '#2A9D8F', fontWeight: 900, textShadow: '0 0 20px rgba(42, 157, 143, 0.4)' }}>6%</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <GlassCard sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3, borderLeft: '5px solid #FF5722' }}>
                <Box sx={{ fontSize: '3rem', color: '#FF5722', fontWeight: 900 }}>26%</Box>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', fontWeight: 500 }}>
                  É a média de taxas e comissões que intermediários levam de cada transação sua.
                </Typography>
              </GlassCard>

              <GlassCard sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3, borderLeft: '5px solid #4A90E2' }}>
                <Box sx={{ fontSize: '3rem', color: '#4A90E2', fontWeight: 900 }}>+12%</Box>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', fontWeight: 500 }}>
                  Aumento projetado no custo de anúncios para 2026. Ficando cada vez mais caro atrair o mesmo cliente.
                </Typography>
              </GlassCard>

              <GlassCard sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3, borderLeft: '5px solid #feca57' }}>
                <Box sx={{ fontSize: '2.5rem', color: '#feca57' }}>
                  <FaShieldAlt />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>Propriedade dos Dados</Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
                    Hoje, os dados dos seus clientes pertencem às plataformas. Sem o Voltaki, você não tem uma base, você tem um aluguel.
                  </Typography>
                </Box>
              </GlassCard>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Pointy Shape Divider */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          width: '100%',
          lineHeight: 0,
          zIndex: 2,
          '& svg': {
            display: 'block',
            width: 'calc(100% + 1.3px)',
            height: '100px',
          },
          '& path': {
            fill: '#1a2a3a',
          }
        }}
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,256L80,240C160,224,320,192,480,197.3C640,203,800,245,960,250.7C1120,256,1280,224,1360,208L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </Box>
    </Box>
  );
};

export default FeesSection;

