export interface Endereco {
  id: number;
  usuario_id: number;
  nome_endereco: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Oferta {
  id: number;
  produto_id: number;
  fornecedor_id: number;
  preco: number;
  estoque: number;
  endereco_id: number;
  produto_nome?: string;
  produto_imagem?: string;
  nome_endereco?: string;
}
