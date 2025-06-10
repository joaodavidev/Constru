const express = require('express');
const app = express();
const pool = require('./db');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API está funcionando');
});

// Exemplo de rota: listar usuários
app.get('/usuarios', async (req, res) => {
  const result = await pool.query('SELECT * FROM usuarios');
  res.json(result.rows);
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    // Comparação simples de senha (em produção, use hash)
    if (user.senha !== senha) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    // Remover senha do retorno
    const { senha: _, ...userData } = user;
    res.json({ user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para cadastro de usuário (cliente ou fornecedor)
app.post('/usuarios', async (req, res) => {
  const { nome, email, senha, tipo_usuario, cnpj } = req.body;
  if (!nome || !email || !senha || !tipo_usuario) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  try {
    // Verifica se o email já existe
    const exists = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    // Insere usuário
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, tipo_usuario, cnpj) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, tipo_usuario, cnpj',
      [nome, email, senha, tipo_usuario, cnpj || null]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
