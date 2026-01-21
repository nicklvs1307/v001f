const asyncHandler = require("express-async-handler");
const { Replica, Resposta, Client, Tenant } = require("../../models");
const ApiError = require("../errors/ApiError");
const whatsappService = require("../services/whatsappService");

exports.getReplicas = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const tenantId = req.user.tenantId;

  const replicas = await Replica.findAll({
    where: { 
      respondentSessionId: sessionId,
      tenantId 
    },
    order: [['createdAt', 'ASC']]
  });

  res.status(200).json(replicas);
});

exports.createReplica = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;
  const tenantId = req.user.tenantId;

  if (!message) {
    throw new ApiError(400, "Message is required");
  }

  // Find the client to get the phone number
  // First try to find by respondentSessionId directly in Client table
  let client = await Client.findOne({ 
    where: { respondentSessionId: sessionId, tenantId } 
  });

  // If not found, maybe look at Resposta -> Client (but usually Client has the sessionId)
  if (!client) {
      // Sometimes sessionId in URL might match Resposta's respondentSessionId which links to Client
      // But Client model has unique respondentSessionId.
      // If client registered via public survey, it should be there.
      // If anonymous, we can't reply via WhatsApp unless we have a phone number from somewhere else.
  }

  if (client && client.phone) {
    try {
        await whatsappService.sendTenantMessage(tenantId, client.phone, message);
    } catch (error) {
        console.error("Failed to send WhatsApp message for replica:", error);
        // We proceed to save the replica even if sending fails, 
        // but maybe we should flag it? For now, just log.
    }
  }

  const replica = await Replica.create({
    tenantId,
    respondentSessionId: sessionId,
    message
  });

  res.status(201).json(replica);
});

// Used for the Replicas Page to list conversations that might need attention or have history
exports.getReplicaConversations = asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;
    
    // logic to get sessions that have replicas or are potential candidates for replicas
    // This is a simplified version. You might want to join with Respostas to get client info.
    // For now, let's just get all sessions that have at least one replica, 
    // or maybe the user wants to see all feedbacks to reply to them?
    // Assuming the user wants to see a list of feedbacks they can reply to (similar to Tratativas).
    // So we re-use dashboardService logic or create a similar query.

    // For this specific endpoint, let's just return a list of replicas grouped by session
    // But realistically the frontend page will likely list Feedbacks (Respostas) and show if they have replicas.
    // So we might not strictly need a "list all replicas" endpoint for the main view if we reuse the feedback list.
    
    // However, if the user explicitly wants a "Replicas" management page, maybe they want to see *sent* replicas.
    
    const replicas = await Replica.findAll({
        where: { tenantId },
        order: [['createdAt', 'DESC']],
        limit: 100
    });
    
    res.status(200).json(replicas);
});
