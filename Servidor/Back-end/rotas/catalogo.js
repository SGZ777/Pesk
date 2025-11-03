const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

router.use(express.static(path.join(__dirname, 'Front')))

router.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'Front', 'catalogo.html'))
})
// Entra em uma rota de acordo coma id do produto
router.get('/:id', (req, res) => {
    fs.readFile('./Back-end/data/catalogo.json', 'utf8', (err, catalogos) => {
        if (err) {
            res.status(500).send(`Falha ao ler o arquivo JSON: ${err}`)
            console.error(`Falha ao ler o arquivo JSON: ${err}`)
            return
        }
        try {
            const catalogo = JSON.parse(catalogos)
            const id = parseInt(req.params.id)
            // Verifica a id do parametro
            const idCerta = catalogo.find(function (produto) {
                return produto.id === id
            })
            fs.readFile('./Front-end/telaproduto.html', 'utf8', (erro, produto) => {
                if (erro) {
                    console.error('Erro ao ler HTML:', erro);
                    res.status(500).send('Erro ao carregar página.');
                    return;
                }

                let paginaFinal = null 
                

                // Substitui os elementos na pagina modelo
                try {
                    paginaFinal = produto
                    paginaFinal = paginaFinal.replaceAll('[nome]', idCerta.nome)
                    paginaFinal = paginaFinal.replaceAll('[descricao]', idCerta.descricao)
                    paginaFinal = paginaFinal.replaceAll('[preco]', idCerta.preco.toFixed(2))
                    paginaFinal = paginaFinal.replaceAll('imagens[0]', idCerta.imagens[0])
                    paginaFinal = paginaFinal.replaceAll('imagens[1]', idCerta.imagens[1])
                    paginaFinal = paginaFinal.replaceAll('imagens[2]', idCerta.imagens[2])
                    paginaFinal = paginaFinal.replaceAll('[parcelas]', (idCerta.preco/5).toFixed(2))
                } catch (error) {
                    
                }

                if (!paginaFinal) {
                    // res.status(500).send('Erro ao processar página.');
                    return;
                }
                res.status(200).send(paginaFinal)
            })
        } catch (error) {
            res.status(500).send("Erro ao converter o arquivo para JSON: ", error)
            console.error("Erro ao converter o arquivo para JSON: ", error)
        }
    })
})



module.exports = router