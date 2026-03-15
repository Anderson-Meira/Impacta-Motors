const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONEXÃO COM O BANCO DE DADOS ---
const pool = new Pool({
    user: 'postgres', 
    host: 'localhost', 
    database: 'projeto', 
    password: '123456', 
    port: 5432,
});

pool.connect()
    .then(() => console.log("✅ IMPACTA MOTORS: BANCO DE DADOS CONECTADO"))
    .catch(err => console.error("❌ ERRO AO CONECTAR NO BANCO:", err));

// --- ROTAS DE VEÍCULOS (TIPO, MODELO, MARCA, COR, PRECO) ---
app.get('/veiculos', async (req, res) => {
    try {
        const r = await pool.query('SELECT * FROM veiculos ORDER BY id DESC');
        res.json(r.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/veiculos', async (req, res) => {
    const { tipo, modelo, marca, cor, preco } = req.body;
    try {
        const r = await pool.query(
            'INSERT INTO veiculos (tipo, modelo, marca, cor, preco) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [tipo, modelo, marca, cor, preco]
        );
        res.json(r.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/veiculos/:id', async (req, res) => {
    const { id } = req.params;
    const { tipo, modelo, marca, cor, preco } = req.body;
    try {
        await pool.query(
            'UPDATE veiculos SET tipo=$1, modelo=$2, marca=$3, cor=$4, preco=$5 WHERE id=$6',
            [tipo, modelo, marca, cor, preco, id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ROTAS DE CLIENTES ---
app.get('/clientes', async (req, res) => {
    try {
        const r = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(r.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/clientes', async (req, res) => {
    const { nome, email, telefone } = req.body;
    try {
        const r = await pool.query(
            'INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *',
            [nome, email, telefone]
        );
        res.json(r.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;
    try {
        await pool.query('UPDATE clientes SET nome=$1, email=$2, telefone=$3 WHERE id=$4', [nome, email, telefone, id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ROTAS DE USUÁRIOS (EQUIPE / VENDEDORES) ---
app.get('/usuarios', async (req, res) => {
    try {
        const r = await pool.query('SELECT * FROM usuarios ORDER BY id DESC');
        res.json(r.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/usuarios', async (req, res) => {
    const { nome_usuario, senha, cargo } = req.body;
    try {
        const r = await pool.query(
            'INSERT INTO usuarios (nome_usuario, senha, cargo) VALUES ($1, $2, $3) RETURNING *',
            [nome_usuario, senha, cargo]
        );
        res.json(r.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_usuario, senha, cargo } = req.body;
    try {
        await pool.query('UPDATE usuarios SET nome_usuario=$1, senha=$2, cargo=$3 WHERE id=$4', [nome_usuario, senha, cargo, id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ROTA DE VENDAS (GERA O RELATÓRIO COM INNER JOIN) ---
app.get('/vendas', async (req, res) => {
    try {
        // Esta query une as 4 tabelas para mostrar nomes em vez de IDs
        const queryRelatorio = `
            SELECT 
                v.id, 
                ve.modelo as carro, 
                c.nome as cliente, 
                u.nome_usuario as vendedor, 
                v.valor_final, 
                v.data_venda 
            FROM vendas v 
            INNER JOIN veiculos ve ON v.veiculo_id = ve.id 
            INNER JOIN clientes c ON v.cliente_id = c.id
            INNER JOIN usuarios u ON v.usuario_id = u.id
            ORDER BY v.data_venda DESC`;
            
        const r = await pool.query(queryRelatorio);
        res.json(r.rows);
    } catch (err) {
        console.error("Erro ao buscar relatório de vendas:", err);
        res.status(500).json({ error: "Erro interno ao gerar relatório" });
    }
});

app.post('/vendas', async (req, res) => {
    const { veiculo_id, cliente_id, usuario_id, valor_final } = req.body;
    try {
        await pool.query(
            'INSERT INTO vendas (veiculo_id, cliente_id, usuario_id, valor_final) VALUES ($1, $2, $3, $4)',
            [veiculo_id, cliente_id, usuario_id, valor_final]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao inserir venda:", err);
        res.status(500).json({ error: "Erro ao processar venda" });
    }
});

// --- ROTA DE EXCLUSÃO GENÉRICA ---
app.delete('/:tabela/:id', async (req, res) => {
    const { tabela, id } = req.params;
    const tabelasPermitidas = ['veiculos', 'clientes', 'usuarios', 'vendas'];
    
    if (!tabelasPermitidas.includes(tabela)) {
        return res.status(403).json({ error: "Tabela não permitida" });
    }

    try {
        await pool.query(`DELETE FROM ${tabela} WHERE id = $1`, [id]);
        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao deletar:", err);
        res.status(500).json({ error: "Não é possível excluir: registro vinculado a outra tabela." });
    }
});

// --- INICIALIZAÇÃO ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
    -------------------------------------------
    🚀 IMPACTA MOTORS - SISTEMA ATIVO
    📡 Servidor rodando em: http://localhost:${PORT}
    -------------------------------------------
    `);
}); 