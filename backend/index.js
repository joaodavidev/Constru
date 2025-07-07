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
  const { fornecedor_id, produto_id } = req.query;
  try {
    let rows = [];
    if (fornecedor_id) {
      [rows] = await pool.query(
        `SELECT o.*, p.nome as produto_nome, p.imagem, e.nome_endereco FROM ofertas o
         JOIN produtos p ON o.produto_id = p.id
         JOIN enderecos e ON o.endereco_id = e.id
         WHERE o.fornecedor_id = ?`,
        [fornecedor_id]
      );
    } else if (produto_id) {
      [rows] = await pool.query(
        `SELECT o.*, p.nome as produto_nome, p.imagem, e.nome_endereco FROM ofertas o
         JOIN produtos p ON o.produto_id = p.id
         JOIN enderecos e ON o.endereco_id = e.id
         WHERE o.produto_id = ?`,
        [produto_id]
      );
    } else {
      return res.status(400).json({ error: 'fornecedor_id ou produto_id é obrigatório' });
    }
    // Garante que preco seja número
    const ofertas = rows.map(oferta => ({
      ...oferta,
      preco: Number(oferta.preco)
    }));
    res.json(ofertas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ofertas' });
  }
});

app.post('/ofertas', async (req, res, next) => {
  // Log explícito do corpo recebido
  console.log('POST /ofertas - req.body:', req.body);
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
    console.error('Erro ao criar oferta:', err); // <-- Adiciona log detalhado
    next(err); // Propaga para o middleware global de erro
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

// Rotas para avaliações (reviews)
app.get('/avaliacoes', async (req, res) => {
  const { produto_id, fornecedor_id } = req.query;
  try {
    let result;
    if (produto_id) {
      result = await pool.query(
        `SELECT a.*, u.nome as usuario_nome FROM avaliacoes a
         JOIN usuarios u ON a.usuario_id = u.id
         WHERE a.produto_id = $1
         ORDER BY a.data_avaliacao DESC`,
        [produto_id]
      );
    } else if (fornecedor_id) {
      // Busca avaliações de todos os produtos de um fornecedor
      result = await pool.query(
        `SELECT a.*, u.nome as usuario_nome FROM avaliacoes a
         JOIN usuarios u ON a.usuario_id = u.id
         JOIN ofertas o ON a.produto_id = o.produto_id
         WHERE o.fornecedor_id = $1
         ORDER BY a.data_avaliacao DESC`,
        [fornecedor_id]
      );
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
    const exists = await pool.query(
      'SELECT 1 FROM avaliacoes WHERE usuario_id = $1 AND produto_id = $2',
      [usuario_id, produto_id]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Você já avaliou este produto' });
    }
    const result = await pool.query(
      'INSERT INTO avaliacoes (usuario_id, produto_id, nota, comentario) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, produto_id, nota, comentario || null]
    );
    res.status(201).json(result.rows[0]);
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
    const result = await pool.query(
      'SELECT * FROM suporte_tickets WHERE usuario_id = $1 ORDER BY criado_em DESC',
      [usuario_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tickets' });
  }
});

// Abrir novo ticket
app.post('/suporte/tickets', async (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id é obrigatório' });
  try {
    const result = await pool.query(
      'INSERT INTO suporte_tickets (usuario_id) VALUES ($1) RETURNING *',
      [usuario_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao abrir ticket' });
  }
});

// Listar mensagens de um ticket
app.get('/suporte/mensagens', async (req, res) => {
  const { ticket_id } = req.query;
  if (!ticket_id) return res.status(400).json({ error: 'ticket_id é obrigatório' });
  try {
    const result = await pool.query(
      `SELECT m.*, u.nome as remetente_nome FROM suporte_mensagens m
       JOIN usuarios u ON m.remetente_id = u.id
       WHERE m.ticket_id = $1 ORDER BY m.enviada_em ASC`,
      [ticket_id]
    );
    res.json(result.rows);
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
    const result = await pool.query(
      'INSERT INTO suporte_mensagens (ticket_id, remetente_id, mensagem) VALUES ($1, $2, $3) RETURNING *',
      [ticket_id, remetente_id, mensagem]
    );
    res.status(201).json(result.rows[0]);
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
      'UPDATE suporte_tickets SET status = $1 WHERE id = $2',
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
      const result = await pool.query('SELECT * FROM carrinhos WHERE usuario_id = $1', [usuario_id]);
      carrinho = result.rows[0];
      if (!carrinho) {
        const novo = await pool.query('INSERT INTO carrinhos (usuario_id) VALUES ($1) RETURNING *', [usuario_id]);
        carrinho = novo.rows[0];
      }
    } else if (token) {
      const result = await pool.query('SELECT * FROM carrinhos WHERE token = $1', [token]);
      carrinho = result.rows[0];
      if (!carrinho) {
        const novo = await pool.query('INSERT INTO carrinhos (token) VALUES ($1) RETURNING *', [token]);
        carrinho = novo.rows[0];
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
    const result = await pool.query(
      `SELECT ic.*, o.preco, o.estoque, p.nome as produto_nome, p.imagem
       FROM itens_carrinho ic
       JOIN ofertas o ON ic.oferta_id = o.id
       JOIN produtos p ON o.produto_id = p.id
       WHERE ic.carrinho_id = $1`,
      [id]
    );
    res.json(result.rows);
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
    const exists = await pool.query('SELECT * FROM itens_carrinho WHERE carrinho_id = $1 AND oferta_id = $2', [id, oferta_id]);
    if (exists.rows.length > 0) {
      // Atualiza quantidade
      const novoQtd = exists.rows[0].quantidade + quantidade;
      await pool.query('UPDATE itens_carrinho SET quantidade = $1 WHERE id = $2', [novoQtd, exists.rows[0].id]);
      return res.json({ success: true, updated: true });
    }
    await pool.query(
      'INSERT INTO itens_carrinho (carrinho_id, oferta_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
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
    await pool.query('UPDATE itens_carrinho SET quantidade = $1 WHERE id = $2', [quantidade, item_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar item do carrinho' });
  }
});

// Remover item do carrinho
app.delete('/carrinho/item/:item_id', async (req, res) => {
  const { item_id } = req.params;
  try {
    await pool.query('DELETE FROM itens_carrinho WHERE id = $1', [item_id]);
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
    const result = await pool.query('SELECT * FROM carrinhos WHERE token = $1', [token]);
    const carrinho = result.rows[0];
    if (!carrinho) return res.status(404).json({ error: 'Carrinho não encontrado' });
    // Atualiza carrinho para vincular ao usuário
    await pool.query('UPDATE carrinhos SET usuario_id = $1, token = NULL WHERE id = $2', [usuario_id, carrinho.id]);
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
    const exists = await pool.query('SELECT * FROM chats_pedido WHERE pedido_id = $1 AND fornecedor_id = $2', [pedido_id, fornecedor_id]);
    if (exists.rows.length > 0) return res.json(exists.rows[0]);
    const result = await pool.query(
      'INSERT INTO chats_pedido (pedido_id, cliente_id, fornecedor_id) VALUES ($1, $2, $3) RETURNING *',
      [pedido_id, cliente_id, fornecedor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar chat do pedido' });
  }
});

// Buscar chat e mensagens de um pedido
app.get('/chat-pedido/:pedido_id/:fornecedor_id', async (req, res) => {
  const { pedido_id, fornecedor_id } = req.params;
  try {
    const chat = await pool.query('SELECT * FROM chats_pedido WHERE pedido_id = $1 AND fornecedor_id = $2', [pedido_id, fornecedor_id]);
    if (chat.rows.length === 0) return res.status(404).json({ error: 'Chat não encontrado' });
    const mensagens = await pool.query(
      'SELECT m.*, u.nome as remetente_nome FROM mensagens_chat_pedido m JOIN usuarios u ON m.remetente_id = u.id WHERE m.chat_id = $1 ORDER BY m.enviada_em ASC',
      [chat.rows[0].id]
    );
    res.json({ chat: chat.rows[0], mensagens: mensagens.rows });
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
    const result = await pool.query(
      'INSERT INTO mensagens_chat_pedido (chat_id, remetente_id, mensagem) VALUES ($1, $2, $3) RETURNING *',
      [chat_id, remetente_id, mensagem]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Buscar mensagens do chat
app.get('/chat-pedido/:chat_id/mensagens', async (req, res) => {
  const { chat_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT m.*, u.nome as remetente_nome FROM mensagens_chat_pedido m JOIN usuarios u ON m.remetente_id = u.id WHERE m.chat_id = $1 ORDER BY m.enviada_em ASC',
      [chat_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens do chat' });
  }
});

// Buscar notificações de mensagens não lidas
app.get('/chat-pedido/:chat_id/notificacoes/:destinatario_id', async (req, res) => {
  const { chat_id, destinatario_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM notificacoes_chat_pedido WHERE chat_id = $1 AND destinatario_id = $2',
      [chat_id, destinatario_id]
    );
    res.json(result.rows[0] || { quantidade: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// Marcar mensagens como lidas e zerar notificações
app.put('/chat-pedido/:chat_id/notificacoes/:destinatario_id', async (req, res) => {
  const { chat_id, destinatario_id } = req.params;
  try {
    await pool.query('UPDATE mensagens_chat_pedido SET lida = TRUE WHERE chat_id = $1 AND remetente_id != $2', [chat_id, destinatario_id]);
    await pool.query('UPDATE notificacoes_chat_pedido SET quantidade = 0 WHERE chat_id = $1 AND destinatario_id = $2', [chat_id, destinatario_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar notificações' });
  }
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
