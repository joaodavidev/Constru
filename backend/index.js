
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
// Configuração do banco de dados MySQL e TLS
// Certifique-se de que as variáveis de ambiente estão definidas corretamente
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});

// Habilita CORS para o frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API está funcionando');
});

//Variavel de ambiente Stripe 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

//rota de saude
app.get('/health', (_req, res) => res.send('ok'))


// Exemplo de rota: listar usuários
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
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
    // Comparação segura de senha
    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
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
    // Hash da senha
    const hash = await bcrypt.hash(senha, 10);
    // Insere usuário
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, tipo_usuario, cnpj) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, tipo_usuario, cnpj',
      [nome, email, hash, tipo_usuario, cnpj || null]
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
    const [rows] = await pool.query('SELECT * FROM enderecos WHERE usuario_id = ?', [usuario_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar endereços' });
  }
});

app.post('/enderecos', async (req, res) => {
  const { usuario_id, nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep } = req.body;
  if (!usuario_id || !nome_endereco) return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  try {
    const [exists] = await pool.query('SELECT 1 FROM enderecos WHERE usuario_id = ? AND nome_endereco = ?', [usuario_id, nome_endereco]);
    if (exists.length > 0) return res.status(409).json({ error: 'Apelido de endereço já cadastrado' });
    const [result] = await pool.query(
      'INSERT INTO enderecos (usuario_id, nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [usuario_id, nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep]
    );
    // Busca o endereço recém-criado
    const [rows] = await pool.query('SELECT * FROM enderecos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
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
      'UPDATE enderecos SET nome_endereco=?, rua=?, numero=?, complemento=?, bairro=?, cidade=?, estado=?, cep=? WHERE id=?',
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
    const [vinculo] = await pool.query('SELECT 1 FROM ofertas WHERE endereco_id = ?', [id]);
    if (vinculo.length > 0) {
      // Busca produtos vinculados
      const [produtos] = await pool.query('SELECT p.id, p.nome FROM ofertas o JOIN produtos p ON o.produto_id = p.id WHERE o.endereco_id = ?', [id]);
      return res.status(409).json({ error: 'Este endereço está vinculado aos seguintes anúncios e não pode ser removido.', produtos });
    }
    await pool.query('DELETE FROM enderecos WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover endereço' });
  }
});

// Rotas para ofertas (anúncios do fornecedor)
app.get('/ofertas', async (req, res) => {
  const { produto_id, fornecedor_id } = req.query;
  try {
    let result;
    if (produto_id) {
      const query = `SELECT o.*, u.nome as fornecedor_nome, u.id as fornecedor_id, p.nome as produto_nome, p.imagem as produto_imagem, e.nome_endereco
        FROM ofertas o
        JOIN produtos p ON o.produto_id = p.id
        JOIN usuarios u ON o.fornecedor_id = u.id
        JOIN enderecos e ON o.endereco_id = e.id
        WHERE o.produto_id = $1`;
      const ofertas = await pool.query(query, [produto_id]);
      result = ofertas.rows;
    } else if (fornecedor_id) {
      const query = `SELECT o.*, p.nome as produto_nome, p.imagem as produto_imagem, e.nome_endereco
        FROM ofertas o
        JOIN produtos p ON o.produto_id = p.id
        JOIN enderecos e ON o.endereco_id = e.id
        WHERE o.fornecedor_id = $1`;
      const ofertas = await pool.query(query, [fornecedor_id]);
      result = ofertas.rows;
    } else {
      return res.status(400).json({ error: 'produto_id ou fornecedor_id é obrigatório' });
    }
    res.json(result);
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
    const [exists] = await pool.query('SELECT 1 FROM ofertas WHERE produto_id = ? AND fornecedor_id = ?', [produto_id, fornecedor_id]);
    if (exists.length > 0) return res.status(409).json({ error: 'Você já possui um anúncio para este produto' });
    const [result] = await pool.query(
      'INSERT INTO ofertas (produto_id, fornecedor_id, preco, estoque, endereco_id) VALUES (?, ?, ?, ?, ?)',
      [produto_id, fornecedor_id, preco, estoque, endereco_id]
    );
    // Busca o anúncio recém-criado
    const [rows] = await pool.query('SELECT * FROM ofertas WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
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
      'UPDATE ofertas SET preco=?, estoque=?, endereco_id=? WHERE id=?',
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
    await pool.query('DELETE FROM ofertas WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover oferta' });
  }
});

// Rotas para avaliações (reviews)
app.get('/avaliacoes', async (req, res) => {
  const { produto_id, fornecedor_id } = req.query;
  try {
    let result;
    if (produto_id) {
      const [rows] = await pool.query(
        `SELECT a.*, u.nome as usuario_nome FROM avaliacoes a
         JOIN usuarios u ON a.usuario_id = u.id
         WHERE a.produto_id = ?
         ORDER BY a.data_avaliacao DESC`,
        [produto_id]
      );
      result = { rows };
    } else if (fornecedor_id) {
      // Busca avaliações de todos os produtos de um fornecedor
      const [rows] = await pool.query(
        `SELECT a.*, u.nome as usuario_nome FROM avaliacoes a
         JOIN usuarios u ON a.usuario_id = u.id
         JOIN ofertas o ON a.produto_id = o.produto_id
         WHERE o.fornecedor_id = ?
         ORDER BY a.data_avaliacao DESC`,
        [fornecedor_id]
      );
      result = { rows };
    } else {
      return res.status(400).json({ error: 'produto_id ou fornecedor_id é obrigatório' });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

app.post('/avaliacoes', async (req, res) => {
  const { usuario_id, produto_id, nota, comentario } = req.body;
  if (!usuario_id || !produto_id || !nota) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  if (nota < 1 || nota > 5) {
    return res.status(400).json({ error: 'Nota deve ser entre 1 e 5' });
  }
  try {
    // Opcional: impedir múltiplas avaliações do mesmo usuário para o mesmo produto
    const [exists] = await pool.query(
      'SELECT 1 FROM avaliacoes WHERE usuario_id = ? AND produto_id = ?',
      [usuario_id, produto_id]
    );
    if (exists.length > 0) {
      return res.status(409).json({ error: 'Você já avaliou este produto' });
    }
    const [result] = await pool.query(
      'INSERT INTO avaliacoes (usuario_id, produto_id, nota, comentario) VALUES (?, ?, ?, ?)',
      [usuario_id, produto_id, nota, comentario || null]
    );
    // Busca a avaliação recém-criada
    const [rows] = await pool.query('SELECT * FROM avaliacoes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar avaliação' });
  }
});

// Rotas para suporte ao usuário
// Listar tickets de um usuário
app.get('/suporte/tickets', async (req, res) => {
  const { usuario_id } = req.query;
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id é obrigatório' });
  try {
    const [rows] = await pool.query(
      'SELECT * FROM suporte_tickets WHERE usuario_id = ? ORDER BY criado_em DESC',
      [usuario_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tickets' });
  }
});

// Abrir novo ticket
app.post('/suporte/tickets', async (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id é obrigatório' });
  try {
    const [result] = await pool.query(
      'INSERT INTO suporte_tickets (usuario_id) VALUES (?)',
      [usuario_id]
    );
    // Busca o ticket recém-criado
    const [rows] = await pool.query('SELECT * FROM suporte_tickets WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao abrir ticket' });
  }
});

// Listar mensagens de um ticket
app.get('/suporte/mensagens', async (req, res) => {
  const { ticket_id } = req.query;
  if (!ticket_id) return res.status(400).json({ error: 'ticket_id é obrigatório' });
  try {
    const [rows] = await pool.query(
      `SELECT m.*, u.nome as remetente_nome FROM suporte_mensagens m
       JOIN usuarios u ON m.remetente_id = u.id
       WHERE m.ticket_id = ? ORDER BY m.enviada_em ASC`,
      [ticket_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// Enviar mensagem em um ticket
app.post('/suporte/mensagens', async (req, res) => {
  const { ticket_id, remetente_id, mensagem } = req.body;
  if (!ticket_id || !remetente_id || !mensagem) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO suporte_mensagens (ticket_id, remetente_id, mensagem) VALUES (?, ?, ?)',
      [ticket_id, remetente_id, mensagem]
    );
    // Busca a mensagem recém-criada
    const [rows] = await pool.query('SELECT * FROM suporte_mensagens WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Alterar status do ticket (encerrar, responder, etc)
app.put('/suporte/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status é obrigatório' });
  try {
    await pool.query(
      'UPDATE suporte_tickets SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status do ticket' });
  }
});

// Rotas para Carrinho de Compras
// Criar ou buscar carrinho (anônimo ou autenticado)
app.post('/carrinho', async (req, res) => {
  const { usuario_id, token } = req.body;
  try {
    let carrinho;
    if (usuario_id) {
      const [rows] = await pool.query('SELECT * FROM carrinhos WHERE usuario_id = ?', [usuario_id]);
      carrinho = rows[0];
      if (!carrinho) {
        const [result] = await pool.query('INSERT INTO carrinhos (usuario_id) VALUES (?)', [usuario_id]);
        const [novoRows] = await pool.query('SELECT * FROM carrinhos WHERE id = ?', [result.insertId]);
        carrinho = novoRows[0];
      }
    } else if (token) {
      const [rows] = await pool.query('SELECT * FROM carrinhos WHERE token = ?', [token]);
      carrinho = rows[0];
      if (!carrinho) {
        const [result] = await pool.query('INSERT INTO carrinhos (token) VALUES (?)', [token]);
        const [novoRows] = await pool.query('SELECT * FROM carrinhos WHERE id = ?', [result.insertId]);
        carrinho = novoRows[0];
      }
    } else {
      return res.status(400).json({ error: 'usuario_id ou token é obrigatório' });
    }
    res.json(carrinho);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar/criar carrinho' });
  }
});

// Buscar itens do carrinho
app.get('/carrinho/:id/itens', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT ic.*, o.preco, o.estoque, p.nome as produto_nome, p.imagem
       FROM itens_carrinho ic
       JOIN ofertas o ON ic.oferta_id = o.id
       JOIN produtos p ON o.produto_id = p.id
       WHERE ic.carrinho_id = ?`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar itens do carrinho' });
  }
});

// Adicionar item ao carrinho
app.post('/carrinho/:id/item', async (req, res) => {
  const { id } = req.params;
  const { oferta_id, quantidade, preco_unitario } = req.body;
  if (!oferta_id || !quantidade || !preco_unitario) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  try {
    // Verifica se já existe o item
    const [exists] = await pool.query('SELECT * FROM itens_carrinho WHERE carrinho_id = ? AND oferta_id = ?', [id, oferta_id]);
    if (exists.length > 0) {
      // Atualiza quantidade
      const novoQtd = exists[0].quantidade + quantidade;
      await pool.query('UPDATE itens_carrinho SET quantidade = ? WHERE id = ?', [novoQtd, exists[0].id]);
      return res.json({ success: true, updated: true });
    }
    await pool.query(
      'INSERT INTO itens_carrinho (carrinho_id, oferta_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
      [id, oferta_id, quantidade, preco_unitario]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar item ao carrinho' });
  }
});

// Atualizar quantidade de um item do carrinho
app.put('/carrinho/item/:item_id', async (req, res) => {
  const { item_id } = req.params;
  const { quantidade } = req.body;
  if (!quantidade) return res.status(400).json({ error: 'quantidade é obrigatória' });
  try {
    await pool.query('UPDATE itens_carrinho SET quantidade = ? WHERE id = ?', [quantidade, item_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar item do carrinho' });
  }
});

// Remover item do carrinho
app.delete('/carrinho/item/:item_id', async (req, res) => {
  const { item_id } = req.params;
  try {
    await pool.query('DELETE FROM itens_carrinho WHERE id = ?', [item_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover item do carrinho' });
  }
});

// Migrar carrinho anônimo para usuário autenticado
app.post('/carrinho/migrar', async (req, res) => {
  const { token, usuario_id } = req.body;
  if (!token || !usuario_id) return res.status(400).json({ error: 'token e usuario_id são obrigatórios' });
  try {
    // Busca carrinho anônimo
    const [rows] = await pool.query('SELECT * FROM carrinhos WHERE token = ?', [token]);
    const carrinho = rows[0];
    if (!carrinho) return res.status(404).json({ error: 'Carrinho não encontrado' });
    // Atualiza carrinho para vincular ao usuário
    await pool.query('UPDATE carrinhos SET usuario_id = ?, token = NULL WHERE id = ?', [usuario_id, carrinho.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao migrar carrinho' });
  }
});

// Rotas para Chat Pós-Compra (cliente <-> fornecedor por pedido)
// Criar chat para um pedido (após pagamento)
app.post('/chat-pedido', async (req, res) => {
  const { pedido_id, cliente_id, fornecedor_id } = req.body;
  if (!pedido_id || !cliente_id || !fornecedor_id) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  try {
    // Garante que não existe chat duplicado
    const [exists] = await pool.query('SELECT * FROM chats_pedido WHERE pedido_id = ? AND fornecedor_id = ?', [pedido_id, fornecedor_id]);
    if (exists.length > 0) return res.json(exists[0]);
    const [result] = await pool.query(
      'INSERT INTO chats_pedido (pedido_id, cliente_id, fornecedor_id) VALUES (?, ?, ?)',
      [pedido_id, cliente_id, fornecedor_id]
    );
    const [novoRows] = await pool.query('SELECT * FROM chats_pedido WHERE id = ?', [result.insertId]);
    res.status(201).json(novoRows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar chat do pedido' });
  }
});

// Buscar chat e mensagens de um pedido
app.get('/chat-pedido/:pedido_id/:fornecedor_id', async (req, res) => {
  const { pedido_id, fornecedor_id } = req.params;
  try {
    const [chatRows] = await pool.query('SELECT * FROM chats_pedido WHERE pedido_id = ? AND fornecedor_id = ?', [pedido_id, fornecedor_id]);
    if (!chatRows[0]) return res.status(404).json({ error: 'Chat não encontrado' });
    const [mensagens] = await pool.query(
      'SELECT m.*, u.nome as remetente_nome FROM mensagens_chat_pedido m JOIN usuarios u ON m.remetente_id = u.id WHERE m.chat_id = ? ORDER BY m.enviada_em ASC',
      [chatRows[0].id]
    );
    res.json({ chat: chatRows[0], mensagens });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar chat/mensagens' });
  }
});

// Enviar mensagem no chat
app.post('/chat-pedido/:chat_id/mensagem', async (req, res) => {
  const { chat_id } = req.params;
  const { remetente_id, mensagem } = req.body;
  if (!remetente_id || !mensagem) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO mensagens_chat_pedido (chat_id, remetente_id, mensagem) VALUES (?, ?, ?)',
      [chat_id, remetente_id, mensagem]
    );
    const [novoRows] = await pool.query('SELECT * FROM mensagens_chat_pedido WHERE id = ?', [result.insertId]);
    res.status(201).json(novoRows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Buscar mensagens do chat
app.get('/chat-pedido/:chat_id/mensagens', async (req, res) => {
  const { chat_id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT m.*, u.nome as remetente_nome FROM mensagens_chat_pedido m JOIN usuarios u ON m.remetente_id = u.id WHERE m.chat_id = ? ORDER BY m.enviada_em ASC',
      [chat_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens do chat' });
  }
});

// Buscar notificações de mensagens não lidas
app.get('/chat-pedido/:chat_id/notificacoes/:destinatario_id', async (req, res) => {
  const { chat_id, destinatario_id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notificacoes_chat_pedido WHERE chat_id = ? AND destinatario_id = ?',
      [chat_id, destinatario_id]
    );
    res.json(rows[0] || { quantidade: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// Marcar mensagens como lidas e zerar notificações
app.put('/chat-pedido/:chat_id/notificacoes/:destinatario_id', async (req, res) => {
  const { chat_id, destinatario_id } = req.params;
  try {
    await pool.query('UPDATE mensagens_chat_pedido SET lida = TRUE WHERE chat_id = ? AND remetente_id != ?', [chat_id, destinatario_id]);
    await pool.query('UPDATE notificacoes_chat_pedido SET quantidade = 0 WHERE chat_id = ? AND destinatario_id = ?', [chat_id, destinatario_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar notificações' });
  }
});

// Rota para atualizar dados do usuário
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha_atual, nova_senha } = req.body;
  
  try {
    // Primeiro verifica se a senha atual está correta
    const [user] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!user[0]) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    if (senha_atual && nova_senha) {
      // Se estiver alterando a senha, verifica a senha atual
      if (user[0].senha !== senha_atual) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }
    }

    // Verifica se o novo email já está em uso
    if (email && email !== user[0].email) {
      const [emailExists] = await pool.query('SELECT 1 FROM usuarios WHERE email = ? AND id != ?', [email, id]);
      if (emailExists.length > 0) {
        return res.status(409).json({ error: 'Este email já está em uso' });
      }
    }

    // Monta a query de atualização dinamicamente
    let updateFields = [];
    let updateValues = [];
    if (nome) {
      updateFields.push('nome = ?');
      updateValues.push(nome);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (nova_senha) {
      const hash = await bcrypt.hash(nova_senha, 10);
      updateFields.push('senha = ?');
      updateValues.push(hash);
    }
    if (updateFields.length > 0) {
      const updateQuery = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
      updateValues.push(id);
      await pool.query(updateQuery, updateValues);
    }

    // Retorna os dados atualizados
    const [updatedUser] = await pool.query(
      'SELECT id, nome, email, tipo_usuario, cnpj FROM usuarios WHERE id = ?',
      [id]
    );

    res.json({ user: updatedUser[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Rota de saúde do servidor e banco de dados
app.get('/health', (_req,res)=>res.send('ok'));
app.get('/db-health', async (_req,res)=>{
  try {
    const [r] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: r?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Inicia o servidor na porta definida ou 3000 por padrão
const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => console.log(`Backend rodando na porta ${PORT}`));
