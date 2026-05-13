const pool = require("../config/db");

async function listarFuncionarios(req, res) {
  try {
    const empresaId = req.usuario.empresa_id;

    const result = await pool.query(
      `SELECT
          id,
          nome,
          telefone,
          email,
          percentual_comissao,
          ativo,
          created_at,
          updated_at
       FROM funcionarios
       WHERE empresa_id = $1
       ORDER BY nome ASC`,
      [empresaId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);

    return res.status(500).json({
      message: "Erro ao listar funcionários.",
    });
  }
}

async function criarFuncionario(req, res) {
  try {
    const empresaId = req.usuario.empresa_id;

    const { nome, telefone, email, percentual_comissao, ativo } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: "Nome do funcionário é obrigatório.",
      });
    }

    const result = await pool.query(
      `INSERT INTO funcionarios (
          empresa_id,
          nome,
          telefone,
          email,
          percentual_comissao,
          ativo
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        empresaId,
        nome.trim(),
        telefone || null,
        email || null,
        percentual_comissao || 40,
        ativo === undefined ? true : ativo,
      ],
    );

    return res.status(201).json({
      message: "Funcionário cadastrado com sucesso.",
      funcionario: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);

    return res.status(500).json({
      message: "Erro ao criar funcionário.",
    });
  }
}

async function atualizarFuncionario(req, res) {
  try {
    const empresaId = req.usuario.empresa_id;
    const { id } = req.params;

    const { nome, telefone, email, percentual_comissao, ativo } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: "Nome do funcionário é obrigatório.",
      });
    }

    const result = await pool.query(
      `UPDATE funcionarios
       SET
          nome = $1,
          telefone = $2,
          email = $3,
          percentual_comissao = $4,
          ativo = $5,
          updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       AND empresa_id = $7
       RETURNING *`,
      [
        nome.trim(),
        telefone || null,
        email || null,
        percentual_comissao || 40,
        ativo === undefined ? true : ativo,
        id,
        empresaId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Funcionário não encontrado.",
      });
    }

    return res.json({
      message: "Funcionário atualizado com sucesso.",
      funcionario: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);

    return res.status(500).json({
      message: "Erro ao atualizar funcionário.",
    });
  }
}

module.exports = {
  listarFuncionarios,
  criarFuncionario,
  atualizarFuncionario,
};
