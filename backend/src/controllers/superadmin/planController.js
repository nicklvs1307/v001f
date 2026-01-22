const asyncHandler = require("express-async-handler");
const { Plan } = require("../../../models");
const ApiError = require("../../errors/ApiError");

// @desc    Listar todos os planos
// @route   GET /api/superadmin/plans
// @access  Super Admin
exports.getAllPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.findAll({
    order: [['price', 'ASC']]
  });
  res.json(plans);
});

// @desc    Criar novo plano
// @route   POST /api/superadmin/plans
// @access  Super Admin
exports.createPlan = asyncHandler(async (req, res) => {
  const { name, price, description, features, active } = req.body;

  if (!name) {
    throw new ApiError(400, "O nome do plano é obrigatório.");
  }

  const plan = await Plan.create({
    name,
    price,
    description,
    features,
    active: active !== undefined ? active : true
  });

  res.status(201).json(plan);
});

// @desc    Atualizar plano
// @route   PUT /api/superadmin/plans/:id
// @access  Super Admin
exports.updatePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, price, description, features, active } = req.body;

  const plan = await Plan.findByPk(id);

  if (!plan) {
    throw new ApiError(404, "Plano não encontrado.");
  }

  await plan.update({
    name,
    price,
    description,
    features,
    active
  });

  res.json(plan);
});

// @desc    Deletar plano (soft delete via active=false ou hard delete se sem uso)
// @route   DELETE /api/superadmin/plans/:id
// @access  Super Admin
exports.deletePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const plan = await Plan.findByPk(id);

  if (!plan) {
    throw new ApiError(404, "Plano não encontrado.");
  }

  // Por segurança, apenas desativamos em vez de deletar se já estiver em uso (lógica futura)
  // Por enquanto, vamos permitir deletar
  await plan.destroy();

  res.json({ message: "Plano removido com sucesso." });
});
