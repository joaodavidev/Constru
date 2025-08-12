import { Request, Response } from 'express';
const pool = require('../../db');

export const listarProdutos = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

export const criarProduto = async (req: Request, res: Response) => {
  const { nome, preco, descricao } = req.body;
  if (!nome || !preco) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO produtos (nome, preco, descricao) VALUES (?, ?, ?)',
      [nome, preco, descricao || null]
    );
    const [rows] = await pool.query('SELECT * FROM produtos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
};