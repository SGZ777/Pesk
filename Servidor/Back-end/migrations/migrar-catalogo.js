const pool = require('../config/database')
const catalogo = require('../data/catalogo.json')

async function migrar() {
    console.log('Iniciando migração...')

    for (const produto of catalogo) {
        await pool.query(
            'INSERT INTO produto (id, nome, descr, preco, imagens) VALUES (?, ?, ?, ?, ?)',
            [produto.id, produto.nome, produto.descricao, produto.preco, JSON.stringify(produto.imagens)]
        )
        console.log(`✔ Produto ${produto.id} - ${produto.nome}`)
    }

    console.log('Migração concluída!')
    process.exit()
}

migrar().catch(err => {
    console.error('Erro na migração:', err)
    process.exit(1)
})