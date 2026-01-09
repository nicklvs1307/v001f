const { DeliveryOrder } = require("../../models");

class DeliveryOrderRepository {
  async create(data) {
    return await DeliveryOrder.create(data);
  }

  async findByPlatformAndOrderId(platform, orderIdPlatform) {
    return await DeliveryOrder.findOne({
      where: {
        platform: platform,
        orderIdPlatform: orderIdPlatform,
      },
    });
  }

  // Futuras funções para buscar ou atualizar DeliveryOrders podem ser adicionadas aqui
  // async findById(id) {
  //   return await DeliveryOrder.findByPk(id);
  // }
}

module.exports = new DeliveryOrderRepository();
