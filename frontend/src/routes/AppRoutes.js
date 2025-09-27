import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import PublicSurveyPage from '../pages/PublicSurveyPage';
import ClientRegistrationPage from '../pages/ClientRegistrationPage';
import RoulettePage from '../pages/RoulettePage';
import CongratulationsPage from '../pages/CongratulationsPage';
import CupomValidationPage from '../pages/CupomValidationPage';
import ThankYouPage from '../pages/ThankYouPage';
import SurveyIdentifyPage from '../pages/SurveyIdentifyPage';
import ConfirmClientPage from '../pages/ConfirmClientPage';
import ClientIdentificationPage from '../pages/ClientIdentificationPage';

// Páginas
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const UsersPage = React.lazy(() => import('../pages/UsersPage'));
const RolesPage = React.lazy(() => import('../pages/RolesPage'));
const TenantsPage = React.lazy(() => import('../pages/TenantsPage'));
const SurveysPage = React.lazy(() => import('../pages/SurveysPage'));
const SurveyTemplatesPage = React.lazy(() => import('../pages/SurveyTemplatesPage'));
const QuestionsPage = React.lazy(() => import('../pages/QuestionsPage'));
const CriteriosPage = React.lazy(() => import('../pages/CriteriosPage'));
const RewardsPage = React.lazy(() => import('../pages/RewardsPage'));
const CouponsPage = React.lazy(() => import('../pages/CouponsPage'));
const CampaignsPage = React.lazy(() => import('../pages/CampaignsPage'));
const CampaignFormPage = React.lazy(() => import('../pages/CampaignFormPage'));
const ClientsPage = React.lazy(() => import('../pages/ClientsPage'));
const AttendantsPage = React.lazy(() => import('../pages/AttendantsPage'));
const AttendantGoalsPage = React.lazy(() => import('../pages/AttendantGoalsPage'));
const GMBConfigsPage = React.lazy(() => import('../pages/GMBConfigsPage'));
const GMBReviewsPage = React.lazy(() => import('../pages/GMBReviewsPage'));
const RoulettePrizesPage = React.lazy(() => import('../pages/RoulettePrizesPage'));
const RoletasPage = React.lazy(() => import('../pages/RoletasPage')); // Adicionar a nova página
const WhatsappConfigPage = React.lazy(() => import('../pages/WhatsappConfigPage'));
const WhatsappConnectPage = React.lazy(() => import('../pages/WhatsappConnectPage')); // Importar a nova página
const AtendenteDashboardPage = React.lazy(() => import('../pages/AtendenteDashboardPage'));
const CupomDashboardPage = React.lazy(() => import('../pages/CupomDashboardPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const SurveyCreatePage = React.lazy(() => import('../pages/SurveyCreatePage'));
const BirthdayClientsPage = React.lazy(() => import('../pages/BirthdayClientsPage'));
const ResultsOverviewPage = React.lazy(() => import('../pages/ResultsOverviewPage'));
const SurveyResultsPage = React.lazy(() => import('../pages/SurveyResultsPage'));
const ClientDashboardPage = React.lazy(() => import('../pages/ClientDashboardPage'));


const AppRoutes = () => {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pesquisa/:tenantId/:pesquisaId" element={<PublicSurveyPage />} />
        <Route path="/identificacao-pesquisa/:tenantId/:pesquisaId" element={<SurveyIdentifyPage />} />
        <Route path="/identificacao-cliente/:tenantId/:pesquisaId" element={<ClientIdentificationPage />} />
        <Route path="/confirmar-cliente/:surveyId" element={<ConfirmClientPage />} />
        <Route path="/cadastro-cliente/:tenantId/:pesquisaId" element={<ClientRegistrationPage />} />
        <Route path="/roleta/:tenantId/:pesquisaId/:clientId" element={<RoulettePage />} />
        <Route path="/parabens" element={<CongratulationsPage />} />
        <Route path="/validar-cupom/:cupomId" element={<CupomValidationPage />} />
        <Route path="/agradecimento" element={<ThankYouPage />} />

        {/* Rotas Privadas */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="cargos" element={<RolesPage />} />
            <Route path="locatarios" element={<TenantsPage />} />
            <Route path="pesquisas" element={<SurveysPage />} />
            <Route path="pesquisas/create" element={<SurveyCreatePage />} />
            <Route path="pesquisas/edit/:id" element={<SurveyCreatePage />} /> {/* Rota de Edição */}
            <Route path="pesquisas/results/:id" element={<SurveyResultsPage />} /> {/* Rota de Resultados */}
            <Route path="templates-pesquisa" element={<SurveyTemplatesPage />} />
            <Route path="perguntas" element={<QuestionsPage />} />
            <Route path="criterios" element={<CriteriosPage />} />
            <Route path="recompensas" element={<RewardsPage />} />
            <Route path="cupons" element={<CouponsPage />} />
            <Route path="cupons/campanhas" element={<CampaignsPage />} />
            <Route path="cupons/campanhas/nova" element={<CampaignFormPage />} />
            <Route path="cupons/dashboard" element={<CupomDashboardPage />} />
            <Route path="validar-cupom" element={<CupomValidationPage />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="clientes/birthdays" element={<BirthdayClientsPage />} />
            <Route path="clientes/dashboard" element={<ClientDashboardPage />} />
            <Route path="atendentes" element={<AttendantsPage />} />
            <Route path="metas-atendentes" element={<AttendantGoalsPage />} />
            <Route path="atendentes-dashboard" element={<AtendenteDashboardPage />} />
            <Route path="resultados" element={<ResultsOverviewPage />} />
            <Route path="reputacao" element={<GMBReviewsPage />} />
            <Route path="config-gmb" element={<GMBConfigsPage />} />
            <Route path="reviews-gmb" element={<GMBReviewsPage />} />
            <Route path="roletas" element={<RoletasPage />} />
            <Route path="roletas/:roletaId/premios" element={<RoulettePrizesPage />} />
            <Route path="config-whatsapp" element={<WhatsappConfigPage />} />
            <Route path="whatsapp-connect" element={<WhatsappConnectPage />} /> {/* Adicionar a nova rota */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="config" element={<GMBConfigsPage />} />
          </Route>
        </Route>

        {/* Catch-all para rotas não encontradas */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
