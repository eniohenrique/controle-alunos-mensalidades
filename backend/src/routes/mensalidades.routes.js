const express = require("express");
const mensalidadesController = require("../controllers/mensalidades.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, mensalidadesController.listarMensalidades);
router.get(
  "/atrasadas",
  authMiddleware,
  mensalidadesController.listarAtrasadas,
);
router.post(
  "/:aluno_id/pagamento",
  authMiddleware,
  mensalidadesController.registrarPagamento,
);

module.exports = router;
