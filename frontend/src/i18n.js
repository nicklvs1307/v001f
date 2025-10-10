import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip move them in a JSON file and load them via xhr)
const resources = {
  pt: {
    translation: {
      "roulette.title": "Gire a Roleta!",
      "roulette.description": "Tente a sua sorte e ganhe um prêmio!",
      "roulette.spin_button": "Girar",
      "roulette.error_tenant_id_missing": "ID do inquilino ausente.",
      "roulette.error_client_id_missing": "ID do cliente ausente.",
      "roulette.error_fetching_config": "Erro ao buscar configuração da roleta.",
      "roulette.error_spinning_wheel": "Erro ao girar a roleta.",
      "roulette.error_winning_item_not_found": "Item vencedor não encontrado na configuração.",
      "roulette.win_message": "Parabéns! Você ganhou um prêmio!",
      "roulette.error_client_id_absent": "ID do cliente não fornecido. Por favor, registre-se.",
      "roulette.back_to_registration": "Voltar ao Registro",
      "roulette.loading_wheel_config": "Carregando configuração da roleta...",
      "roulette.no_items_configured": "Nenhum item configurado para a roleta.",
      "roulette.error_no_winning_item": "Item vencedor nulo após a animação.",
      "roulette.already_spun_message": "Você já girou a roleta e ganhou um prêmio! Verifique seus cupons.",
      "roulette.already_spun": "Você já participou desta roleta.",
      "roulette.spun_button": "Já Girou"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "pt", // default language
    fallbackLng: "pt",

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
