const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { Usuario, Role } = require('../../models');
const config = require('../config');
const ApiError = require('../errors/ApiError');

const loginAsTenant = asyncHandler(async (req, res) => {
    const { tenantId } = req.params;

    // Encontra o primeiro usuário (geralmente o admin) do tenant especificado.
    const userToImpersonate = await Usuario.findOne({
        where: { tenantId },
        include: [{ model: Role, as: 'role' }],
        order: [['createdAt', 'ASC']] // Garante que pegue o usuário mais antigo.
    });

    if (!userToImpersonate) {
        throw new ApiError(404, 'Nenhum usuário encontrado para este tenant.');
    }

    // Cria o payload para o novo token, alinhado com o authController.
    const payload = {
        userId: userToImpersonate.id,
        name: userToImpersonate.name,
        role: userToImpersonate.role.name,
        tenantId: userToImpersonate.tenantId,
        profilePictureUrl: userToImpersonate.profilePictureUrl,
    };
    
    // Gera o novo token usando o padrão do projeto.
    const token = jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
    });

    res.json({
        success: true,
        token: token,
        user: {
            id: userToImpersonate.id,
            name: userToImpersonate.name,
            email: userToImpersonate.email,
            role: userToImpersonate.role.name,
            tenantId: userToImpersonate.tenantId,
        }
    });
});

module.exports = {
    loginAsTenant
};
