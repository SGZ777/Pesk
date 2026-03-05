-- 1. Adicionar coluna role e created_at na tabela user
ALTER TABLE user 
  ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Atualizar os status possíveis do pedido
ALTER TABLE pedido 
  MODIFY COLUMN status ENUM('Carrinho', 'Pendente', 'Cancelado', 'Finalizado') DEFAULT 'Carrinho',
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. Criar um usuário admin padrão (senha: admin123 — troque após o primeiro login)
-- Hash bcrypt de 'admin123' com salt 10:
INSERT INTO user (nome, email, CPF, tel, senha, role) 
VALUES (
  'Administrador', 
  'admin@pesk.com', 
  '00000000000', 
  '00000000000',
  '$2b$10$8Q0jPf9ujzN8RojZAIQu8uSWUdie7p9pKxFWabEWb.uPkLId8FaNS', -- senha: password (troque!)
  'admin'
);

DELETE FROM user WHERE id = 2;
delete from produto where id = 1;
select * from user;

ALTER TABLE produto MODIFY descr TEXT NOT NULL;

ALTER TABLE produto ADD COLUMN imagens JSON;

DELETE FROM produto;

