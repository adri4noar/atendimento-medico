USE atendimento_medico;

INSERT INTO usuarios (nome, email, senha, perfil, crm, especialidade, cpf, telefone) VALUES
('Ana Secretária',  'ana@clinica.com',    '123456', 'secretaria', NULL, NULL, NULL, NULL),
('Dr. Carlos Lima', 'carlos@clinica.com', '123456', 'medico', 'CRM-PB 1234', 'Cardiologia', NULL, NULL),
('Dra. Marta Souza','marta@clinica.com',  '123456', 'medico', 'CRM-PB 5678', 'Pediatria', NULL, NULL),
('João Pereira',    'joao@email.com',     '123456', 'paciente', NULL, NULL, '11111111111', '83999990001'),
('Maria Alves',     'maria@email.com',    '123456', 'paciente', NULL, NULL, '22222222222', '83999990002'),
('Pedro Santos',    'pedro@email.com',    '123456', 'paciente', NULL, NULL, '33333333333', '83999990003');

INSERT INTO consultas (paciente_id, medico_id, data_hora, status, observacoes) VALUES
(4, 2, '2026-11-20 09:00:00', 'agendada',  NULL),
(5, 2, '2026-11-20 10:00:00', 'agendada',  NULL),
(6, 3, '2026-11-05 14:00:00', 'realizada', 'Paciente em bom estado.'),
(4, 3, '2026-11-02 08:30:00', 'cancelada', NULL);
