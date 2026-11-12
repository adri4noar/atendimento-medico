# Sistema de Atendimento Médico

Projeto da disciplina **Criar serviços Web com REST (2026.2)**: sistema web de atendimento médico
com React, Node.js, Express e MySQL, com três perfis de usuário (médico, secretária e paciente).

- **1ª entrega (este estado do repositório):** backend em Node.js + Express conectado ao MySQL.
- **2ª entrega:** frontend React, senha com bcrypt no login, JWT e middleware de controle de acesso.

## Estrutura

```
atendimento-medico/
├── banco/                  # schema.sql e dados.sql (contrato com o projeto de POO)
└── backend/
    ├── db.js               # pool de conexões mysql2
    ├── models/Usuario.js   # SQL parametrizado + validação RN01
    ├── models/Consulta.js  # SQL parametrizado + validação RN02
    ├── routes/auth.js      # POST /api/auth/register
    ├── routes/consultas.js # POST, GET e PATCH /api/consultas
    ├── middleware/auth.js  # 2ª entrega
    ├── utils/ErroApi.js    # erro com status HTTP e mensagem em português
    ├── postman/            # coleção de testes para importar no Postman
    ├── .env.example
    ├── package.json
    └── server.js
```

## Como executar

Pré-requisitos: **Node.js LTS** (`node -v`, `npm -v`) e **MySQL 8** rodando.

1. Crie o banco executando `banco/schema.sql` no MySQL Workbench (ou DBeaver).
   Em seguida, execute `banco/dados.sql` (use o arquivo do projeto de POO).
2. Configure o backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env     # no Windows: copy .env.example .env
   ```
   Edite o `.env` com a senha do seu MySQL (`DB_PASSWORD`).
3. Inicie a API:
   ```bash
   npm run dev
   ```
   Saída esperada:
   ```
   MySQL conectado
   API na porta 5000
   ```

## Rotas da 1ª entrega

Base: `http://localhost:5000/api`

| Método | Rota | Descrição | Respostas |
|---|---|---|---|
| POST | `/auth/register` | Cadastra usuário (RF01) | 201, 400 |
| POST | `/consultas` | Agenda consulta (RF02) | 201, 400 |
| GET | `/consultas` | Lista consultas com nomes de paciente e médico (RF03) | 200 |
| PATCH | `/consultas/:id` | Altera status, observações e/ou data_hora (RF04) | 200, 400, 404 |

### Exemplos

Cadastro de usuário:

```json
POST /api/auth/register
{
  "nome": "João Pereira",
  "email": "joao.pereira@email.com",
  "senha": "123456",
  "perfil": "paciente",
  "cpf": "123.456.789-09",
  "telefone": "(83) 99999-0000"
}
```

Campos opcionais por perfil: `crm` e `especialidade` (médico); `cpf` e `telefone` (paciente).

Agendamento:

```json
POST /api/consultas
{ "paciente_id": 3, "medico_id": 1, "data_hora": "2026-11-20 14:30" }
```

Alteração (qualquer combinação dos campos):

```json
PATCH /api/consultas/1
{ "status": "realizada", "observacoes": "Retorno em 30 dias." }
```

Todas as respostas são JSON. Erros vêm no formato `{ "erro": "mensagem em português" }`.

### Testes

Importe `backend/postman/atendimento-medico.postman_collection.json` no Postman (ou Insomnia)
e execute as requisições **na ordem**. Os IDs criados ficam salvos nas variáveis da coleção.
Antes de repetir os testes, apague os registros ou troque os e-mails, porque o e-mail é único.

## Regras implementadas

- **RN01:** nome obrigatório; e-mail obrigatório, válido, único e gravado em minúsculas; senha com
  no mínimo 6 caracteres; perfil `medico`, `secretaria` ou `paciente`. E-mail ou CPF repetido
  (`ER_DUP_ENTRY`) gera 400.
- **RN02:** `paciente_id` precisa ter perfil paciente e `medico_id` perfil médico; `data_hora`
  obrigatória e válida; status `agendada`, `realizada` ou `cancelada`; o mesmo médico não pode ter
  duas consultas no mesmo horário (400, inclusive ao remarcar).
- **RN03:** a API executa `SELECT 1` e só chama `app.listen` depois que o MySQL responde.
- **RNF01:** 201 para criação; 200 para consulta e alteração; 400 para dados inválidos; 404 para
  recurso inexistente.
- **RNF02:** todo SQL usa `pool.execute` com parâmetros `?`. Erros inesperados devolvem uma
  mensagem genérica, sem stack trace nem SQL.
- **RNF03:** CORS liberado apenas para `http://localhost:5173`.

## Interpretações adotadas

1. **Senha já com hash bcrypt (custo 10):** a coluna `senha` do schema guarda hash BCrypt e o
   `dados.sql` do projeto de POO usa jBCrypt. O hash na 1ª entrega mantém o banco coerente
   entre os dois projetos. A senha e o hash nunca são devolvidos pela API.
2. **Remarcação pelo PATCH `/consultas/:id`:** além de `status` e `observacoes` (RF04), a rota
   aceita `data_hora`, já que a seção 3.4 indica "remarcar, cancelar" para ela.
3. **ID de paciente ou médico inexistente ao agendar:** retorna **400** (dado enviado inválido).
   O 404 fica para a consulta inexistente em `/consultas/:id`.
4. **Formato de data/hora:** aceita `AAAA-MM-DD HH:MM`, com ou sem segundos, separado por espaço
   ou `T`. A API devolve no formato `AAAA-MM-DD HH:MM:SS`, sem conversão de fuso (`dateStrings`).
5. **CPF:** aceita com ou sem máscara e é gravado com 11 dígitos.

> Use apenas dados fictícios.
