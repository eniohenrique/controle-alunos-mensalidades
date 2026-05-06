const pool = require("../config/db");

function getStatusCalculado(status, diaVencimento, mes, ano) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  const diaAtual = hoje.getDate();

  if (status === "PAGO") {
    return "PAGO";
  }

  if (ano < anoAtual) {
    return "ATRASADO";
  }

  if (ano === anoAtual && mes < mesAtual) {
    return "ATRASADO";
  }

  if (ano === anoAtual && mes === mesAtual && diaVencimento < diaAtual) {
    return "ATRASADO";
  }

  return "PENDENTE";
}

async function listarMensalidades(req, res) {
  try {
    const empresaId = req.usuario.empresa_id;

    const hoje = new Date();
    const mes = Number(req.query.mes || hoje.getMonth() + 1);
    const ano = Number(req.query.ano || hoje.getFullYear());

    const result = await pool.query(
      `SELECT
          a.id AS aluno_id,
          a.nome AS aluno_nome,
          a.telefone,
          a.dia_vencimento,
          a.valor_mensalidade,
          a.ativo,

          m.id AS mensalidade_id,
          m.mes,
          m.ano,
          m.valor,
          m.status,
          m.forma_pagamento,
          m.data_pagamento,
          m.comprovante_url,
          m.observacao
       FROM alunos a
       LEFT JOIN mensalidades m 
          ON m.aluno_id = a.id
         AND m.mes = $2
         AND m.ano = $3
       WHERE a.empresa_id = $1
       ORDER BY a.nome ASC`,
      [empresaId, mes, ano],
    );

    const mensalidades = result.rows.map((item) => {
      const statusBase = item.status || "PENDENTE";

      return {
        ...item,
        mes,
        ano,
        valor: item.valor || item.valor_mensalidade,
        status: statusBase,
        status_calculado: getStatusCalculado(
          statusBase,
          item.dia_vencimento,
          mes,
          ano,
        ),
      };
    });

    return res.json(mensalidades);
  } catch (error) {
    console.error("Erro ao listar mensalidades:", error);

    return res.status(500).json({
      message: "Erro ao listar mensalidades.",
    });
  }
}

async function listarAtrasadas(req, res) {
  try {
    const empresaId = req.usuario.empresa_id;

    const hoje = new Date();
    const mes = Number(req.query.mes || hoje.getMonth() + 1);
    const ano = Number(req.query.ano || hoje.getFullYear());

    const result = await pool.query(
      `SELECT
          a.id AS aluno_id,
          a.nome AS aluno_nome,
          a.telefone,
          a.dia_vencimento,
          a.valor_mensalidade,
          a.ativo,

          m.id AS mensalidade_id,
          m.status,
          m.forma_pagamento,
          m.data_pagamento,
          m.comprovante_url
       FROM alunos a
       LEFT JOIN mensalidades m 
          ON m.aluno_id = a.id
         AND m.mes = $2
         AND m.ano = $3
       WHERE a.empresa_id = $1
         AND a.ativo = true
       ORDER BY a.nome ASC`,
      [empresaId, mes, ano],
    );

    const atrasadas = result.rows
      .map((item) => {
        const statusBase = item.status || "PENDENTE";

        return {
          ...item,
          mes,
          ano,
          valor: item.valor_mensalidade,
          status: statusBase,
          status_calculado: getStatusCalculado(
            statusBase,
            item.dia_vencimento,
            mes,
            ano,
          ),
        };
      })
      .filter((item) => item.status_calculado === "ATRASADO");

    return res.json({
      quantidade: atrasadas.length,
      alunos: atrasadas,
    });
  } catch (error) {
    console.error("Erro ao listar atrasadas:", error);

    return res.status(500).json({
      message: "Erro ao listar mensalidades atrasadas.",
    });
  }
}

async function registrarPagamento(req, res) {
  try {
    const empresaId = req.usuario.empresa_id;
    const { aluno_id } = req.params;

    const hoje = new Date();

    const {
      mes = hoje.getMonth() + 1,
      ano = hoje.getFullYear(),
      valor,
      forma_pagamento,
      comprovante_url,
      observacao,
    } = req.body;

    if (!forma_pagamento) {
      return res.status(400).json({
        message: "Forma de pagamento é obrigatória.",
      });
    }

    if (forma_pagamento === "PIX" && !comprovante_url) {
      return res.status(400).json({
        message: "Comprovante é obrigatório para pagamento via PIX.",
      });
    }

    const alunoResult = await pool.query(
      `SELECT id, valor_mensalidade
       FROM alunos
       WHERE id = $1
       AND empresa_id = $2`,
      [aluno_id, empresaId],
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Aluno não encontrado.",
      });
    }

    const aluno = alunoResult.rows[0];
    const valorFinal = valor || aluno.valor_mensalidade || 0;

    const result = await pool.query(
      `INSERT INTO mensalidades (
          aluno_id,
          mes,
          ano,
          valor,
          status,
          forma_pagamento,
          data_pagamento,
          comprovante_url,
          observacao
       )
       VALUES ($1, $2, $3, $4, 'PAGO', $5, CURRENT_TIMESTAMP, $6, $7)
       ON CONFLICT (aluno_id, mes, ano)
       DO UPDATE SET
          valor = EXCLUDED.valor,
          status = 'PAGO',
          forma_pagamento = EXCLUDED.forma_pagamento,
          data_pagamento = CURRENT_TIMESTAMP,
          comprovante_url = EXCLUDED.comprovante_url,
          observacao = EXCLUDED.observacao,
          updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        aluno_id,
        mes,
        ano,
        valorFinal,
        forma_pagamento,
        comprovante_url || null,
        observacao || null,
      ],
    );

    return res.json({
      message: "Pagamento registrado com sucesso.",
      mensalidade: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error);

    return res.status(500).json({
      message: "Erro ao registrar pagamento.",
    });
  }
}

module.exports = {
  listarMensalidades,
  listarAtrasadas,
  registrarPagamento,
};
