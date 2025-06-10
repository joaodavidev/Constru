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

// Rotas para endereços do fornecedor
app.get('/enderecos', async (req, res) => {
  const { usuario_id } = req.query;
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id é obrigatório' });
  try {
    const result = await pool.query('SELECT * FROM enderecos WHERE usuario_id = $1', [usuario_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar endereços' });
  }
});

app.post('/enderecos', async (req, res) => {
  const { usuario_id, nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep } = req.body;
  if (!usuario_id || !nome_endereco) return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  try {
    const exists = await pool.query('SELECT 1 FROM enderecos WHERE usuario_id = $1 AND nome_endereco = $2', [usuario_id, nome_endereco]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Apelido de endereço já cadastrado' });
    const result = await pool.query(
      'INSERT INTO enderecos (usuario_id, nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [usuario_id, nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar endereço' });
  }
});

app.put('/enderecos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep } = req.body;
  if (!nome_endereco) return res.status(400).json({ error: 'nome_endereco é obrigatório' });
  try {
    await pool.query(
      'UPDATE enderecos SET nome_endereco=$1, rua=$2, numero=$3, complemento=$4, bairro=$5, cidade=$6, estado=$7, cep=$8 WHERE id=$9',
      [nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar endereço' });
  }
});

app.delete('/enderecos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Verifica se existe oferta vinculada
    const vinculo = await pool.query('SELECT 1 FROM ofertas WHERE endereco_id = $1', [id]);
    if (vinculo.rows.length > 0) {
      // Busca produtos vinculados
      const produtos = await pool.query('SELECT p.id, p.nome FROM ofertas o JOIN produtos p ON o.produto_id = p.id WHERE o.endereco_id = $1', [id]);
      return res.status(409).json({ error: 'Este endereço está vinculado aos seguintes anúncios e não pode ser removido.', produtos: produtos.rows });
    }
    await pool.query('DELETE FROM enderecos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover endereço' });
  }
});

// Rotas para ofertas (anúncios do fornecedor)
app.get('/ofertas', async (req, res) => {
  const { fornecedor_id } = req.query;
  if (!fornecedor_id) return res.status(400).json({ error: 'fornecedor_id é obrigatório' });
  try {
    const result = await pool.query(
      `SELECT o.*, p.nome as produto_nome, p.imagem, e.nome_endereco FROM ofertas o
       JOIN produtos p ON o.produto_id = p.id
       JOIN enderecos e ON o.endereco_id = e.id
       WHERE o.fornecedor_id = $1`,
      [fornecedor_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ofertas' });
  }
});

app.post('/ofertas', async (req, res) => {
  const { produto_id, fornecedor_id, preco, estoque, endereco_id } = req.body;
  if (!produto_id || !fornecedor_id || !preco || !endereco_id || estoque === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  if (preco <= 0 || estoque < 0) {
    return res.status(400).json({ error: 'Preço deve ser maior que zero e estoque não pode ser negativo' });
  }
  try {
    // Garante que não existe oferta duplicada
    const exists = await pool.query('SELECT 1 FROM ofertas WHERE produto_id = $1 AND fornecedor_id = $2', [produto_id, fornecedor_id]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Você já possui um anúncio para este produto' });
    const result = await pool.query(
      'INSERT INTO ofertas (produto_id, fornecedor_id, preco, estoque, endereco_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [produto_id, fornecedor_id, preco, estoque, endereco_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar oferta' });
  }
});

app.put('/ofertas/:id', async (req, res) => {
  const { id } = req.params;
  const { preco, estoque, endereco_id } = req.body;
  if (!preco || !endereco_id || estoque === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  if (preco <= 0 || estoque < 0) {
    return res.status(400).json({ error: 'Preço deve ser maior que zero e estoque não pode ser negativo' });
  }
  try {
    await pool.query(
      'UPDATE ofertas SET preco=$1, estoque=$2, endereco_id=$3 WHERE id=$4',
      [preco, estoque, endereco_id, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar oferta' });
  }
});

app.delete('/ofertas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ofertas WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover oferta' });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
