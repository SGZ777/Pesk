const express = require('express')
const router = express.Router()
const pool = require('../config/database')
const { autenticar, apenasAdmin } = require('../middlewares/autenticacao')

router.use(express.json())
router.use(autenticar, apenasAdmin)

// ─── USUÁRIOS ────────────────────────────────────────────────────────────────

// GET /admin/usuarios — lista todos os usuários
router.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, nome, email, role, created_at FROM user ORDER BY created_at DESC'
        )
        res.json(rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao buscar usuários.' })
    }
})

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────

// GET /admin/pedidos — lista todos os pedidos com valor total
router.get('/pedidos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.nro_pedido,
                u.nome AS usuario,
                u.email,
                p.status,
                p.created_at,
                COALESCE(SUM(pr.preco * ip.qtd), 0) AS valor_total
            FROM pedido p
            JOIN user u ON u.id = p.id_cliente
            LEFT JOIN item_pedido ip ON ip.nro_pedido = p.nro_pedido
            LEFT JOIN produto pr ON pr.id = ip.id_produto
            WHERE p.status != 'Carrinho'
            GROUP BY p.nro_pedido, u.nome, u.email, p.status, p.created_at
            ORDER BY p.created_at DESC
        `)
        res.json(rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao buscar pedidos.' })
    }
})

// GET /admin/pedidos/:id/itens — detalhe de um pedido
router.get('/pedidos/:id/itens', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT pr.id, pr.nome, pr.preco, ip.qtd, (pr.preco * ip.qtd) AS subtotal
            FROM item_pedido ip
            JOIN produto pr ON pr.id = ip.id_produto
            WHERE ip.nro_pedido = ?
        `, [req.params.id])
        res.json(rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao buscar itens do pedido.' })
    }
})

// PATCH /admin/pedidos/:id/status — atualiza status
router.patch('/pedidos/:id/status', async (req, res) => {
    const { status } = req.body
    const statusValidos = ['Pendente', 'Cancelado', 'Finalizado']

    if (!statusValidos.includes(status)) {
        return res.status(400).json({ error: 'Status inválido. Use: Pendente, Cancelado ou Finalizado.' })
    }

    try {
        const [result] = await pool.query(
            "UPDATE pedido SET status = ? WHERE nro_pedido = ? AND status != 'Carrinho'",
            [status, req.params.id]
        )
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado ou não pode ser alterado.' })
        }
        res.json({ mensagem: 'Status atualizado com sucesso.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao atualizar status.' })
    }
})

// ─── PRODUTOS ────────────────────────────────────────────────────────────────

// GET /admin/produtos — lista todos os produtos
router.get('/produtos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM produto ORDER BY id')
        res.json(rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao buscar produtos.' })
    }
})

// POST /admin/produtos — cria novo produto
router.post('/produtos', async (req, res) => {
    const { nome, descr, preco, imagens } = req.body
    if (!nome || !descr || !preco) {
        return res.status(400).json({ error: 'Nome, descrição e preço são obrigatórios.' })
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO produto (nome, descr, preco, imagens) VALUES (?, ?, ?, ?)',
            [nome, descr, parseFloat(preco), imagens ? JSON.stringify(imagens) : null]
        )
        res.status(201).json({ mensagem: 'Produto criado com sucesso.', id: result.insertId })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao criar produto.' })
    }
})

// PUT /admin/produtos/:id — edita produto
router.put('/produtos/:id', async (req, res) => {
    const { nome, descr, preco, imagens } = req.body
    if (!nome || !descr || !preco) {
        return res.status(400).json({ error: 'Nome, descrição e preço são obrigatórios.' })
    }

    try {
        const [result] = await pool.query(
            'UPDATE produto SET nome = ?, descr = ?, preco = ?, imagens = ? WHERE id = ?',
            [nome, descr, parseFloat(preco), imagens ? JSON.stringify(imagens) : null, req.params.id]
        )
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado.' })
        res.json({ mensagem: 'Produto atualizado com sucesso.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao atualizar produto.' })
    }
})

// DELETE /admin/produtos/:id — exclui produto
router.delete('/produtos/:id', async (req, res) => {
    try {
        // Remove dos carrinhos/pedidos primeiro para evitar FK constraint
        await pool.query('DELETE FROM item_pedido WHERE id_produto = ?', [req.params.id])

        const [result] = await pool.query('DELETE FROM produto WHERE id = ?', [req.params.id])
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado.' })

        res.json({ mensagem: 'Produto excluído com sucesso.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao excluir produto.' })
    }
})

module.exports = router
