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
  rua VARCHAR(100),
  numero VARCHAR(10),
  complemento VARCHAR(50),
  bairro VARCHAR(50),
  cidade VARCHAR(50),
  estado CHAR(2),
  cep CHAR(9)
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
  produto_id INT REFERENCES produtos(id) ON DELETE CASCADE,
  fornecedor_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  preco DECIMAL(10, 2) NOT NULL,
  estoque INT DEFAULT 0,
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