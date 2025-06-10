import { Request, Response } from 'express';
import Produto from '../models/produto.model';

export const listarProdutos = async (req: Request, res: Response) => {
  const produtos = await Produto.find();
  res.json(produtos);
};

export const criarProduto = async (req: Request, res: Response) => {
  const novoProduto = new Produto(req.body);
  const produtoSalvo = await novoProduto.save();
  res.status(201).json(produtoSalvo);
};