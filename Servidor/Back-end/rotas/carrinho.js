const express = require('express')
const router = express.Router()
const pool = require('../config/database')
const { autenticar } = require('../middlewares/autenticacao')


router.use(express.json())

// Busca ou cria o pedido-carrinho do usuário
async function getPedidoCarrinho(userId) {
    const [rows] = await pool.query(
        "SELECT nro_pedido FROM pedido WHERE id_cliente = ? AND status = 'Carrinho' LIMIT 1",
        [userId]
    )
    if (rows.length > 0) return rows[0].nro_pedido

    const [result] = await pool.query(
        "INSERT INTO pedido (id_cliente, status) VALUES (?, 'Carrinho')",
        [userId]
    )
    return result.insertId
}

// GET /carrinho — listar itens
router.get('/', autenticar, async (req, res) => {
    try {
        const nroPedido = await getPedidoCarrinho(req.usuarioId)

        const [itens] = await pool.query(
            `SELECT p.id, p.nome, p.descr as descricao, p.preco, ip.qtd as quantidade
             FROM item_pedido ip
             JOIN produto p ON p.id = ip.id_produto
             WHERE ip.nro_pedido = ?`,
            [nroPedido]
        )
        res.json(itens)
    } catch (err) {
        console.error(err)
        res.status(500).json({ mensagem: 'Erro ao buscar carrinho.' })
    }
})

// POST /carrinho/adicionar
router.post('/adicionar', autenticar, async (req, res) => {
    const { produtoId } = req.body
    if (!produtoId) return res.status(400).json({ mensagem: 'Produto não informado.' })

    try {
        const nroPedido = await getPedidoCarrinho(req.usuarioId)

        const [existe] = await pool.query(
            'SELECT qtd FROM item_pedido WHERE nro_pedido = ? AND id_produto = ?',
            [nroPedido, produtoId]
        )

        if (existe.length > 0) {
            await pool.query(
                'UPDATE item_pedido SET qtd = qtd + 1 WHERE nro_pedido = ? AND id_produto = ?',
                [nroPedido, produtoId]
            )
        } else {
            await pool.query(
                'INSERT INTO item_pedido (nro_pedido, id_cliente, id_produto, qtd) VALUES (?, ?, ?, 1)',
                [nroPedido, req.usuarioId, produtoId]
            )
        }

        res.json({ mensagem: 'Produto adicionado ao carrinho!' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ mensagem: 'Erro ao adicionar produto.' })
    }
})

// POST /carrinho/remover — remove 1 unidade
router.post('/remover', autenticar, async (req, res) => {
    const { produtoId } = req.body
    if (!produtoId) return res.status(400).json({ mensagem: 'Produto não informado.' })

    try {
        const nroPedido = await getPedidoCarrinho(req.usuarioId)

        const [item] = await pool.query(
            'SELECT qtd FROM item_pedido WHERE nro_pedido = ? AND id_produto = ?',
            [nroPedido, produtoId]
        )

        if (item.length === 0) return res.status(404).json({ mensagem: 'Produto não encontrado no carrinho.' })

        if (item[0].qtd > 1) {
            await pool.query(
                'UPDATE item_pedido SET qtd = qtd - 1 WHERE nro_pedido = ? AND id_produto = ?',
                [nroPedido, produtoId]
            )
        } else {
            await pool.query(
                'DELETE FROM item_pedido WHERE nro_pedido = ? AND id_produto = ?',
                [nroPedido, produtoId]
            )
        }

        res.json({ mensagem: 'Produto removido com sucesso.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ mensagem: 'Erro ao remover produto.' })
    }
})

// POST /carrinho/remover-todos — remove todas as unidades do produto
router.post('/remover-todos', autenticar, async (req, res) => {
    const { produtoId } = req.body
    if (!produtoId) return res.status(400).json({ mensagem: 'Produto não informado.' })

    try {
        const nroPedido = await getPedidoCarrinho(req.usuarioId)

        await pool.query(
            'DELETE FROM item_pedido WHERE nro_pedido = ? AND id_produto = ?',
            [nroPedido, produtoId]
        )

        res.json({ mensagem: 'Todos os produtos removidos com sucesso.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ mensagem: 'Erro ao remover produtos.' })
    }
})

// POST /carrinho/alterar-quantidade
router.post('/alterar-quantidade', autenticar, async (req, res) => {
    const { produtoId, quantidade } = req.body
    if (!produtoId || quantidade < 0) return res.status(400).json({ mensagem: 'Dados inválidos.' })

    try {
        const nroPedido = await getPedidoCarrinho(req.usuarioId)

        if (quantidade === 0) {
            await pool.query(
                'DELETE FROM item_pedido WHERE nro_pedido = ? AND id_produto = ?',
                [nroPedido, produtoId]
            )
        } else {
            await pool.query(
                `INSERT INTO item_pedido (nro_pedido, id_cliente, id_produto, qtd)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE qtd = ?`,
                [nroPedido, req.usuarioId, produtoId, quantidade, quantidade]
            )
        }

        res.json({ mensagem: 'Quantidade atualizada com sucesso.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ mensagem: 'Erro ao atualizar quantidade.' })
    }
})

module.exports = router