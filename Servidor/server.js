const express = require('express')
const app = express()
const port = 3000
const path = require('path')

const rotaCatalogo = require('./Back-end/rotas/catalogo')
const rotaEntrar = require('./Back-end/rotas/login')
const logger = require('./Back-end/middlewares/logger')
// const autenticar = require('./Back-end/middlewares/autenticacao')

app.use('/catalogo', rotaCatalogo)
app.use('/entrar', rotaEntrar)

app.use(express.json())
app.use(logger)
app.use(express.static(path.join(__dirname, 'Front-end')))

app.use('/catalogo', rotaCatalogo)
app.use('/entrar', rotaEntrar)

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'Front-end', 'home.html'))
})

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
})