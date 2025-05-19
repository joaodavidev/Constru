import app from './app';
import { connectDatabase } from './config/database';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 5000;

connectDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});