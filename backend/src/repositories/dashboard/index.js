const summaryFunctions = require("./summary");
const chartsFunctions = require("./charts");
const attendantsFunctions = require("./attendants");
const feedbacksFunctions = require("./feedbacks");
const detailsFunctions = require("./details");
const npsFunctions = require("./nps");
const criteriaFunctions = require("./criteria");
const overallFunctions = require("./overall");
const mainFunctions = require("./main");
const clientsFunctions = require("./clients");

module.exports = {
  ...summaryFunctions,
  ...chartsFunctions,
  ...attendantsFunctions,
  ...feedbacksFunctions,
  ...detailsFunctions,
  ...npsFunctions,
  ...criteriaFunctions,
  ...overallFunctions,
  ...mainFunctions,
  ...clientsFunctions,
};
