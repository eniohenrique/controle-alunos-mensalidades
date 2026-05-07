const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/criar-conta", authController.criarConta);
router.post("/login", authController.login);
router.patch("/alterar-senha", authMiddleware, authController.alterarSenha);

module.exports = router;
