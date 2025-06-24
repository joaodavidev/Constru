CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario VARCHAR(20) NOT NULL,
  cpf CHAR(11),
  cnpj CHAR(18),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enderecos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  nome_endereco VARCHAR(50) NOT NULL,
  rua VARCHAR(100),
  numero VARCHAR(10),
  complemento VARCHAR(50),
  bairro VARCHAR(50),
  cidade VARCHAR(50),
  estado CHAR(2),
  cep CHAR(9),
  UNIQUE KEY (usuario_id, nome_endereco),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  categoria_id INT,
  imagem VARCHAR(255),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS ofertas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  fornecedor_id INT NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  estoque INT NOT NULL,
  endereco_id INT NOT NULL,
  UNIQUE KEY (produto_id, fornecedor_id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (fornecedor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (endereco_id) REFERENCES enderecos(id)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT,
  data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_pagamento VARCHAR(20),
  valor_total DECIMAL(10, 2),
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  oferta_id INT,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (oferta_id) REFERENCES ofertas(id)
);

CREATE TABLE IF NOT EXISTS avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  produto_id INT,
  nota INT,
  comentario TEXT,
  data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  produto_id INT,
  UNIQUE KEY (usuario_id, produto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE IF NOT EXISTS historico_visualizacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  produto_id INT,
  data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE IF NOT EXISTS suporte_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  status VARCHAR(20) DEFAULT 'aberto',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS suporte_mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT,
  remetente_id INT,
  mensagem TEXT NOT NULL,
  enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES suporte_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (remetente_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS carrinhos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  token VARCHAR(100),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS itens_carrinho (
  id INT AUTO_INCREMENT PRIMARY KEY,
  carrinho_id INT,
  oferta_id INT,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (carrinho_id) REFERENCES carrinhos(id) ON DELETE CASCADE,
  FOREIGN KEY (oferta_id) REFERENCES ofertas(id)
);

CREATE TABLE IF NOT EXISTS chats_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  cliente_id INT,
  fornecedor_id INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  FOREIGN KEY (fornecedor_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS mensagens_chat_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT,
  remetente_id INT,
  mensagem TEXT NOT NULL,
  lida TINYINT(1) DEFAULT 0,
  enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats_pedido(id) ON DELETE CASCADE,
  FOREIGN KEY (remetente_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS notificacoes_chat_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT,
  destinatario_id INT,
  quantidade INT DEFAULT 0,
  FOREIGN KEY (chat_id) REFERENCES chats_pedido(id) ON DELETE CASCADE,
  FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
);
