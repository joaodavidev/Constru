const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const pool = require('./db');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API está funcionando');
});

// Exemplo de rota: listar usuários
app.get('/usuarios', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM usuarios');
  res.json(rows);
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    if (user.senha !== senha) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
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
    const [exists] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists.length > 0) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, tipo_usuario, cnpj) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senha, tipo_usuario, cnpj || null]
    );
    const [userRows] = await pool.query('SELECT id, nome, email, tipo_usuario, cnpj FROM usuarios WHERE id = ?', [result.insertId]);
    res.status(201).json({ user: userRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Atualizar dados do usuário
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, tipo_usuario, cpf, cnpj } = req.body;
  if (!nome && !email && !senha && !tipo_usuario && !cpf && !cnpj) {
    return res.status(400).json({ error: 'Nenhum dado para atualizar.' });
  }
  try {
    // Monta dinamicamente os campos a serem atualizados
    const fields = [];
    const values = [];
    if (nome) { fields.push('nome = ?'); values.push(nome); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (senha) { fields.push('senha = ?'); values.push(senha); }
    if (tipo_usuario) { fields.push('tipo_usuario = ?'); values.push(tipo_usuario); }
    if (cpf) { fields.push('cpf = ?'); values.push(cpf); }
    if (cnpj) { fields.push('cnpj = ?'); values.push(cnpj); }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
    }
    values.push(id);
    await pool.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, values);
    const [userRows] = await pool.query('SELECT id, nome, email, tipo_usuario, cpf, cnpj FROM usuarios WHERE id = ?', [id]);
    res.json({ user: userRows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
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
      'INSERT INTO enderecos (usuario_id, nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep) VALUES (?,?,?,?,?,?,?,?,?)',
      [usuario_id, nome_endereco, rua, numero, complemento, bairro, cidade, estado, cep]
    );
    const [endRows] = await pool.query('SELECT * FROM enderecos WHERE id = ?', [result.insertId]);
    res.status(201).json(endRows[0]);
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
    const [vinculo] = await pool.query('SELECT 1 FROM ofertas WHERE endereco_id = ?', [id]);
    if (vinculo.length > 0) {
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
  const { fornecedor_id } = req.query;
  if (!fornecedor_id) return res.status(400).json({ error: 'fornecedor_id é obrigatório' });
  try {
    const [rows] = await pool.query(
      `SELECT o.*, p.nome as produto_nome, p.imagem, e.nome_endereco FROM ofertas o
       JOIN produtos p ON o.produto_id = p.id
       JOIN enderecos e ON o.endereco_id = e.id
       WHERE o.fornecedor_id = ?`,
      [fornecedor_id]
    );
    res.json(rows);
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
    const [exists] = await pool.query('SELECT 1 FROM ofertas WHERE produto_id = ? AND fornecedor_id = ?', [produto_id, fornecedor_id]);
    if (exists.length > 0) return res.status(409).json({ error: 'Você já possui um anúncio para este produto' });
    const [result] = await pool.query(
      'INSERT INTO ofertas (produto_id, fornecedor_id, preco, estoque, endereco_id) VALUES (?,?,?,?,?)',
      [produto_id, fornecedor_id, preco, estoque, endereco_id]
    );
    const [ofertaRows] = await pool.query('SELECT * FROM ofertas WHERE id = ?', [result.insertId]);
    res.status(201).json(ofertaRows[0]);
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
    let rows;
    if (produto_id) {
      [rows] = await pool.query(
        `SELECT a.*, u.nome as usuario_nome FROM avaliacoes a
         JOIN usuarios u ON a.usuario_id = u.id
         WHERE a.produto_id = ?
         ORDER BY a.data_avaliacao DESC`,
        [produto_id]
      );
    } else if (fornecedor_id) {
      [rows] = await pool.query(
        `SELECT a.*, u.nome as usuario_nome FROM avaliacoes a
         JOIN usuarios u ON a.usuario_id = u.id
         JOIN ofertas o ON a.produto_id = o.produto_id
         WHERE o.fornecedor_id = ?
         ORDER BY a.data_avaliacao DESC`,
        [fornecedor_id]
      );
    } else {
      return res.status(400).json({ error: 'produto_id ou fornecedor_id é obrigatório' });
    }
    res.json(rows);
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
    const [avaliacaoRows] = await pool.query('SELECT * FROM avaliacoes WHERE id = ?', [result.insertId]);
    res.status(201).json(avaliacaoRows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar avaliação' });
  }
});

// Rotas para suporte ao usuário
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

app.post('/suporte/tickets', async (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id é obrigatório' });
  try {
    const [result] = await pool.query(
      'INSERT INTO suporte_tickets (usuario_id) VALUES (?)',
      [usuario_id]
    );
    const [ticketRows] = await pool.query('SELECT * FROM suporte_tickets WHERE id = ?', [result.insertId]);
    res.status(201).json(ticketRows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao abrir ticket' });
  }
});

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
    const [msgRows] = await pool.query('SELECT * FROM suporte_mensagens WHERE id = ?', [result.insertId]);
    res.status(201).json(msgRows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

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

// Deletar ticket de suporte
app.delete('/suporte/tickets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Remove mensagens vinculadas (ON DELETE CASCADE já cobre, mas por segurança)
    await pool.query('DELETE FROM suporte_mensagens WHERE ticket_id = ?', [id]);
    await pool.query('DELETE FROM suporte_tickets WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar ticket' });
  }
});

// Rotas para Carrinho de Compras
// Criar ou buscar carrinho (anônimo ou autenticado)
app.post('/carrinho', async (req, res) => {
  const { usuario_id, token } = req.body;
  try {
    let carrinho;
    if (usuario_id) {
      const result = await pool.query('SELECT * FROM carrinhos WHERE usuario_id = ?', [usuario_id]);
      carrinho = result[0];
      if (!carrinho) {
        const novo = await pool.query('INSERT INTO carrinhos (usuario_id) VALUES (?)', [usuario_id]);
        carrinho = novo[0];
      }
    } else if (token) {
      const result = await pool.query('SELECT * FROM carrinhos WHERE token = ?', [token]);
      carrinho = result[0];
      if (!carrinho) {
        const novo = await pool.query('INSERT INTO carrinhos (token) VALUES (?)', [token]);
        carrinho = novo[0];
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
       WHERE ic.carrinho_id = ?`,
      [id]
    );
    res.json(result[0]);
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
    const exists = await pool.query('SELECT * FROM itens_carrinho WHERE carrinho_id = ? AND oferta_id = ?', [id, oferta_id]);
    if (exists[0].length > 0) {
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
    const result = await pool.query('SELECT * FROM carrinhos WHERE token = ?', [token]);
    const carrinho = result[0];
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
    const exists = await pool.query('SELECT * FROM chats_pedido WHERE pedido_id = ? AND fornecedor_id = ?', [pedido_id, fornecedor_id]);
    if (exists[0].length > 0) return res.json(exists[0]);
    const result = await pool.query(
      'INSERT INTO chats_pedido (pedido_id, cliente_id, fornecedor_id) VALUES (?, ?, ?)',
      [pedido_id, cliente_id, fornecedor_id]
    );
    const [chat] = await pool.query('SELECT * FROM chats_pedido WHERE id = ?', [result.insertId]);
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar chat do pedido' });
  }
});

// Buscar chat e mensagens de um pedido
app.get('/chat-pedido/:pedido_id/:fornecedor_id', async (req, res) => {
  const { pedido_id, fornecedor_id } = req.params;
  try {
    const chat = await pool.query('SELECT * FROM chats_pedido WHERE pedido_id = ? AND fornecedor_id = ?', [pedido_id, fornecedor_id]);
    if (chat[0].length === 0) return res.status(404).json({ error: 'Chat não encontrado' });
    const mensagens = await pool.query(
      'SELECT m.*, u.nome as remetente_nome FROM mensagens_chat_pedido m JOIN usuarios u ON m.remetente_id = u.id WHERE m.chat_id = ? ORDER BY m.enviada_em ASC',
      [chat[0].id]
    );
    res.json({ chat: chat[0], mensagens: mensagens[0] });
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
      'INSERT INTO mensagens_chat_pedido (chat_id, remetente_id, mensagem) VALUES (?, ?, ?)',
      [chat_id, remetente_id, mensagem]
    );
    const [mensagemEnviada] = await pool.query('SELECT * FROM mensagens_chat_pedido WHERE id = ?', [result.insertId]);
    res.status(201).json(mensagemEnviada);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Buscar mensagens do chat
app.get('/chat-pedido/:chat_id/mensagens', async (req, res) => {
  const { chat_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT m.*, u.nome as remetente_nome FROM mensagens_chat_pedido m JOIN usuarios u ON m.remetente_id = u.id WHERE m.chat_id = ? ORDER BY m.enviada_em ASC',
      [chat_id]
    );
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens do chat' });
  }
});

// Buscar notificações de mensagens não lidas
app.get('/chat-pedido/:chat_id/notificacoes/:destinatario_id', async (req, res) => {
  const { chat_id, destinatario_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM notificacoes_chat_pedido WHERE chat_id = ? AND destinatario_id = ?',
      [chat_id, destinatario_id]
    );
    res.json(result[0] || { quantidade: 0 });
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

app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
