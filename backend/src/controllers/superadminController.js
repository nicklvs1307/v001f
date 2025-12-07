const asyncHandler = require('express-async-handler');
const { Usuario, Role } = require('../../models');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../errors/ApiError');

const loginAsTenant = asyncHandler(async (req, res) => {
    const { tenantId } = req.params;

    const userToImpersonate = await Usuario.findOne({
        where: { tenantId },
        include: [{ model: Role, as: 'role' }]
    });

    if (!userToImpersonate) {
        throw new ApiError(404, 'No user found for this tenant.');
    }

    const token = generateToken({
        id: userToImpersonate.id,
        tenantId: userToImpersonate.tenantId,
        role: userToImpersonate.role.name
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
