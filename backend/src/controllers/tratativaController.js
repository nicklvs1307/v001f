const asyncHandler = require("express-async-handler");
const { Tratativa } = require("../../models");
const ApiError = require("../errors/ApiError");

exports.upsertTratativa = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { status, notes } = req.body;
  const tenantId = req.user.tenantId;

  let tratativa = await Tratativa.findOne({ 
    where: { respondentSessionId: sessionId, tenantId } 
  });

  if (tratativa) {
    tratativa.status = status || tratativa.status;
    tratativa.notes = notes !== undefined ? notes : tratativa.notes;
    await tratativa.save();
  } else {
    tratativa = await Tratativa.create({
      respondentSessionId: sessionId,
      tenantId,
      status: status || 'PENDENTE',
      notes: notes || ''
    });
  }

  res.status(200).json(tratativa);
});
