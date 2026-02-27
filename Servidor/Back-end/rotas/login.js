const express = require('express')
const router = express.Router()
const pool = require('../config/database')
const tokensAtivos = require('../middlewares/token')
const bcrypt = require('bcryptjs')

router.use(express.json())

function gerarToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36)
}

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios.' })

    try {
        const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email])
        const usuario = rows[0]

        if (!usuario) return res.status(401).json({ error: 'Usuário ou senha incorretos' })

        const senhaCorreta = await bcrypt.compare(password, usuario.senha)
        if (!senhaCorreta) return res.status(401).json({ error: 'Usuário ou senha incorretos' })

        const token = gerarToken()
        tokensAtivos[token] = { id: usuario.id, role: usuario.role }

        res.json({ token, role: usuario.role, nome: usuario.nome })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

router.post('/cadastro', async (req, res) => {
    const { nomeCompleto, email, password, CPF, tel } = req.body
    if (!nomeCompleto || !email || !password || !CPF) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' })
    }

    try {
        const [existe] = await pool.query('SELECT id FROM user WHERE email = ?', [email])
        if (existe.length > 0) return res.status(400).json({ error: 'Email já cadastrado' })

        const hash = await bcrypt.hash(password, 10)

        const [result] = await pool.query(
            'INSERT INTO user (nome, email, CPF, tel, senha, role) VALUES (?, ?, ?, ?, ?, ?)',
            [nomeCompleto, email, CPF || '00000000000', tel || null, hash, 'user']
        )

        const token = gerarToken()
        tokensAtivos[token] = { id: result.insertId, role: 'user' }

        res.json({ token, role: 'user', nome: nomeCompleto })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

module.exports = router
