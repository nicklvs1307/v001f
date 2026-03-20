import React, { Suspense, lazy } from 'react';
import { Box } from '@mui/material';

// Core Components (Loaded immediately)
import Header from './components/Header';
import HeroSection from './components/HeroSection';

// Lazy Loaded Sections for Performance
const ProblemSection = lazy(() => import('./components/ProblemSection'));
const FeesSection = lazy(() => import('./components/FeesSection'));
const CycleSection = lazy(() => import('./components/CycleSection'));
const CalculatorSection = lazy(() => import('./components/CalculatorSection'));
const FeaturesSection = lazy(() => import('./components/FeaturesSection'));
const TestimonialsSection = lazy(() => import('./components/TestimonialsSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));

const LandingPage = () => {
  return (
    <Box sx={{ backgroundColor: '#0D1B2A', minHeight: '100vh', overflowX: 'hidden' }}>
      <Header />
      <main>
        <HeroSection />
        
        <Suspense fallback={<Box sx={{ height: '600px', backgroundColor: '#0D1B2A' }} />}>
          <ProblemSection />
          <FeesSection />
          <CycleSection />
          <CalculatorSection />
          <FeaturesSection />
          <TestimonialsSection />
          <ContactSection />
        </Suspense>
      </main>
      
      <Suspense fallback={<Box sx={{ height: '300px', backgroundColor: '#0D1B2A' }} />}>
        <Footer />
      </Suspense>
    </Box>
  );
};

export default LandingPage;
