const { Recompensa, Cupom } = require("../../models");
const { Op, fn, col } = require("sequelize");

const createRecompensa = async (
  tenantId,
  name,
  description,
  pointsRequired,
  active,
  conditionDescription,
) => {
  return Recompensa.create({
    tenantId,
    name,
    description,
    pointsRequired,
    active,
    conditionDescription,
  });
};

const getAllRecompensas = async (tenantId, activeStatus = null) => {
  const whereClause = tenantId ? { tenantId } : {};
  if (activeStatus !== null) {
    whereClause.active = activeStatus;
  }
  return Recompensa.findAll({
    where: whereClause,
    order: [["name", "ASC"]],
  });
};

const findById = async (id, tenantId = null) => {
  const whereClause = tenantId ? { id, tenantId } : { id };
  return Recompensa.findOne({ where: whereClause });
};

const updateRecompensa = async (
  id,
  tenantId,
  name,
  description,
  pointsRequired,
  active,
  conditionDescription,
) => {
  const [updatedRows, [updatedRecompensa]] = await Recompensa.update(
    { name, description, pointsRequired, active, conditionDescription },
    { where: { id, tenantId }, returning: true },
  );
  return updatedRecompensa;
};

const deleteRecompensa = async (id, tenantId) => {
  return Recompensa.destroy({ where: { id, tenantId } });
};

const getDashboardData = async (tenantId) => {
  const whereClause = tenantId ? { tenantId } : {};

  const couponStatus = await Cupom.findAll({
    where: whereClause,
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true,
  });

  const rewardsUsage = await Cupom.findAll({
    where: whereClause,
    attributes: [
      [col("recompensa.name"), "name"],
      [fn("COUNT", col("Cupom.id")), "count"],
    ],
    include: [
      {
        model: Recompensa,
        as: "recompensa",
        attributes: [],
        required: true,
      },
    ],
    group: [col("recompensa.name")],
    order: [[fn("COUNT", col("Cupom.id")), "DESC"]],
    raw: true,
  });

  return {
    couponStatus,
    rewardsUsage,
  };
};

module.exports = {
  createRecompensa,
  getAllRecompensas,
  findById,
  updateRecompensa,
  deleteRecompensa,
  getDashboardData,
};
