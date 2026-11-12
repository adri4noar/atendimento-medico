const bcrypt = require('bcryptjs');
const pool = require('../db');
const ErroApi = require('../utils/ErroApi');

const PERFIS = ['medico', 'secretaria', 'paciente'];
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Colunas devolvidas pela API (a senha NUNCA sai do banco pela API).
const COLUNAS_PUBLICAS =
  'id, nome, email, perfil, crm, especialidade, cpf, telefone, criado_em, atualizado_em';

function textoOuNulo(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto === '' ? null : texto;
}

// RN01: valida e normaliza os dados antes do INSERT.
function validar(dados) {
  if (!dados || typeof dados !== 'object') {
    throw new ErroApi(400, 'Envie os dados do usuário em JSON.');
  }

  const nome = textoOuNulo(dados.nome);
  const email = textoOuNulo(dados.email);
  const senha = typeof dados.senha === 'string' ? dados.senha : '';
  const perfil = textoOuNulo(dados.perfil);

  if (!nome) throw new ErroApi(400, 'O nome é obrigatório.');
  if (nome.length > 120) throw new ErroApi(400, 'O nome deve ter no máximo 120 caracteres.');

  if (!email) throw new ErroApi(400, 'O e-mail é obrigatório.');
  if (!REGEX_EMAIL.test(email)) throw new ErroApi(400, 'E-mail inválido.');
  if (email.length > 160) throw new ErroApi(400, 'O e-mail deve ter no máximo 160 caracteres.');

  if (senha.length < 6) throw new ErroApi(400, 'A senha deve ter no mínimo 6 caracteres.');

  if (!PERFIS.includes(perfil)) {
    throw new ErroApi(400, 'Perfil inválido. Use medico, secretaria ou paciente.');
  }

  const usuario = {
    nome,
    email: email.toLowerCase(),
    senha,
    perfil,
    crm: null,
    especialidade: null,
    cpf: null,
    telefone: null,
  };

  // Campos específicos de cada perfil (os demais ficam NULL).
  if (perfil === 'medico') {
    usuario.crm = textoOuNulo(dados.crm);
    usuario.especialidade = textoOuNulo(dados.especialidade);
    if (usuario.crm && usuario.crm.length > 20) {
      throw new ErroApi(400, 'O CRM deve ter no máximo 20 caracteres.');
    }
    if (usuario.especialidade && usuario.especialidade.length > 80) {
      throw new ErroApi(400, 'A especialidade deve ter no máximo 80 caracteres.');
    }
  }

  if (perfil === 'paciente') {
    const cpf = textoOuNulo(dados.cpf);
    if (cpf) {
      const somenteDigitos = cpf.replace(/\D/g, '');
      if (somenteDigitos.length !== 11) {
        throw new ErroApi(400, 'O CPF deve ter 11 dígitos.');
      }
      usuario.cpf = somenteDigitos;
    }
    usuario.telefone = textoOuNulo(dados.telefone);
    if (usuario.telefone && usuario.telefone.length > 20) {
      throw new ErroApi(400, 'O telefone deve ter no máximo 20 caracteres.');
    }
  }

  return usuario;
}

async function criar(dados) {
  const u = validar(dados);

  // A coluna senha guarda hash BCrypt (contrato com o projeto de POO).
  const hash = await bcrypt.hash(u.senha, 10);

  const [resultado] = await pool.execute(
    `INSERT INTO usuarios (nome, email, senha, perfil, crm, especialidade, cpf, telefone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [u.nome, u.email, hash, u.perfil, u.crm, u.especialidade, u.cpf, u.telefone]
  );

  return buscarPorId(resultado.insertId);
}

async function buscarPorId(id) {
  const [linhas] = await pool.execute(
    `SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE id = ?`,
    [id]
  );
  return linhas[0] || null;
}

// Inclui a senha (hash): uso interno, para o login da 2ª entrega.
async function buscarPorEmail(email) {
  const [linhas] = await pool.execute(
    'SELECT * FROM usuarios WHERE email = ?',
    [String(email).trim().toLowerCase()]
  );
  return linhas[0] || null;
}

module.exports = { PERFIS, criar, buscarPorId, buscarPorEmail };
