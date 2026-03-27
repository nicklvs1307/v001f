import React, { Suspense, lazy, Component } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

import Header from './components/Header';
import HeroSection from './components/HeroSection';

const ProblemSection = lazy(() => import('./components/ProblemSection'));
const FeesSection = lazy(() => import('./components/FeesSection'));
const CycleSection = lazy(() => import('./components/CycleSection'));
const CalculatorSection = lazy(() => import('./components/CalculatorSection'));
const FeaturesSection = lazy(() => import('./components/FeaturesSection'));
const TestimonialsSection = lazy(() => import('./components/TestimonialsSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LandingPage Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          backgroundColor: '#0D1B2A', 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          p: 4
        }}>
          <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Ops! Algo deu errado</Typography>
            <Typography sx={{ mb: 4, color: 'rgba(255,255,255,0.7)' }}>
              Desculpe pelo inconvenience. Tente novamente mais tarde.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ backgroundColor: '#FF5722' }}
            >
              Recarregar Página
            </Button>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

const SectionFallback = () => (
  <Box sx={{ height: '400px', backgroundColor: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box sx={{ 
      width: '50px', 
      height: '50px', 
      border: '3px solid rgba(255,87,34,0.3)', 
      borderTopColor: '#FF5722',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </Box>
);

const LandingPage = () => {
  return (
    <ErrorBoundary>
      <Box sx={{ backgroundColor: '#0D1B2A', minHeight: '100vh', overflowX: 'hidden' }}>
        <Header />
        <main>
          <HeroSection />
          
          <Suspense fallback={<SectionFallback />}>
            <ProblemSection />
            <FeesSection />
            <CycleSection />
            <CalculatorSection />
            <FeaturesSection />
            <TestimonialsSection />
            <ContactSection />
          </Suspense>
        </main>
        
        <Suspense fallback={<SectionFallback />}>
          <Footer />
        </Suspense>
      </Box>
    </ErrorBoundary>
  );
};

export default LandingPage;
