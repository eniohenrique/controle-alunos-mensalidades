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
  listarMensalidades,
  listarAtrasadas,
  registrarPagamento,
  listarComissoes,
};
