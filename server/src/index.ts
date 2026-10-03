import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { initDatabase } from "./db/database";
import { apiRouter } from "./routes/api";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004; // Porta 3004 dedicada para a Fase 4!

app.use(cors());
app.use(express.json());

// Inicializa banco de dados SQLite e seed inicial
initDatabase();

// Rotas da API
app.use("/api", apiRouter);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Roviro Força de Vendas & Torre de Controle Logística B2B",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Serve frontend compilado se existir
const clientDistPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
  console.log(`📦 Servindo força de vendas web a partir de: ${clientDistPath}`);
} else {
  app.use((req, res) => {
    res.send(`
      <div style="font-family: sans-serif; background: #080c14; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <h1 style="color: #38bdf8;">Roviro Força de Vendas B2B — API Backend</h1>
        <p style="color: #94a3b8;">O backend está ativo na porta ${PORT}.</p>
        <p>Acesse a interface web em: <a href="http://localhost:5176" style="color: #38bdf8; font-weight: bold;">http://localhost:5176</a></p>
      </div>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor Força de Vendas B2B rodando em http://localhost:${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});
