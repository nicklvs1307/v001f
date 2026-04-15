const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const userManagementController = require("../../controllers/superadmin/userManagementController");
const { protect, authorize } = require("../../middlewares/authMiddleware");
const validate = require("../../middlewares/validationMiddleware");

router.use(protect);
router.use(authorize("Super Admin"));

router.get("/users", userManagementController.getSuperAdminUsers);
router.post("/users",
    [
        check("name", "Nome é obrigatório").not().isEmpty(),
        check("email", "Email válido é obrigatório").isEmail(),
        check("password", "Senha com 6+ caracteres é obrigatória").isLength({ min: 6 }),
    ],
    validate,
    userManagementController.createSuperAdminUser
);
router.put("/users/:id",
    [
        check("name", "Nome é obrigatório").optional().not().isEmpty(),
        check("email", "Email válido é obrigatório").optional().isEmail(),
        check("password", "Senha com 6+ caracteres é obrigatória").optional().isLength({ min: 6 }),
    ],
    validate,
    userManagementController.updateSuperAdminUser
);
router.delete("/users/:id", userManagementController.deleteSuperAdminUser);

router.post("/change-password",
    [
        check("currentPassword", "Senha atual é obrigatória").not().isEmpty(),
        check("newPassword", "Nova senha com 6+ caracteres é obrigatória").isLength({ min: 6 }),
    ],
    validate,
    userManagementController.changePassword
);

module.exports = router;
