const PLAN_LIMITS = {
  basic: {
    maxUsers: 2,
    maxCampaignsPerMonth: 1,
    canUseRoulette: false,
    canUseWhatsappAutomation: false,
    canUseFranchisor: false,
    label: "Básico",
  },
  pro: {
    maxUsers: 5,
    maxCampaignsPerMonth: 10,
    canUseRoulette: true,
    canUseWhatsappAutomation: true,
    canUseFranchisor: false,
    label: "Profissional",
  },
  enterprise: {
    maxUsers: 999,
    maxCampaignsPerMonth: 9999,
    canUseRoulette: true,
    canUseWhatsappAutomation: true,
    canUseFranchisor: true,
    label: "Enterprise",
  },
};

module.exports = { PLAN_LIMITS };
