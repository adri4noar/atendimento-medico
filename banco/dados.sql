-- Dados iniciais (fictícios).
--
-- ATENÇÃO: substitua este arquivo pelo banco/dados.sql do projeto de POO,
-- que já traz a primeira secretária e os médicos com senhas em hash BCrypt.
--
-- Enquanto isso, os usuários podem ser criados pela própria API:
--   POST http://localhost:5000/api/auth/register
-- (ver backend/postman/atendimento-medico.postman_collection.json)

USE atendimento_medico;

-- Exemplo de formato (descomente e troque o hash por um hash BCrypt real):
-- INSERT INTO usuarios (nome, email, senha, perfil, crm, especialidade) VALUES
--   ('Dra. Ana Souza', 'ana.souza@clinica.com', '$2a$10$...', 'medico', 'CRM-PB 12345', 'Clínica Geral');
-- INSERT INTO usuarios (nome, email, senha, perfil) VALUES
--   ('Carla Lima', 'carla.lima@clinica.com', '$2a$10$...', 'secretaria');
