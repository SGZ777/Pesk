const express = require('express')
const router = express.Router()
const fs = require('fs')
const { console } = require('inspector')
const path = require('path')
const { json } = require('stream/consumers')
const tokensAtivos = require('../middlewares/token')


router.use(express.json())

function gerarToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

router.post('/login', (req, res) => {
    // Coleta os dados enviados do FrontEnd
    const { email, password } = req.body
    console.log(email, password)

    fs.readFile('./Back-end/data/users.json', 'utf8', (err, users) => {
        if (err) {
            res.status(500).send(`Falha ao ler o arquivo JSON: ${err}`)
            console.error(`Falha ao ler o arquivo JSON: ${err}`)
            return
        }
        const usuarios = JSON.parse(users)
        // Verifica se o usuario coincide com alfum do banco de dados do Json
        const usuario = usuarios.find(function (user) {
            return (user.email === email && user.password === password)
        })
        if (!usuario) return res.status(401).json({ error: "Usuário ou senha incorretos" })

        // Gera o Token para verificar o login do usuario
        const token = gerarToken()
        tokensAtivos[token] = usuario.id
        res.json({ token })
    })
})

router.post('/cadastro', (req, res) => {
    // coleta os dados Vindo do frontEnd
    const { nomeCompleto, email, password } = req.body;
    console.log('sla', email)

    fs.readFile('./Back-end/data/users.json', 'utf8', (err, data) => {
        if (err) {
            console.error(`Falha ao ler o arquivo JSON: ${err}`);
            return res.status(500).json({ error: 'Falha ao ler o arquivo JSON' });
        }
        try {
            const usuarios = JSON.parse(data);
            console.log('sla', nomeCompleto)
            // Verifica se usuario já existe
            if (usuarios.some(u => u.email === email)) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }
            const novoUsuario = {
                id: usuarios.length + 1, email: email, password: password, nome: nomeCompleto, produtos: []
            }
            usuarios.push(novoUsuario)
            // Adiciona o novo user ao Json
            fs.writeFile('./Back-end/data/users.json', JSON.stringify(usuarios, null, 2), err => {
                if (err) {
                    console.error(`Falha ao escrever o arquivo: ${err}`);
                    return res.status(500).json({ error: 'Falha ao criar usuário' });
                }

                // Gera o Token para verificar o login do usuario
                const token = gerarToken();
                tokensAtivos[token] = novoUsuario.id;
                res.json({ token });
            });
        } catch (error) {
            console.error("Erro ao converter JSON:", error);
            res.status(500).json({ error: 'Erro ao converter o arquivo JSON' });
        }
    });
})

module.exports = router