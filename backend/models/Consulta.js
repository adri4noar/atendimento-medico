const pool = require('../db');
const ErroApi = require('../utils/ErroApi');

const STATUS = ['agendada', 'realizada', 'cancelada'];

// Consulta com os nomes do paciente e do médico (RF03: JOIN com usuarios).
const SELECT_COM_NOMES = `
  SELECT c.id,
         c.paciente_id, p.nome AS paciente_nome,
         c.medico_id,   m.nome AS medico_nome, m.especialidade AS medico_especialidade,
         c.data_hora, c.status, c.observacoes, c.criado_em, c.atualizado_em
    FROM consultas c
    JOIN usuarios p ON p.id = c.paciente_id
    JOIN usuarios m ON m.id = c.medico_id`;

function idValido(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Aceita "AAAA-MM-DD HH:MM", "AAAA-MM-DD HH:MM:SS" ou com "T" no lugar do espaço.
// Devolve no formato do MySQL: "AAAA-MM-DD HH:MM:SS".
function normalizarDataHora(valor) {
  if (typeof valor !== 'string') return null;
  const m = valor.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;

  const [, ano, mes, dia, hora, minuto, segundo = '00'] = m;
  const d = new Date(Date.UTC(+ano, +mes - 1, +dia, +hora, +minuto, +segundo));
  const confere =
    d.getUTCFullYear() === +ano &&
    d.getUTCMonth() === +mes - 1 &&
    d.getUTCDate() === +dia &&
    d.getUTCHours() === +hora &&
    d.getUTCMinutes() === +minuto &&
    d.getUTCSeconds() === +segundo;
  if (!confere) return null;

  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

function validarDataHora(valor) {
  if (valor === undefined || valor === null || valor === '') {
    throw new ErroApi(400, 'A data/hora da consulta é obrigatória.');
  }
  const dataHora = normalizarDataHora(valor);
  if (!dataHora) {
    throw new ErroApi(400, 'Data/hora inválida. Use o formato AAAA-MM-DD HH:MM.');
  }
  return dataHora;
}

function validarStatus(valor) {
  if (!STATUS.includes(valor)) {
    throw new ErroApi(400, 'Status inválido. Use agendada, realizada ou cancelada.');
  }
  return valor;
}

function validarObservacoes(valor) {
  if (valor === null) return null;
  if (typeof valor !== 'string') {
    throw new ErroApi(400, 'As observações devem ser um texto.');
  }
  return valor.trim() === '' ? null : valor.trim();
}

// RN02: o id precisa existir e ser de um usuário com o perfil esperado.
async function conferirPerfil(id, perfilEsperado, rotulo) {
  const [linhas] = await pool.execute('SELECT perfil FROM usuarios WHERE id = ?', [id]);
  if (linhas.length === 0) {
    throw new ErroApi(400, `${rotulo} não encontrado.`);
  }
  if (linhas[0].perfil !== perfilEsperado) {
    throw new ErroApi(400, `O usuário informado como ${rotulo.toLowerCase()} não tem perfil ${perfilEsperado}.`);
  }
}

async function criar(dados) {
  if (!dados || typeof dados !== 'object') {
    throw new ErroApi(400, 'Envie os dados da consulta em JSON.');
  }

  const pacienteId = idValido(dados.paciente_id);
  const medicoId = idValido(dados.medico_id);
  if (!pacienteId) throw new ErroApi(400, 'O paciente_id é obrigatório e deve ser um número inteiro.');
  if (!medicoId) throw new ErroApi(400, 'O medico_id é obrigatório e deve ser um número inteiro.');

  const dataHora = validarDataHora(dados.data_hora);
  const status = dados.status === undefined ? 'agendada' : validarStatus(dados.status);
  const observacoes = dados.observacoes === undefined ? null : validarObservacoes(dados.observacoes);

  await conferirPerfil(pacienteId, 'paciente', 'Paciente');
  await conferirPerfil(medicoId, 'medico', 'Médico');

  // Horário repetido para o mesmo médico: o UNIQUE(medico_id, data_hora)
  // gera ER_DUP_ENTRY, tratado como 400 no server.js.
  const [resultado] = await pool.execute(
    `INSERT INTO consultas (paciente_id, medico_id, data_hora, status, observacoes)
     VALUES (?, ?, ?, ?, ?)`,
    [pacienteId, medicoId, dataHora, status, observacoes]
  );

  return buscarPorId(resultado.insertId);
}

async function listar() {
  const [linhas] = await pool.execute(`${SELECT_COM_NOMES} ORDER BY c.data_hora`);
  return linhas;
}

async function buscarPorId(id) {
  const [linhas] = await pool.execute(`${SELECT_COM_NOMES} WHERE c.id = ?`, [id]);
  return linhas[0] || null;
}

// RF04: altera status e observações; data_hora permite remarcar.
async function atualizar(id, dados) {
  const consultaId = idValido(id);
  if (!consultaId) throw new ErroApi(400, 'ID da consulta inválido.');

  if (!dados || typeof dados !== 'object') {
    throw new ErroApi(400, 'Envie os dados da alteração em JSON.');
  }

  // Nomes de coluna vêm desta lista fixa; os valores sempre vão como parâmetros (?).
  const campos = [];
  const valores = [];

  if (dados.status !== undefined) {
    campos.push('status = ?');
    valores.push(validarStatus(dados.status));
  }
  if (dados.observacoes !== undefined) {
    campos.push('observacoes = ?');
    valores.push(validarObservacoes(dados.observacoes));
  }
  if (dados.data_hora !== undefined) {
    campos.push('data_hora = ?');
    valores.push(validarDataHora(dados.data_hora));
  }

  if (campos.length === 0) {
    throw new ErroApi(400, 'Informe ao menos um campo para alterar: status, observacoes ou data_hora.');
  }

  const existente = await buscarPorId(consultaId);
  if (!existente) throw new ErroApi(404, 'Consulta não encontrada.');

  await pool.execute(
    `UPDATE consultas SET ${campos.join(', ')} WHERE id = ?`,
    [...valores, consultaId]
  );

  return buscarPorId(consultaId);
}

module.exports = { STATUS, criar, listar, buscarPorId, atualizar };
