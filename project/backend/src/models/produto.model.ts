import mongoose, { Document, Schema } from 'mongoose';

export interface IProduto extends Document {
  nome: string;
  preco: number;
  descricao?: string;
}

const ProdutoSchema = new Schema<IProduto>({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  descricao: { type: String },
});

export default mongoose.model<IProduto>('Produto', ProdutoSchema);