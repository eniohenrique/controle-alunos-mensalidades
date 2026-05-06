const express = require("express");
const alunosController = require("../controllers/alunos.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, alunosController.listarAlunos);
router.post("/", authMiddleware, alunosController.criarAluno);
router.put("/:id", authMiddleware, alunosController.atualizarAluno);

module.exports = router;
