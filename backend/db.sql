CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('cliente', 'fornecedor', 'admin')),
  cpf CHAR(11),
  cnpj CHAR(18),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enderecos (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  nome_endereco VARCHAR(50) NOT NULL,
  rua VARCHAR(100),
  numero VARCHAR(10),
  complemento VARCHAR(50),
  bairro VARCHAR(50),
  cidade VARCHAR(50),
  estado CHAR(2),
  cep CHAR(9),
  UNIQUE (usuario_id, nome_endereco)
);

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  categoria_id INT REFERENCES categorias(id),
  imagem VARCHAR(255)
);

CREATE TABLE ofertas (
  id SERIAL PRIMARY KEY,
  produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  fornecedor_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  preco DECIMAL(10, 2) NOT NULL CHECK (preco > 0),
  estoque INT NOT NULL CHECK (estoque >= 0),
  endereco_id INT NOT NULL REFERENCES enderecos(id),
  UNIQUE (produto_id, fornecedor_id)
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES usuarios(id),
  data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_pagamento VARCHAR(20) CHECK (status_pagamento IN ('pendente', 'pago', 'cancelado')),
  valor_total DECIMAL(10, 2)
);

CREATE TABLE itens_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
  oferta_id INT REFERENCES ofertas(id),
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL
);

CREATE TABLE avaliacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  produto_id INT REFERENCES produtos(id),
  nota INT CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favoritos (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  produto_id INT REFERENCES produtos(id),
  UNIQUE (usuario_id, produto_id)
);

CREATE TABLE historico_visualizacao (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  produto_id INT REFERENCES produtos(id),
  data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suporte_tickets (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto', 'respondido', 'encerrado')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suporte_mensagens (
  id SERIAL PRIMARY KEY,
  ticket_id INT REFERENCES suporte_tickets(id) ON DELETE CASCADE,
  remetente_id INT REFERENCES usuarios(id),
  mensagem TEXT NOT NULL,
  enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carrinho de compras persistente
CREATE TABLE IF NOT EXISTS carrinhos (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id), -- pode ser NULL para anônimo
  token VARCHAR(100), -- identificador para carrinho anônimo
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itens_carrinho (
  id SERIAL PRIMARY KEY,
  carrinho_id INT REFERENCES carrinhos(id) ON DELETE CASCADE,
  oferta_id INT REFERENCES ofertas(id),
  quantidade INT NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10,2) NOT NULL
);

-- Chat pós-compra entre cliente e fornecedor por pedido
CREATE TABLE IF NOT EXISTS chats_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
  cliente_id INT REFERENCES usuarios(id),
  fornecedor_id INT REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mensagens_chat_pedido (
  id SERIAL PRIMARY KEY,
  chat_id INT REFERENCES chats_pedido(id) ON DELETE CASCADE,
  remetente_id INT REFERENCES usuarios(id),
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notificações de mensagens não lidas por chat
CREATE TABLE IF NOT EXISTS notificacoes_chat_pedido (
  id SERIAL PRIMARY KEY,
  chat_id INT REFERENCES chats_pedido(id) ON DELETE CASCADE,
  destinatario_id INT REFERENCES usuarios(id),
  quantidade INT DEFAULT 0
);