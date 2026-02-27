const tokensAtivos = require('./token')

// Verifica se o usuário está autenticado
function autenticar(req, res, next) {
    const authHeader = req.headers['authorization']
    if (!authHeader) return res.status(401).json({ error: 'Header Authorization ausente' })

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Formato do Authorization inválido' })
    }

    const token = parts[1]
    const sessao = tokensAtivos[token]
    if (!sessao) return res.status(401).json({ error: 'É necessário fazer login!' })

    req.usuarioId = sessao.id
    req.usuarioRole = sessao.role
    next()
}

// Verifica se o usuário é admin (usar após autenticar)
function apenasAdmin(req, res, next) {
    if (req.usuarioRole !== 'admin') {
        return res.status(403).json({ error: 'Acesso restrito a administradores.' })
    }
    next()
}

// Verifica se o usuário é user comum (não admin)
function apenasUser(req, res, next) {
    if (req.usuarioRole !== 'user') {
        return res.status(403).json({ error: 'Rota disponível apenas para usuários comuns.' })
    }
    next()
}

module.exports = { autenticar, apenasAdmin, apenasUser }
