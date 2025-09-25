const { google } = require('googleapis');
const asyncHandler = require('express-async-handler');
const config = require('../config');
const gmbConfigRepository = require('../repositories/gmbConfigRepository');
const ApiError = require('../errors/ApiError');

const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

const scopes = [
  'https://www.googleapis.com/auth/business.manage'
];

const gmbAuthController = {
  redirectToGoogle: asyncHandler(async (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Força o refresh token a ser enviado sempre
    });
    res.redirect(url);
  }),

  handleGoogleCallback: asyncHandler(async (req, res) => {
    const { code } = req.query;
    const { user } = req; // Usuário logado vindo do middleware 'protect'

    if (!user || !user.tenantId) {
        throw new ApiError(400, 'Usuário ou Tenant não identificado.');
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      const { access_token, refresh_token } = tokens;

      if (!access_token) {
        throw new ApiError(500, 'Falha ao obter o access token do Google.');
      }

      // Salva os tokens no banco de dados associados ao tenant
      await gmbConfigRepository.createOrUpdateConfig({
        tenantId: user.tenantId,
        accessToken: access_token,
        refreshToken: refresh_token,
      });

      // Redireciona o usuário de volta para a página de reputação no frontend
      res.redirect(`${config.frontendPublicUrl || 'http://localhost:3000'}/reputacao`);

    } catch (error) {
      console.error('Erro durante o callback do Google OAuth:', error);
      throw new ApiError(500, 'Falha na autenticação com o Google.');
    }
  }),
};

module.exports = gmbAuthController;
