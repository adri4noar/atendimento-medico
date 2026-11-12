// Erro "esperado" da API: carrega o status HTTP e uma mensagem em português
// que pode ser mostrada ao cliente (sem detalhes internos).
class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

module.exports = ErroApi;
