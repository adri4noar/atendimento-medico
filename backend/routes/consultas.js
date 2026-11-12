const express = require('express');
const Consulta = require('../models/Consulta');

const router = express.Router();

// 1ª entrega: rotas ainda sem proteção. Na 2ª, todas exigem token (RN07/RN08).

// POST /api/consultas  (RF02 + RN02)
router.post('/', async (req, res, next) => {
  try {
    const consulta = await Consulta.criar(req.body);
    res.status(201).json({ mensagem: 'Consulta agendada com sucesso.', consulta });
  } catch (erro) {
    next(erro);
  }
});

// GET /api/consultas  (RF03)
router.get('/', async (req, res, next) => {
  try {
    const consultas = await Consulta.listar();
    res.status(200).json(consultas);
  } catch (erro) {
    next(erro);
  }
});

// PATCH /api/consultas/:id  (RF04: status, observações e remarcação)
router.patch('/:id', async (req, res, next) => {
  try {
    const consulta = await Consulta.atualizar(req.params.id, req.body);
    res.status(200).json({ mensagem: 'Consulta atualizada com sucesso.', consulta });
  } catch (erro) {
    next(erro);
  }
});

// 2ª entrega: GET /medico, GET /minhas, PATCH /:id/atendimento.

module.exports = router;
