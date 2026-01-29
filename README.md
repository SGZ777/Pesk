🐟 Pesk

Pesk é uma plataforma web completa para apaixonados por pesca.
O projeto conta com frontend moderno em HTML/CSS/Bootstrap, integração com backend Node.js/Express, autenticação com JWT, logger, e armazenamento de dados em arquivos JSON.

🚀 Funcionalidades principais
🖥️ Front-end

Página inicial com carrossel de produtos e anúncios

Busca dinâmica por categorias (iscas, varas, molinetes, etc.)

Sessão de lançamentos e promoções

Integração com o PeskClub✦ (assinatura mensal)

Páginas de cadastro e login com feedback visual

Layout responsivo com Bootstrap 5 e fontes personalizadas

⚙️ Back-end

API desenvolvida em Node.js + Express

Logger para monitoramento de requisições e erros

Manipulação de dados usando arquivos JSON:

catalogo.json: produtos e categorias

usuarios.json: cadastro de usuários, senhas e dados de login

Rotas REST para login, cadastro, carrinho e PeskClub

📁 Estrutura do Projeto
Pesk/
├── frontend/
│   ├── home.html
│   ├── cadastro.html
│   ├── peskclub.html
│   ├── style.css
│   └── imagens/
│       ├── icones/
│       ├── Anuncios/
│       ├── Categorias/
│       └── Produtos/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── entrar.js
│   │   ├── carrinho.js
│   │   └── club.js
│   ├── middleware/
│   │   ├── autenticacao.js
│   │   ├── logger.js
│   │   └── token.js
│   ├── data/
│   │   ├── catalogo.json
│   │   └── users.json
│   └── package.json

🔐 Autenticação

A autenticação é feita via JWT (JSON Web Token):

Após o login, o token é salvo no localStorage do navegador.

As rotas protegidas do backend exigem o token no header:

Authorization: Bearer <token>


O token é validado no middleware auth.js.

🧠 Tecnologias usadas

Front-end:

HTML5, CSS3, JavaScript

Bootstrap 5

Google Fonts (Nunito, Lovelo)

Back-end:

Node.js

Express

Middleware Logger

Manipulação de arquivos JSON

⚙️ Como rodar o projeto
1️⃣ Clonar o repositório
git clone https://github.com/seuusuario/pesk.git
cd pesk

2️⃣ Instalar dependências
cd backend
npm install

3️⃣ Rodar o servidor
node server.js


O servidor iniciará em:
👉 http://localhost:3000

4️⃣ Acessar o site

Abra frontend/home.html no navegador.
