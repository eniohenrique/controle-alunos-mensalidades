const express = require("express");
const funcionariosController = require("../controllers/funcionarios.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/comissoes",
  authMiddleware,
  funcionariosController.listarComissoes,
);

router.get("/", authMiddleware, funcionariosController.listarFuncionarios);
router.post("/", authMiddleware, funcionariosController.criarFuncionario);
router.put("/:id", authMiddleware, funcionariosController.atualizarFuncionario);

module.exports = router;
