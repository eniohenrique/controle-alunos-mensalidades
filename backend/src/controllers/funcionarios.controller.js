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

async function listarComissoes(req, res) {
  try {
    const empresaId = req.usuario.empresa_id;

    const hoje = new Date();
    const mes = Number(req.query.mes || hoje.getMonth() + 1);
    const ano = Number(req.query.ano || hoje.getFullYear());

    const result = await pool.query(
      `SELECT
          f.id AS funcionario_id,
          f.nome AS funcionario_nome,
          f.percentual_comissao,

          a.id AS aluno_id,
          a.nome AS aluno_nome,
          a.valor_mensalidade,
          a.ativo,

          m.id AS mensalidade_id,
          m.valor AS valor_pago,
          m.mes,
          m.ano,
          m.status,
          m.data_pagamento,

          ROUND(
            (COALESCE(m.valor, 0) * f.percentual_comissao / 100),
            2
          ) AS valor_comissao
       FROM mensalidades m
       INNER JOIN alunos a ON a.id = m.aluno_id
       INNER JOIN funcionarios f ON f.id = a.funcionario_id
       WHERE a.empresa_id = $1
         AND f.empresa_id = $1
         AND a.ativo = true
         AND f.ativo = true
         AND m.status = 'PAGO'
         AND m.mes = $2
         AND m.ano = $3
       ORDER BY f.nome ASC, a.nome ASC`,
      [empresaId, mes, ano],
    );

    const funcionariosMap = new Map();

    for (const item of result.rows) {
      if (!funcionariosMap.has(item.funcionario_id)) {
        funcionariosMap.set(item.funcionario_id, {
          funcionario_id: item.funcionario_id,
          funcionario_nome: item.funcionario_nome,
          percentual_comissao: Number(item.percentual_comissao || 0),
          total_recebido: 0,
          total_comissao: 0,
          quantidade_alunos: 0,
          alunos: [],
        });
      }

      const funcionario = funcionariosMap.get(item.funcionario_id);

      funcionario.total_recebido += Number(item.valor_pago || 0);
      funcionario.total_comissao += Number(item.valor_comissao || 0);
      funcionario.quantidade_alunos += 1;

      funcionario.alunos.push({
        aluno_id: item.aluno_id,
        aluno_nome: item.aluno_nome,
        valor_pago: Number(item.valor_pago || 0),
        valor_comissao: Number(item.valor_comissao || 0),
        data_pagamento: item.data_pagamento,
      });
    }

    const funcionarios = Array.from(funcionariosMap.values()).map((item) => ({
      ...item,
      total_recebido: Number(item.total_recebido.toFixed(2)),
      total_comissao: Number(item.total_comissao.toFixed(2)),
    }));

    const totalGeralComissao = funcionarios.reduce((total, funcionario) => {
      return total + funcionario.total_comissao;
    }, 0);

    return res.json({
      mes,
      ano,
      total_funcionarios: funcionarios.length,
      total_geral_comissao: Number(totalGeralComissao.toFixed(2)),
      funcionarios,
    });
  } catch (error) {
    console.error("Erro ao listar comissões:", error);

    return res.status(500).json({
      message: "Erro ao listar comissões.",
    });
  }
}

module.exports = {
  listarFuncionarios,
  criarFuncionario,
  atualizarFuncionario,
  listarComissoes,
};
