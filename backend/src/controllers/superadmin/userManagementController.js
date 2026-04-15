const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { Usuario, Role } = require("../../../models");
const { Op } = require("sequelize");
const ApiError = require("../../errors/ApiError");

const getSuperAdminUsers = asyncHandler(async (req, res) => {
    const superAdminRole = await Role.findOne({ where: { name: "Super Admin" } });
    if (!superAdminRole) {
        return res.status(200).json([]);
    }
    
    const users = await Usuario.findAll({
        where: { roleId: superAdminRole.id },
        include: [{ model: Role, as: "role", attributes: ["name", "id"] }],
        attributes: ["id", "name", "email", "roleId", "createdAt", "updatedAt"],
        order: [["createdAt", "DESC"]]
    });
    res.status(200).json(users);
});

const createSuperAdminUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await Usuario.findOne({ where: { email } });
    if (userExists) {
        throw new ApiError(400, "Email já cadastrado");
    }

    const superAdminRole = await Role.findOne({ where: { name: "Super Admin" } });
    if (!superAdminRole) {
        throw new ApiError(500, "Role Super Admin não encontrada");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await Usuario.create({
        name,
        email,
        passwordHash,
        roleId: superAdminRole.id,
        tenantId: null,
        franchisorId: null
    });

    res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roleId: newUser.roleId
    });
});

const updateSuperAdminUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const user = await Usuario.findByPk(id);
    if (!user) {
        throw new ApiError(404, "Usuário não encontrado");
    }

    if (email && email !== user.email) {
        const emailExists = await Usuario.findOne({ where: { email } });
        if (emailExists) {
            throw new ApiError(400, "Email já está em uso");
        }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.update(updateData);

    res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email
    });
});

const deleteSuperAdminUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await Usuario.findByPk(id);
    if (!user) {
        throw new ApiError(404, "Usuário não encontrado");
    }

    if (user.id === req.user.id) {
        throw new ApiError(400, "Você não pode deletar sua própria conta");
    }

    await user.destroy();

    res.status(200).json({ message: "Usuário deletado com sucesso" });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await Usuario.findByPk(userId);
    if (!user) {
        throw new ApiError(404, "Usuário não encontrado");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw new ApiError(400, "Senha atual incorreta");
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await user.update({ passwordHash: newPasswordHash });

    res.status(200).json({ message: "Senha alterada com sucesso" });
});

module.exports = {
    getSuperAdminUsers,
    createSuperAdminUser,
    updateSuperAdminUser,
    deleteSuperAdminUser,
    changePassword
};
