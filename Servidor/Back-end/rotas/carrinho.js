const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const autenticar = require('../middlewares/autenticacao')

router.use(express.json());

const usersPath = path.join(__dirname, '../data/users.json');
const catalogoPath = path.join(__dirname, '../data/catalogo.json')

router.get('/', autenticar, (req, res) => {
    fs.readFile(usersPath, 'utf8', (err, usersData) => {
        if (err) return res.status(500).json({ mensagem: 'Erro ao ler usuários.' });

        const usuarios = JSON.parse(usersData);
        const usuario = usuarios.find(u => u.id === req.usuarioId);
        if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

        fs.readFile(catalogoPath, 'utf8', (err, catalogoData) => {
            if (err) return res.status(500).json({ mensagem: 'Erro ao ler catálogo.' });
            const catalogo = JSON.parse(catalogoData);

            // Conta quantidades
            const counts = {};
            usuario.produtos.forEach(id => counts[id] = (counts[id] || 0) + 1);

            // Monta lista detalhada, caso haja produtos repetidos eles são contados no mesmo 
            const carrinhoDetalhado = Object.entries(counts).map(([id, qtd]) => {
                const produto = catalogo.find(p => p.id === parseInt(id));
                if (!produto) return null;
                return { ...produto, quantidade: qtd };
            }).filter(Boolean);

            res.json(carrinhoDetalhado);
        });
    });
});

router.post('/adicionar', autenticar, (req, res) => {
    const { produtoId } = req.body;

    if (!produtoId) {
        return res.status(400).json({ mensagem: 'Cliente ou produto não informado.' });
    }

    // Adiciona um novo produto ao carrinho, podendo ser repetido

    fs.readFile('./Back-end/data/users.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo de clientes:', err)
            res.status(500).json({ mensagem: 'Erro ao ler arquivo de clientes.' })
            return
        }

        let clientes = JSON.parse(data);
        const cliente = clientes.find(c => c.id === req.usuarioId)

        if (!cliente) return res.status(404).json({ mensagem: 'Cliente não encontrado.' });


        cliente.produtos.push(produtoId);

        fs.writeFile('./Back-end/data/users.json', JSON.stringify(clientes, null, 2), 'utf8', (err) => {
            if (err) return res.status(500).json({ mensagem: 'Erro ao salvar carrinho.' });

            res.json({ mensagem: 'Produto adicionado ao carrinho com sucesso!' });
        });
    })
});

router.post('/remover', autenticar, (req, res) => {
    const { produtoId } = req.body;
    if (!produtoId) return res.status(400).json({ mensagem: 'Produto não informado.' });

    fs.readFile(usersPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mensagem: 'Erro ao ler usuários.' });

        const clientes = JSON.parse(data);
        const cliente = clientes.find(c => c.id === req.usuarioId);
        if (!cliente) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

        const index = cliente.produtos.indexOf(produtoId);
        if (index !== -1) cliente.produtos.splice(index, 1);

        fs.writeFile(usersPath, JSON.stringify(clientes, null, 2), 'utf8', err => {
            if (err) return res.status(500).json({ mensagem: 'Erro ao salvar carrinho.' });
            res.json({ mensagem: 'Produto removido com sucesso.' });
        });
    });
});

router.post('/remover-todos', autenticar, (req, res) => {
    const { produtoId } = req.body;
    if (!produtoId) return res.status(400).json({ mensagem: 'Produto não informado.' });

    fs.readFile(usersPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mensagem: 'Erro ao ler usuários.' });

        const clientes = JSON.parse(data);
        const cliente = clientes.find(c => c.id === req.usuarioId);
        if (!cliente) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

        // Remove TODAS as ocorrências do produto
        const produtosAntes = cliente.produtos.length;
        cliente.produtos = cliente.produtos.filter(id => id !== produtoId);
        const produtosDepois = cliente.produtos.length;

        if (produtosAntes === produtosDepois) {
            return res.status(404).json({ mensagem: 'Produto não encontrado no carrinho.' });
        }

        fs.writeFile(usersPath, JSON.stringify(clientes, null, 2), 'utf8', err => {
            if (err) return res.status(500).json({ mensagem: 'Erro ao salvar carrinho.' });
            res.json({ mensagem: 'Todos os produtos removidos com sucesso.' });
        });
    });
});

router.post('/alterar-quantidade', autenticar, (req, res) => {
    const { produtoId, quantidade } = req.body;
    if (!produtoId || quantidade < 0) return res.status(400).json({ mensagem: 'Dados inválidos.' });

    fs.readFile(usersPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mensagem: 'Erro ao ler usuários.' });

        const clientes = JSON.parse(data);
        const cliente = clientes.find(c => c.id === req.usuarioId);
        if (!cliente) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

        cliente.produtos = cliente.produtos.filter(id => id !== produtoId);
        for (let i = 0; i < quantidade; i++) cliente.produtos.push(produtoId);

        fs.writeFile(usersPath, JSON.stringify(clientes, null, 2), 'utf8', err => {
            if (err) return res.status(500).json({ mensagem: 'Erro ao salvar carrinho.' });
            res.json({ mensagem: 'Quantidade atualizada com sucesso.' });
        });
    });
});

module.exports = router