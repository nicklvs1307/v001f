import api from './apiAuthenticated';

const senderPoolService = {
  getAllSenders: () => {
    return api.get('/superadmin/senders');
  },

  getSenderById: (id) => {
    return api.get(`/superadmin/senders/${id}`);
  },

  createSender: (data) => {
    return api.post('/superadmin/senders', data);
  },

  updateSender: (id, data) => {
    return api.put(`/superadmin/senders/${id}`, data);
  },

  deleteSender: (id) => {
    return api.delete(`/superadmin/senders/${id}`);
  },

  getSenderStatus: (id) => {
    return api.get(`/superadmin/senders/${id}/status`);
  },

  getSenderQrCode: (id) => {
    return api.get(`/superadmin/senders/${id}/connect`);
  },

  restartSender: (id) => {
    return api.put(`/superadmin/senders/${id}/restart`);
  },

  logoutSender: (id) => {
    return api.delete(`/superadmin/senders/${id}/logout`);
  },
};

export default senderPoolService;
