const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Ativa o CORS para permitir que a sua página (mesmo aberta via arquivo local) fale com o Node
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Logger de requisições: mostra no terminal tudo o que o frontend está tentando fazer
app.use((req, res, next) => {
    console.log(`📡 Recebida requisição: ${req.method} para ${req.url}`);
    next();
});

// ========================================================
// 🛠️ CONEXÃO COM O POSTGRESQL (IMPACTA MOTORS)
// ========================================================
const pool = new Pool({
    user: 'postgres', 
    host: 'localhost', 
    database: 'projeto', 
    password: '123456', 
    port: 5432,
});

pool.connect()
    .then(() => console.log("\n✅ BANCO DE DADOS CONECTADO COM SUCESSO!\n"))
    .catch(err => console.error("\n❌ ERRO AO CONECTAR NO BANCO DE DADOS:", err.message));

// ========================================================
// 👔 ROTAS DE USUÁRIOS / EQUIPE
// ========================================================

app.get('/usuarios', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT id, nome_usuario, cargo FROM usuarios ORDER BY id DESC');
        res.json(resultado.rows || []);
    } catch (err) { 
        console.error("❌ Erro ao listar usuários:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

app.post('/usuarios', async (req, res) => {
    const { nome_usuario, senha, cargo } = req.body;
    try {
        const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS proximo_id FROM usuarios');
        const proximoId = maxIdResult.rows[0].proximo_id;

        const resultado = await pool.query(
            'INSERT INTO usuarios (id, nome_usuario, senha, cargo) VALUES ($1, $2, $3, $4) RETURNING id, nome_usuario, cargo',
            [proximoId, nome_usuario, senha, cargo]
        );
        res.status(200).json(resultado.rows[0]);
    } catch (err) { 
        console.error("\n❌ ERRO NO CADASTRO DE USUÁRIO:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_usuario, senha, cargo } = req.body;
    try {
        let resultado;
        if (senha && senha.trim() !== "") {
            resultado = await pool.query(
                'UPDATE usuarios SET nome_usuario = $1, senha = $2, cargo = $3 WHERE id = $4 RETURNING id, nome_usuario, cargo',
                [nome_usuario, senha, cargo, id]
            );
        } else {
            resultado = await pool.query(
                'UPDATE usuarios SET nome_usuario = $1, cargo = $2 WHERE id = $3 RETURNING id, nome_usuario, cargo',
                [nome_usuario, cargo, id]
            );
        }
        res.json({ success: true, usuario: resultado.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================================================
// 👥 ROTAS DE CLIENTES
// ========================================================
app.get('/clientes', async (req, res) => {
    try { const r = await pool.query('SELECT * FROM clientes ORDER BY id DESC'); res.json(r.rows || []); } catch { res.json([]); }
});

app.post('/clientes', async (req, res) => {
    try {
        const m = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 as p FROM clientes');
        const r = await pool.query('INSERT INTO clientes (id, nome, email, telefone) VALUES ($1, $2, $3, $4) RETURNING *', [m.rows[0].p, req.body.nome, req.body.email, req.body.telefone]);
        res.json(r.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========================================================
// 📦 ROTAS DE VEÍCULOS (Tratamento Adaptativo Maiúsculo/Minúsculo)
// ========================================================
app.get('/veiculos', async (req, res) => {
    try {
        let t = "veiculos"; try { await pool.query('SELECT 1 FROM veiculos LIMIT 1'); } catch { t = '"VEICULOS"'; }
        const r = await pool.query(`SELECT * FROM ${t} ORDER BY id DESC`); 
        res.json(r.rows || []); 
    } catch { res.json([]); }
});

app.post('/veiculos', async (req, res) => {
    try {
        let t = "veiculos"; try { await pool.query('SELECT 1 FROM veiculos LIMIT 1'); } catch { t = '"VEICULOS"'; }
        const m = await pool.query(`SELECT COALESCE(MAX(id), 0) + 1 as p FROM ${t}`);
        const r = await pool.query(`INSERT INTO ${t} (id, tipo, modelo, marca, cor, preco) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [m.rows[0].p, req.body.tipo, req.body.modelo, req.body.marca, req.body.cor, req.body.preco]);
        res.json(r.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========================================================
// 📊 ROTAS DE VENDAS E CRUZAMENTO DE INFORMAÇÕES
// ========================================================

// 1. Listar todas as vendas realizando o INNER JOIN das chaves estrangeiras
app.get('/vendas', async (req, res) => {
    try {
        let tabV = "veiculos"; try { await pool.query('SELECT 1 FROM veiculos LIMIT 1'); } catch { tabV = '"VEICULOS"'; }
        
        const query = `
            SELECT v.id, ve.modelo as carro, c.nome as cliente, u.nome_usuario as vendedor, v.valor_final, v.data_venda 
            FROM vendas v 
            INNER JOIN ${tabV} ve ON v.veiculo_id = ve.id 
            INNER JOIN clientes c ON v.cliente_id = c.id
            INNER JOIN usuarios u ON v.usuario_id = u.id
            ORDER BY v.data_venda DESC`;
            
        const resultado = await pool.query(query);
        res.json(resultado.rows || []);
    } catch (err) {
        console.error("❌ Erro ao cruzar informações no relatório de vendas:", err.message);
        res.json([]);
    }
});

// 2. Gravar os dados de uma nova venda realizada
app.post('/vendas', async (req, res) => {
    const { veiculo_id, cliente_id, usuario_id, valor_final } = req.body;
    console.log("📥 Processando gravação de nova venda:", req.body);

    try {
        const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS proximo_id FROM vendas');
        const proximoId = maxIdResult.rows[0].proximo_id;

        const resultado = await pool.query(
            'INSERT INTO vendas (id, veiculo_id, cliente_id, usuario_id, valor_final, data_venda) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [proximoId, veiculo_id, cliente_id, usuario_id, valor_final]
        );

        console.log(`✅ Registro de venda inserido com sucesso. ID gerado: ${proximoId}`);
        res.status(200).json(resultado.rows[0]);
    } catch (err) {
        console.error("❌ Falha crítica ao persistir dados de venda no banco:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. Indicador de faturamento agregado por vendedor (para alimentar o gráfico de barras)
app.get('/indicadores/desempenho', async (req, res) => {
    try {
        const query = `
            SELECT u.nome_usuario as vendedor, SUM(v.valor_final) as valor_total 
            FROM vendas v 
            INNER JOIN usuarios u ON v.usuario_id = u.id 
            GROUP BY u.nome_usuario`;
        const resultado = await pool.query(query);
        res.json(resultado.rows || []);
    } catch (err) {
        console.error("❌ Erro no indicador de desempenho:", err.message);
        res.json([]);
    }
});

// 4. Indicador de controle de volume de estoque
app.get('/indicadores/estoque', async (req, res) => {
    try {
        let tabV = "veiculos"; try { await pool.query('SELECT 1 FROM veiculos LIMIT 1'); } catch { tabV = '"VEICULOS"'; }
        const rTotal = await pool.query(`SELECT COUNT(*) as total FROM ${tabV}`);
        const rVendidos = await pool.query('SELECT COUNT(*) as total FROM vendas');
        
        const total = parseInt(rTotal.rows[0].total) || 0;
        const vendidos = parseInt(rVendidos.rows[0].total) || 0;
        res.json({ total, vendidos, disponiveis: total - vendidos });
    } catch (err) {
        res.json({ total: 0, vendidos: 0, disponiveis: 0 });
    }
});

// ========================================================
// 🗑️ EXCLUSÃO GERENCIAL
// ========================================================
app.delete('/:tabela/:id', async (req, res) => {
    const { tabela, id } = req.params;
    try {
        let t = tabela.toLowerCase();
        if (t === "veiculos") { try { await pool.query('SELECT 1 FROM veiculos LIMIT 1'); } catch { t = '"VEICULOS"'; } }
        await pool.query(`DELETE FROM ${t} WHERE id = $1`, [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Inicialização do servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 ===================================================`);
    console.log(`🚀 IMPACTA MOTORS - BACKEND RODANDO NA PORTA ${PORT}`);
    console.log(`🚀 ===================================================\n`);
});