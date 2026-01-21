const express = require("express");
const router = express.Router();
const replicaController = require("../controllers/replicaController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/conversations", replicaController.getReplicaConversations);
router.get("/:sessionId", replicaController.getReplicas);
router.post("/:sessionId", replicaController.createReplica);

module.exports = router;
