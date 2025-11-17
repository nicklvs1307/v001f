const roletaSpinService = require("../services/roletaSpinService");

class RoletaSpinController {
  async validateToken(req, res, next) {
    try {
      const { token } = req.params;
      const spinData = await roletaSpinService.validateToken(token);
      res.status(200).json(spinData);
    } catch (error) {
      next(error);
    }
  }

  async spinRoleta(req, res, next) {
    try {
      const { token } = req.params;
      const { premioId } = req.body; // O prêmio selecionado pelo frontend
      const result = await roletaSpinService.useSpin(token, premioId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoletaSpinController();
