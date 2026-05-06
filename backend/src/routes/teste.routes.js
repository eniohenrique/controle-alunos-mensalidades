const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS agora");

    res.json({
      status: "ok",
      banco: "conectado",
      agora: result.rows[0].agora,
    });
  } catch (error) {
    console.error("Erro ao conectar no banco:", error);

    res.status(500).json({
      status: "erro",
      message: "Erro ao conectar no banco",
    });
  }
});

module.exports = router;
