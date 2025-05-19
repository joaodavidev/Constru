import express from 'express';
import cors from 'cors';
import produtoRoutes from './routes/produto.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/produtos', produtoRoutes);

export default app;