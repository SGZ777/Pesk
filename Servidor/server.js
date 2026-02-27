const express = require('express')
const path = require('path')

const logger = require('./Back-end/middlewares/logger')
const loginRouter = require('./Back-end/rotas/login')
const carrinhoRouter = require('./Back-end/rotas/carrinho')
const catalogoRouter = require('./Back-end/rotas/catalogo')
const adminRouter = require('./Back-end/rotas/admin')
const pedidosRouter = require('./Back-end/rotas/meusPedidos')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(logger)
app.use(express.static(path.join(__dirname, 'Front')))

app.use('/entrar', loginRouter)
app.use('/carrinho', carrinhoRouter)
app.use('/catalogo', catalogoRouter)
app.use('/admin', adminRouter)
app.use('/meus-pedidos', pedidosRouter)

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'Front', 'home.html'))
})

app.use((req, res) => {
    res.status(404).json({ error: 'Rota nao encontrada.' })
})

app.listen(PORT, () => {
    console.log('Servidor rodando em http://localhost:' + PORT)
})