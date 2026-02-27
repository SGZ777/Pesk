const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const pool = require('../config/database')

router.use(express.static('./Front-end/catalogo.html'))

router.get('/', (req, res) => {
    res.status(200).sendFile('./Front-end/catalogo.html')
})

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).send('ID inválido.')

    try {
        const [rows] = await pool.query(
            'SELECT * FROM produto WHERE id = ?', [id]
        )

        const produto = rows[0]
        if (!produto) return res.status(404).send('Produto não encontrado.')

        fs.readFile('./Front/telaproduto.html', 'utf8', (err, html) => {
            if (err) return (
                res.status(500).send('Erro ao carregar página.')
            )

            const paginaFinal = html
                .replaceAll('[nome]', produto.nome)
                .replaceAll('[descricao]', produto.descr)
                .replaceAll('[preco]', (parseFloat(produto.preco) || 0).toFixed(2))
                .replaceAll('[parcelas]', ((parseFloat(produto.preco) || 0) / 5).toFixed(2))
                .replaceAll('imagens[0]', JSON.parse(produto.imagens)[0])
                .replaceAll('imagens[1]', JSON.parse(produto.imagens)[1])
                .replaceAll('imagens[2]', JSON.parse(produto.imagens)[2])

            res.status(200).send(paginaFinal)
        })

    } catch (err) {
        console.error(err)
        res.status(500).send('Erro ao buscar produto.')
    }
})

module.exports = router