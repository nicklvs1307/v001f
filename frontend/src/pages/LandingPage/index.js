import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, Grid, Paper, 
  TextField, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  FaPoll, FaChartLine, FaGift, FaBullhorn, FaTachometerAlt, FaDice, 
  FaCheck, FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp 
} from 'react-icons/fa';
import MenuIcon from '@mui/icons-material/Menu';

// Componente do Cabeçalho
const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const navLinks = [
    { text: 'Funcionalidades', href: '#funcionalidades' },
    { text: 'Depoimentos', href: '#depoimentos' },
    { text: 'Preços', href: '#precos' },
    { text: 'Contato', href: '#contato' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.text} disablePadding>
            <ListItemButton component="a" href={link.href}>
              <ListItemText primary={link.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(10px)', 
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.17)',
        color: 'text.primary'
      }}
    >
      <Container>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <img src="/logo.png" alt="Feedeliza Logo" style={{ height: '45px' }} />
          
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {navLinks.map(link => (
              <Button key={link.text} color="inherit" href={link.href} sx={{ fontWeight: 600 }}>{link.text}</Button>
            ))}
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Button component={Link} to="/login" variant="contained" color="primary" sx={{ borderRadius: '50px', fontWeight: 700, px: 3 }}>
              Login
            </Button>
          </Box>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={toggleDrawer(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

        </Toolbar>
      </Container>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

// Componente da Seção Herói
const HeroSection = () => (
  <Box sx={{ 
    pt: { xs: 20, md: 28 }, 
    pb: { xs: 15, md: 20 }, 
    backgroundColor: 'background.default',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <Box sx={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: { xs: '100%', md: '55%' },
      height: '100%',
      backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1740&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderBottomLeftRadius: { md: '100px' },
      opacity: { xs: 0.2, md: 1}
    }} />
    <Container sx={{ position: 'relative', zIndex: 1 }}>
      <Grid container alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              letterSpacing: '-0.02em', 
              background: 'linear-gradient(135deg, #327DFA, #FA4D32)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4rem' }
            }}
          >
            Transforme Clientes em Fãs e Venda Mais Todos os Dias
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ my: { xs: 3, md: 4 }, maxWidth: { xs: '100%', md: '90%' } }}>
            Com o Feedeliza, você cria um programa de fidelidade e pesquisas de satisfação em minutos, aumenta a recorrência e transforma seu restaurante em um sucesso.
          </Typography>
          <Button component="a" href="#funcionalidades" variant="outlined" color="primary" size="large" sx={{ borderRadius: '50px', fontWeight: 700, px: 4, py: 1.5 }}>
            Descubra Como
          </Button>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const features = [
  { icon: <FaPoll />, title: 'Pesquisas de Satisfação', description: 'Crie pesquisas personalizadas e descubra o que seus clientes realmente pensam.' },
  { icon: <FaChartLine />, title: 'Net Promoter Score (NPS)', description: 'Meça a lealdade dos seus clientes e identifique promotores e detratores da sua marca.' },
  { icon: <FaGift />, title: 'Recompensas e Cupons', description: 'Incentive seus clientes a voltarem sempre com um programa de fidelidade atrativo.' },
  { icon: <FaBullhorn />, title: 'Campanhas de Marketing', description: 'Envie campanhas por WhatsApp para seus clientes, divulgando promoções e novidades.' },
  { icon: <FaTachometerAlt />, title: 'Dashboard de Resultados', description: 'Acompanhe em tempo real as métricas mais importantes do seu negócio.' },
  { icon: <FaDice />, title: 'Gamificação com Roleta', description: 'Engaje seus clientes com uma roleta de prêmios e torne a experiência divertida.' },
];

// Componente da Seção de Funcionalidades
const FeaturesSection = () => (
  <Box id="funcionalidades" sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
    <Container>
      <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, fontWeight: 700, fontSize: { xs: '2.2rem', md: '3rem' } }}>
        Funcionalidades Poderosas para o seu Restaurante
      </Typography>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: '16px', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }, height: '100%' }}>
              <Box sx={{ color: 'primary.main', fontSize: '3rem', mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>{feature.title}</Typography>
              <Typography color="text.secondary">{feature.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// Seção de Depoimentos
const testimonials = [
  {
    text: 'O Feedeliza mudou a forma como nos relacionamos com nossos clientes. A recorrência aumentou 30% em apenas 3 meses!',
    author: 'João Silva',
    role: 'Dono da Pizzaria do João',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
  },
  {
    text: 'Finalmente consigo saber o que meus clientes pensam de verdade. O feedback tem sido fundamental para melhorar nosso serviço.',
    author: 'Maria Oliveira',
    role: 'Gerente do Hamburgueria Top',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&q=80'
  },
  {
    text: 'A roleta de prêmios é um sucesso! Os clientes adoram e sempre voltam para tentar a sorte. Recomendo!',
    author: 'Carlos Pereira',
    role: 'Proprietário do Restaurante Sabor & Cia',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
  },
];

const TestimonialsSection = () => (
  <Box id="depoimentos" sx={{ py: { xs: 8, md: 12 } }}>
    <Container>
      <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, fontWeight: 700, fontSize: { xs: '2.2rem', md: '3rem' } }}>
        O que nossos clientes dizem
      </Typography>
      <Grid container spacing={4}>
        {testimonials.map((testimonial, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2, flexGrow: 1 }}>"{testimonial.text}"</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img src={testimonial.avatar} alt={testimonial.author} style={{ width: 60, height: 60, borderRadius: '50%', marginRight: '15px' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{testimonial.author}</Typography>
                  <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// Seção de Preços
const pricingTiers = [
    { title: 'Básico', price: '99', description: 'Ideal para pequenos estabelecimentos', features: ['Pesquisas de Satisfação', 'Dashboard Básico', 'Até 500 clientes'], buttonText: 'Comece Agora', variant: 'outlined' },
    { title: 'Pro', price: '199', description: 'Perfeito para restaurantes em crescimento', features: ['Tudo do plano Básico', 'Recompensas e Cupons', 'Campanhas de Marketing', 'Até 2.000 clientes'], buttonText: 'Comece Agora', variant: 'contained', recommended: true },
    { title: 'Premium', price: '299', description: 'Para estabelecimentos de alto desempenho', features: ['Tudo do plano Pro', 'Gamificação com Roleta', 'Integração com WhatsApp', 'Clientes ilimitados', 'Suporte prioritário'], buttonText: 'Comece Agora', variant: 'outlined' },
];

const PricingSection = () => (
  <Box id="precos" sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
    <Container>
      <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, fontWeight: 700, fontSize: { xs: '2.2rem', md: '3rem' } }}>Planos e Preços</Typography>
      <Grid container spacing={4} alignItems="flex-end">
        {pricingTiers.map((tier) => (
          <Grid item key={tier.title} xs={12} md={4}>
            <Paper elevation={tier.recommended ? 8 : 3} sx={{ p: 4, borderRadius: '16px', border: tier.recommended ? '2px solid' : 'none', borderColor: 'primary.main', transform: tier.recommended ? 'scale(1.05)' : 'none', transition: 'all 0.3s' }}>
              {tier.recommended && <Typography sx={{ background: 'primary.main', color: 'white', p: '4px 8px', borderRadius: '8px', display: 'inline-block', mb: 2, fontSize: '0.8rem', fontWeight: 'bold' }}>MAIS POPULAR</Typography>}
              <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>{tier.title}</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>{tier.description}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', my: 2 }}>
                <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>R${tier.price}</Typography>
                <Typography variant="h6" color="text.secondary">/mês</Typography>
              </Box>
              <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0' }}>
                {tier.features.map((feature) => (
                  <Typography component="li" key={feature} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <FaCheck style={{ color: '#C3FA32', marginRight: '8px' }} /> {feature}
                  </Typography>
                ))}
              </ul>
              <Button fullWidth variant={tier.variant} color="primary" size="large">{tier.buttonText}</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// Seção de Contato
const ContactSection = () => (
  <Box id="contato" sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, #FA4D32 0%, #327DFA 100%)', color: 'white' }}>
    <Container>
      <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, fontWeight: 700, fontSize: { xs: '2.2rem', md: '3rem' } }}>Entre em Contato</Typography>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Ficou com alguma dúvida?</Typography>
          <Typography sx={{ my: 2, color: 'rgba(255, 255, 255, 0.8)' }}>Preencha o formulário ao lado e nossa equipe entrará em contato o mais breve possível para uma demonstração completa da plataforma.</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', background: 'rgba(255,255,255,0.9)' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Nome" variant="filled" /></Grid>
              <Grid item xs={12}><TextField fullWidth label="E-mail" variant="filled" /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Telefone" variant="filled" /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Mensagem" multiline rows={4} variant="filled" /></Grid>
              <Grid item xs={12}><Button fullWidth variant="contained" color="primary" size="large">Enviar Mensagem</Button></Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

// Rodapé
const Footer = () => (
  <Box sx={{ backgroundColor: 'grey.900', color: 'white', py: { xs: 6, md: 8 } }}>
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <img src="/logo.png" alt="Feedeliza Logo" style={{ height: '40px', marginBottom: '20px', filter: 'brightness(0) invert(1)' }} />
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>A solução premium para restaurantes que desejam transformar clientes em fãs e aumentar suas vendas.</Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>Links</Typography>
          <Link href="#funcionalidades" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: 'white' } }}>Funcionalidades</Link>
          <Link href="#depoimentos" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: 'white' } }}>Depoimentos</Link>
          <Link href="#precos" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: 'white' } }}>Preços</Link>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>Legal</Typography>
          <Link href="#" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: 'white' } }}>Termos de Uso</Link>
          <Link href="#" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: 'white' } }}>Política de Privacidade</Link>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>Social</Typography>
          <IconButton href="#" sx={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)', mr: 1, '&:hover': { backgroundColor: 'primary.main' } }}><FaFacebookF /></IconButton>
          <IconButton href="#" sx={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)', mr: 1, '&:hover': { backgroundColor: 'primary.main' } }}><FaInstagram /></IconButton>
          <IconButton href="#" sx={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)', mr: 1, '&:hover': { backgroundColor: 'primary.main' } }}><FaLinkedinIn /></IconButton>
          <IconButton href="#" sx={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)', '&:hover': { backgroundColor: 'primary.main' } }}><FaWhatsapp /></IconButton>
        </Grid>
      </Grid>
      <Typography sx={{ textAlign: 'center', mt: { xs: 4, md: 6 }, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} Feedeliza. Todos os direitos reservados.</Typography>
    </Container>
  </Box>
);

const LandingPage = () => {
  return (
    <Box>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <ContactSection />
      </main>
      <Footer />
    </Box>
  );
};

export default LandingPage;
