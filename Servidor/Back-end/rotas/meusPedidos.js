const express = require('express')
const router = express.Router()
const pool = require('../config/database')
const { autenticar, apenasUser } = require('../middlewares/autenticacao')

router.use(express.json())

// GET /meus-pedidos — lista pedidos do usuário logado
router.get('/', autenticar, apenasUser, async (req, res) => {
    try {
        const [pedidos] = await pool.query(`
            SELECT 
                p.nro_pedido,
                p.status,
                p.created_at,
                COALESCE(SUM(pr.preco * ip.qtd), 0) AS valor_total
            FROM pedido p
            LEFT JOIN item_pedido ip ON ip.nro_pedido = p.nro_pedido
            LEFT JOIN produto pr ON pr.id = ip.id_produto
            WHERE p.id_cliente = ? AND p.status != 'Carrinho'
            GROUP BY p.nro_pedido, p.status, p.created_at
            ORDER BY p.created_at DESC
        `, [req.usuarioId])

        // Para cada pedido, busca os itens
        for (const pedido of pedidos) {
            const [itens] = await pool.query(`
                SELECT pr.nome, pr.preco, ip.qtd, (pr.preco * ip.qtd) AS subtotal
                FROM item_pedido ip
                JOIN produto pr ON pr.id = ip.id_produto
                WHERE ip.nro_pedido = ?
            `, [pedido.nro_pedido])
            pedido.itens = itens
        }

        res.json(pedidos)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao buscar pedidos.' })
    }
})

module.exports = router
