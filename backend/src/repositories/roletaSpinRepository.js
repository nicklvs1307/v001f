const { RoletaSpin } = require("../../models");

class RoletaSpinRepository {
  async bulkCreate(data) {
    return RoletaSpin.bulkCreate(data);
  }
}

module.exports = new RoletaSpinRepository();
