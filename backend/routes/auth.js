const express = require('express');
const Usuario = require('../models/Usuario');

const router = express.Router();

// POST /api/auth/register  (RF01 + RN01)
// 1ª entrega: rota ainda sem proteção. Na 2ª, apenas a secretária poderá usá-la.
router.post('/register', async (req, res, next) => {
  try {
    const usuario = await Usuario.criar(req.body);
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', usuario });
  } catch (erro) {
    next(erro);
  }
});

// POST /api/auth/login → 2ª entrega (RN05/RN06).

module.exports = router;
