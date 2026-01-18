import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import SuperAdminLayout from '../components/layout/SuperAdminLayout'; // Importar SuperAdminLayout
import FranchisorLayout from '../components/layout/FranchisorLayout'; // Importar FranchisorLayout
import PublicLayout from '../components/layout/PublicLayout';
import LoginPage from '../pages/LoginPage';
import LandingPage from '../pages/LandingPage';
import PublicSurveyPage from '../pages/PublicSurveyPage';
import ClientRegistrationPage from '../pages/ClientRegistrationPage';
import RoulettePage from '../pages/RoulettePage';
import CongratulationsPage from '../pages/CongratulationsPage';
import CupomValidationPage from '../pages/CupomValidationPage';
import ThankYouPage from '../pages/ThankYouPage';
import SurveyIdentifyPage from '../pages/SurveyIdentifyPage';
import ConfirmClientPage from '../pages/ConfirmClientPage';
import ClientIdentificationPage from '../pages/ClientIdentificationPage';
import RoletaSpinPage from '../pages/RoletaSpinPage';
import NoPrizePage from '../pages/NoPrizePage'; // Adicionar esta linha
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import CompanyProfilePage from '../pages/CompanyProfilePage';
import ReputationPage from '../pages/ReputationPage';
const TermsOfServicePage = React.lazy(() => import('../pages/TermsOfServicePage'));
const IntegrationsPage = React.lazy(() => import('../pages/IntegrationsPage')); // Adicionando a nova página

// Páginas
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const UsersPage = React.lazy(() => import('../pages/UsersPage'));
const UserFormPage = React.lazy(() => import('../pages/UserFormPage'));
const RolesPage = React.lazy(() => import('../pages/RolesPage'));
const TenantsPage = React.lazy(() => import('../pages/TenantsPage'));
const TenantFormPage = React.lazy(() => import('../pages/TenantFormPage'));
const SurveysPage = React.lazy(() => import('../pages/SurveysPage'));
const SurveyTemplatesPage = React.lazy(() => import('../pages/SurveyTemplatesPage'));
const QuestionsPage = React.lazy(() => import('../pages/QuestionsPage'));
const CriteriosPage = React.lazy(() => import('../pages/CriteriosPage'));
const RewardsPage = React.lazy(() => import('../pages/RewardsPage'));
const RewardsDashboardPage = React.lazy(() => import('../pages/RewardsDashboardPage'));
const CouponsPage = React.lazy(() => import('../pages/CouponsPage'));
const CampaignsPage = React.lazy(() => import('../pages/CampaignsPage'));
const CampaignFormPage = React.lazy(() => import('../pages/CampaignFormPage'));
const CampaignDetailsPage = React.lazy(() => import('../pages/CampaignDetailsPage'));
const ClientsPage = React.lazy(() => import('../pages/ClientsPage'));
const AttendantsPage = React.lazy(() => import('../pages/AttendantsPage'));
const AttendantGoalsPage = React.lazy(() => import('../pages/AttendantGoalsPage'));
const AttendantGoalDetailsPage = React.lazy(() => import('../pages/AttendantGoalDetailsPage')); // Nova página
const RoletasPage = React.lazy(() => import('../pages/RoletasPage'));
const RoletaFormPage = React.lazy(() => import('../pages/RoletaFormPage'));
const WhatsappConfigPage = React.lazy(() => import('../pages/WhatsappConfigPage'));
const WhatsappConnectPage = React.lazy(() => import('../pages/WhatsappConnectPage'));
const AtendenteDashboardPage = React.lazy(() => import('../pages/AtendenteDashboardPage'));
const CupomDashboardPage = React.lazy(() => import('../pages/CupomDashboardPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const SurveyCreatePage = React.lazy(() => import('../pages/SurveyCreatePage'));
const BirthdayClientsPage = React.lazy(() => import('../pages/BirthdayClientsPage'));
const ResultsOverviewPage = React.lazy(() => import('../pages/ResultsOverviewPage'));
const SurveyResultsPage = React.lazy(() => import('../pages/SurveyResultsPage'));
const ClientDashboardPage = React.lazy(() => import('../pages/ClientDashboardPage'));
const ClientDetailsPage = React.lazy(() => import('../pages/ClientDetailsPage'));
const AutomationsPage = React.lazy(() => import('../pages/AutomationsPage'));
const RelatorioDiario = React.lazy(() => import('../pages/Relatorios/Diario'));
const RelatorioSemanal = React.lazy(() => import('../pages/Relatorios/Semanal'));
const RelatorioMensal = React.lazy(() => import('../pages/Relatorios/Mensal'));

const SatisfacaoPage = React.lazy(() => import('../pages/Geral/SatisfacaoPage'));
const ResumoMesPage = React.lazy(() => import('../pages/Geral/ResumoMesPage'));
const ComparativoPesquisaPage = React.lazy(() => import('../pages/Geral/ComparativoPesquisaPage'));
const EvolucaoPage = React.lazy(() => import('../pages/Geral/EvolucaoPage'));
const BenchmarkingPage = React.lazy(() => import('../pages/Geral/BenchmarkingPage'));
const NuvemDePalavrasPage = React.lazy(() => import('../pages/Geral/NuvemDePalavrasPage'));
const PremiacaoHistoricoPage = React.lazy(() => import('../pages/PremiacaoHistoricoPage')); // Novo componente

const SenderPoolPage = React.lazy(() => import('../pages/SenderPoolPage'));
const SenderConnectPage = React.lazy(() => import('../pages/SenderConnectPage'));
const SystemReportsPage = React.lazy(() => import('../pages/SystemReportsPage'));
const TenantReportsPage = React.lazy(() => import('../pages/TenantReportsPage'));
const SuperAdminDashboardPage = React.lazy(() => import('../pages/SuperAdminDashboardPage'));
const FranchisorsPage = React.lazy(() => import('../pages/FranchisorsPage'));
const FranchisorFormPage = React.lazy(() => import('../pages/FranchisorFormPage'));
const FranchisorDashboardPage = React.lazy(() => import('../pages/FranchisorDashboardPage'));
const FranchiseesPage = React.lazy(() => import('../pages/FranchiseesPage'));
const FranchisorUsersPage = React.lazy(() => import('../pages/FranchisorUsersPage'));
const FranchisorUserFormPage = React.lazy(() => import('../pages/FranchisorUserFormPage'));
const FranchisorTenantFormPage = React.lazy(() => import('../pages/FranchisorTenantFormPage'));
const FranchisorReportsPage = React.lazy(() => import('../pages/FranchisorReportsPage'));

const RespostasPainelPage = React.lazy(() => import('../pages/Respostas/PainelPage'));
const RespostasGestaoPage = React.lazy(() => import('../pages/Respostas/GestaoPage'));
const RespostasReplicasPage = React.lazy(() => import('../pages/Respostas/ReplicasPage'));
const RespostasTratativasPage = React.lazy(() => import('../pages/Respostas/TratativasPage'));


const AppRoutes = () => {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/termos-de-servico" element={<TermsOfServicePage />} />
        <Route path="/pesquisa/:tenantId/:pesquisaId" element={<PublicSurveyPage />} />
        <Route path="/identificacao-pesquisa/:tenantId/:pesquisaId" element={<SurveyIdentifyPage />} />
        <Route path="/identificacao-cliente/:tenantId/:pesquisaId" element={<ClientIdentificationPage />} />
        <Route path="/confirmar-cliente/:surveyId" element={<ConfirmClientPage />} />
        <Route path="/cadastro-cliente/:tenantId/:pesquisaId" element={<ClientRegistrationPage />} />
        <Route path="/roleta/:tenantId/:pesquisaId/:clientId" element={<PublicLayout><RoulettePage /></PublicLayout>} />
        <Route path="/parabens" element={<CongratulationsPage />} />
        <Route path="/nao-ganhou" element={<NoPrizePage />} /> {/* Adicionar esta linha */}
        <Route path="/validar-cupom/:cupomId" element={<CupomValidationPage />} />
        <Route path="/agradecimento" element={<ThankYouPage />} />
        <Route path="/roleta/spin/:token" element={<RoletaSpinPage />} />

        {/* Rotas Privadas */}

          <Route element={<PrivateRoute />}>
            {/* Painel do Super Admin */}
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboardPage />} />
              <Route path="dashboard" element={<SuperAdminDashboardPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="tenants/new" element={<TenantFormPage />} />
              <Route path="tenants/edit/:id" element={<TenantFormPage />} />
              <Route path="franchisors" element={<FranchisorsPage />} />
              <Route path="franchisors/new" element={<FranchisorFormPage />} />
              <Route path="franchisors/edit/:id" element={<FranchisorFormPage />} />
              <Route path="whatsapp-config" element={<WhatsappConfigPage />} />
              <Route path="sender-pool" element={<SenderPoolPage />} />
              <Route path="senders/:id/connect" element={<SenderConnectPage />} />
              <Route path="reports/system-overview" element={<SystemReportsPage />} />
              <Route path="reports/tenant-reports" element={<TenantReportsPage />} />
            </Route>

            {/* Painel do Franqueador */}
            <Route path="/franchisor" element={<FranchisorLayout />}>
              <Route index element={<FranchisorDashboardPage />} />
              <Route path="dashboard" element={<FranchisorDashboardPage />} />
              <Route path="franchisees" element={<FranchiseesPage />} />
              <Route path="franchisees/new" element={<FranchisorTenantFormPage />} />
              <Route path="franchisees/edit/:id" element={<FranchisorTenantFormPage />} />
              <Route path="users" element={<FranchisorUsersPage />} />
              <Route path="users/new" element={<FranchisorUserFormPage />} />
              <Route path="users/edit/:id" element={<FranchisorUserFormPage />} />
              <Route path="reports" element={<FranchisorReportsPage />} />
              {/* Adicionar outras rotas do franqueador aqui, como a de gestão de franqueados */}
            </Route>

            {/* Painel Principal do Tenant */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="usuarios" element={<UsersPage />} />
              <Route path="usuarios/new" element={<UserFormPage />} />
              <Route path="usuarios/edit/:id" element={<UserFormPage />} />
              <Route path="cargos" element={<RolesPage />} />
              {/* <Route path="locatarios" element={<TenantsPage />} /> */} {/* Movido para superadmin */}
              <Route path="pesquisas" element={<SurveysPage />} />
              <Route path="pesquisas/create" element={<SurveyCreatePage />} />
              <Route path="pesquisas/edit/:id" element={<SurveyCreatePage />} />
              <Route path="pesquisas/results/:id" element={<SurveyResultsPage />} />
              <Route path="templates-pesquisa" element={<SurveyTemplatesPage />} />
              <Route path="perguntas" element={<QuestionsPage />} />
              <Route path="criterios" element={<CriteriosPage />} />
              <Route path="recompensas" element={<RewardsPage />} />
              <Route path="recompensas/dashboard" element={<RewardsDashboardPage />} />
              <Route path="cupons" element={<CouponsPage />} />
              <Route path="cupons/campanhas" element={<CampaignsPage />} />
              <Route path="cupons/campanhas/nova" element={<CampaignFormPage />} />
              <Route path="cupons/campanhas/editar/:id" element={<CampaignFormPage />} />
              <Route path="cupons/campanhas/detalhes/:id" element={<CampaignDetailsPage />} />
              <Route path="cupons/dashboard" element={<CupomDashboardPage />} />
              <Route path="validar-cupom" element={<CupomValidationPage />} />
              <Route path="clientes" element={<ClientsPage />} />
              <Route path="clientes/:id" element={<ClientDetailsPage />} />
              <Route path="clientes/birthdays" element={<BirthdayClientsPage />} />
              <Route path="clientes/dashboard" element={<ClientDashboardPage />} />
              <Route path="atendentes" element={<AttendantsPage />} />
              <Route path="metas-atendentes" element={<AttendantGoalsPage />} />
              <Route path="metas-atendentes/:atendenteId" element={<AttendantGoalDetailsPage />} /> {/* Nova Rota de Detalhes */}
              <Route path="atendentes-dashboard" element={<AtendenteDashboardPage />} />
              <Route path="resultados" element={<ResultsOverviewPage />} />

              <Route path="respostas/painel" element={<RespostasPainelPage />} />
              <Route path="respostas/gestao" element={<RespostasGestaoPage />} />
              <Route path="respostas/replicas" element={<RespostasReplicasPage />} />
              <Route path="respostas/tratativas" element={<RespostasTratativasPage />} />

              <Route path="reputacao" element={<ReputationPage />} />
              <Route path="roletas" element={<RoletasPage />} />
              <Route path="roletas/nova" element={<RoletaFormPage />} />
              <Route path="roletas/editar/:id" element={<RoletaFormPage />} />
              {/* <Route path="config-whatsapp" element={<WhatsappConfigPage />} /> */} {/* Movido para superadmin */}
              <Route path="whatsapp-connect" element={<WhatsappConnectPage />} />
              <Route path="whatsapp/automations" element={<AutomationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="config" element={<CompanyProfilePage />} />
              <Route path="integracoes" element={<IntegrationsPage />} />
              <Route path="relatorios/diario" element={<RelatorioDiario />} />
              <Route path="relatorios/semanal" element={<RelatorioSemanal />} />
              <Route path="relatorios/mensal" element={<RelatorioMensal />} />
              <Route path="geral/satisfacao" element={<SatisfacaoPage />} />
              <Route path="geral/resumo" element={<ResumoMesPage />} />
              <Route path="geral/comparativo" element={<ComparativoPesquisaPage />} />
              <Route path="geral/evolucao" element={<EvolucaoPage />} />
              <Route path="geral/benchmarking" element={<BenchmarkingPage />} />
              <Route path="geral/nuvem-de-palavras" element={<NuvemDePalavrasPage />} />
              <Route path="premiacoes/historico" element={<PremiacaoHistoricoPage />} /> {/* Nova rota de histórico de premiações */}
            </Route>
          </Route>


        {/* Catch-all para rotas não encontradas */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
