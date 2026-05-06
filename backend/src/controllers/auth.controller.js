const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function criarAdminInicial(req, res) {
  try {
    const { nome, email, senha, nome_empresa, telefone_empresa } = req.body;

    if (!nome || !email || !senha || !nome_empresa) {
      return res.status(400).json({
        message: "Nome, email, senha e nome da empresa são obrigatórios.",
      });
    }

    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email],
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        message: "Já existe um usuário com este e-mail.",
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const empresaResult = await client.query(
        `INSERT INTO empresas (nome, responsavel, telefone)
         VALUES ($1, $2, $3)
         RETURNING id, nome`,
        [nome_empresa, nome, telefone_empresa || null],
      );

      const empresa = empresaResult.rows[0];

      const usuarioResult = await client.query(
        `INSERT INTO usuarios (empresa_id, nome, email, senha, role)
         VALUES ($1, $2, $3, $4, 'ADMIN')
         RETURNING id, empresa_id, nome, email, role`,
        [empresa.id, nome, email, senhaCriptografada],
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Admin inicial criado com sucesso.",
        empresa,
        usuario: usuarioResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Erro ao criar admin inicial:", error);

    return res.status(500).json({
      message: "Erro ao criar admin inicial.",
    });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const result = await pool.query(
      `SELECT 
          u.id,
          u.empresa_id,
          u.nome,
          u.email,
          u.senha,
          u.role,
          u.ativo,
          e.nome AS empresa_nome
       FROM usuarios u
       LEFT JOIN empresas e ON e.id = u.empresa_id
       WHERE u.email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const usuario = result.rows[0];

    if (!usuario.ativo) {
      return res.status(403).json({
        message: "Usuário inativo.",
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        empresa_id: usuario.empresa_id,
        role: usuario.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    delete usuario.senha;

    return res.json({
      message: "Login realizado com sucesso.",
      token,
      usuario,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);

    return res.status(500).json({
      message: "Erro ao fazer login.",
    });
  }
}

module.exports = {
  criarAdminInicial,
  login,
};
