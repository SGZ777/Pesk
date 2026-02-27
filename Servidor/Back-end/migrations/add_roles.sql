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
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: password (troque!)
  'admin'
);
