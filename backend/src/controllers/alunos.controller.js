const pool = require("../config/db");

async function listarAlunos(req, res) {
  try {
    const empresaId = req.usuario.empresa_id;

    const result = await pool.query(
      `SELECT 
          a.id,
          a.nome,
          a.data_nascimento,
          a.cpf,
          a.telefone,
          a.dia_vencimento,
          a.valor_mensalidade,
          a.ativo,
          a.observacao,
          a.funcionario_id,
          f.nome AS funcionario_nome,
          f.percentual_comissao AS funcionario_percentual_comissao,
          a.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', ah.id,
                'dia_semana', ah.dia_semana,
                'horario', TO_CHAR(ah.horario, 'HH24:MI')
              )
            ) FILTER (WHERE ah.id IS NOT NULL),
            '[]'
          ) AS horarios
      FROM alunos a
      LEFT JOIN funcionarios f ON f.id = a.funcionario_id
      LEFT JOIN aluno_horarios ah ON ah.aluno_id = a.id
      WHERE a.empresa_id = $1
      GROUP BY a.id, f.id
      ORDER BY a.nome ASC`,
      [empresaId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);

    return res.status(500).json({
      message: "Erro ao listar alunos.",
    });
  }
}

async function criarAluno(req, res) {
  const client = await pool.connect();

  try {
    const empresaId = req.usuario.empresa_id;

    const {
      nome,
      data_nascimento,
      cpf,
      telefone,
      dia_vencimento,
      valor_mensalidade,
      ativo,
      observacao,
      funcionario_id,
      horarios,
    } = req.body;

    if (!nome || !dia_vencimento) {
      return res.status(400).json({
        message: "Nome e dia de vencimento são obrigatórios.",
      });
    }

    await client.query("BEGIN");

    const alunoResult = await client.query(
      `INSERT INTO alunos (
          empresa_id,
          nome,
          data_nascimento,
          cpf,
          telefone,
          dia_vencimento,
          valor_mensalidade,
          ativo,
          observacao,
          funcionario_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        empresaId,
        nome,
        data_nascimento || null,
        cpf || null,
        telefone || null,
        dia_vencimento,
        valor_mensalidade || 0,
        ativo === undefined ? true : ativo,
        observacao || null,
        funcionario_id || null,
      ],
    );

    const aluno = alunoResult.rows[0];

    if (Array.isArray(horarios)) {
      for (const item of horarios) {
        if (item.dia_semana && item.horario) {
          await client.query(
            `INSERT INTO aluno_horarios (aluno_id, dia_semana, horario)
             VALUES ($1, $2, $3)`,
            [aluno.id, item.dia_semana, item.horario],
          );
        }
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Aluno cadastrado com sucesso.",
      aluno,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Erro ao criar aluno:", error);

    return res.status(500).json({
      message: "Erro ao criar aluno.",
    });
  } finally {
    client.release();
  }
}

async function atualizarAluno(req, res) {
  const client = await pool.connect();

  try {
    const empresaId = req.usuario.empresa_id;
    const { id } = req.params;

    const {
      nome,
      data_nascimento,
      cpf,
      telefone,
      dia_vencimento,
      valor_mensalidade,
      ativo,
      observacao,
      funcionario_id,
      horarios,
    } = req.body;

    if (!nome || !dia_vencimento) {
      return res.status(400).json({
        message: "Nome e dia de vencimento são obrigatórios.",
      });
    }

    await client.query("BEGIN");

    const alunoExiste = await client.query(
      `SELECT id 
       FROM alunos 
       WHERE id = $1 
       AND empresa_id = $2`,
      [id, empresaId],
    );

    if (alunoExiste.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Aluno não encontrado.",
      });
    }

    const alunoResult = await client.query(
      `UPDATE alunos
       SET
          nome = $1,
          data_nascimento = $2,
          cpf = $3,
          telefone = $4,
          dia_vencimento = $5,
          valor_mensalidade = $6,
          ativo = $7,
          observacao = $8,
          funcionario_id = $9,
          updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       AND empresa_id = $11
       RETURNING *`,
      [
        nome,
        data_nascimento || null,
        cpf || null,
        telefone || null,
        dia_vencimento,
        valor_mensalidade || 0,
        ativo === undefined ? true : ativo,
        observacao || null,
        funcionario_id || null,
        id,
        empresaId,
      ],
    );

    await client.query(
      `DELETE FROM aluno_horarios 
       WHERE aluno_id = $1`,
      [id],
    );

    if (Array.isArray(horarios)) {
      for (const item of horarios) {
        if (item.dia_semana && item.horario) {
          await client.query(
            `INSERT INTO aluno_horarios (aluno_id, dia_semana, horario)
             VALUES ($1, $2, $3)`,
            [id, item.dia_semana, item.horario],
          );
        }
      }
    }

    await client.query("COMMIT");

    return res.json({
      message: "Aluno atualizado com sucesso.",
      aluno: alunoResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Erro ao atualizar aluno:", error);

    return res.status(500).json({
      message: "Erro ao atualizar aluno.",
    });
  } finally {
    client.release();
  }
}

module.exports = {
  listarAlunos,
  criarAluno,
  atualizarAluno,
};
