-- Contrato compartilhado com o projeto de POO (Java + JDBC).
-- NÃO altere nomes de tabelas ou colunas.
CREATE DATABASE IF NOT EXISTS atendimento_medico
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE atendimento_medico;

CREATE TABLE usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  senha         VARCHAR(255) NOT NULL,       -- hash BCrypt
  perfil        ENUM('medico','secretaria','paciente') NOT NULL,
  crm           VARCHAR(20)  NULL,           -- só médico
  especialidade VARCHAR(80)  NULL,           -- só médico
  cpf           CHAR(11)     NULL UNIQUE,    -- só paciente
  telefone      VARCHAR(20)  NULL,           -- só paciente
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE consultas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id   INT NOT NULL,
  medico_id     INT NOT NULL,
  data_hora     DATETIME NOT NULL,
  status        ENUM('agendada','realizada','cancelada')
                NOT NULL DEFAULT 'agendada',
  observacoes   TEXT NULL,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES usuarios(id),
  FOREIGN KEY (medico_id)   REFERENCES usuarios(id),
  UNIQUE (medico_id, data_hora)
);
