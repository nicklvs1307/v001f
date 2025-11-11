const senderService = require('../../services/superadmin/senderService');
const { getSocketIO } = require('../../socket');

class SenderController {
  async getAll(req, res, next) {
    try {
      const senders = await senderService.getAllSendersWithStatus();
      res.status(200).json(senders);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const sender = await senderService.getSenderById(id);
      res.status(200).json(sender);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newSender = await senderService.createSender(req.body);
      res.status(201).json(newSender);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updatedSender = await senderService.updateSender(id, req.body);
      res.status(200).json(updatedSender);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await senderService.deleteSender(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getQrCode(req, res, next) {
    try {
      const { id } = req.params;
      const qrCodeData = await senderService.getSenderQrCode(id);
      res.status(200).json(qrCodeData);
    } catch (error) {
      next(error);
    }
  }

  async restartInstance(req, res, next) {
    try {
      const { id } = req.params;
      const result = await senderService.restartSender(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logoutInstance(req, res, next) {
    try {
      const { id } = req.params;
      const result = await senderService.logoutSender(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req, res, next) {
    try {
      const { instance, event, data } = req.body;
      console.log(`[Webhook] Received event '${event}' for instance '${instance}'`);

      if (event === 'connection.update') {
        const newStatus = data.state === 'CONNECTED' ? 'active' : 'disconnected';
        const updatedSender = await senderService.updateSenderStatusByInstance(instance, newStatus);

        if (updatedSender) {
          const io = getSocketIO();
          console.log(`[Socket.IO] Emitting sender:update for sender ${updatedSender.id}`);
          io.emit('sender:update', updatedSender);
        }
      }
      
      res.sendStatus(200);
    } catch (error) {
      console.error('[Webhook] Error:', error);
      next(error);
    }
  }
}

module.exports = new SenderController();
