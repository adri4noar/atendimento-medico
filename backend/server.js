require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const ErroApi = require('./utils/ErroApi');
const authRoutes = require('./routes/auth');
const consultasRoutes = require('./routes/consultas');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' })); // RNF03
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/consultas', consultasRoutes);

// Rota inexistente → 404 em JSON.
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Tratamento central de erros (RNF01 e RNF02: sem stack trace nem SQL na resposta).
app.use((erro, req, res, next) => {
  if (erro instanceof ErroApi) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  // JSON mal formatado no corpo da requisição.
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }

  // Violação de UNIQUE no MySQL (RN01 e RN02).
  if (erro.code === 'ER_DUP_ENTRY') {
    // sqlMessage: "Duplicate entry '...' for key 'usuarios.email'"
    const chave = ((erro.sqlMessage || '').match(/for key '([^']+)'/) || [])[1] || '';
    let mensagem = 'Registro duplicado.';
    if (chave.endsWith('email')) mensagem = 'E-mail já cadastrado.';
    else if (chave.endsWith('cpf')) mensagem = 'CPF já cadastrado.';
    else if (chave.endsWith('medico_id')) mensagem = 'O médico já tem uma consulta neste horário.';
    return res.status(400).json({ erro: mensagem });
  }

  console.error('Erro inesperado:', erro);
  return res.status(500).json({ erro: 'Erro interno do servidor. Tente novamente mais tarde.' });
});

// RN03: só começa a ouvir depois que o MySQL responde.
async function iniciar() {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL conectado');
    app.listen(PORT, () => console.log(`API na porta ${PORT}`));
  } catch (erro) {
    console.error('Erro ao conectar no MySQL:', erro.message);
    process.exit(1);
  }
}

iniciar();
