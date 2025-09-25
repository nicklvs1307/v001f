console.log('Server.js is being executed!');

const express = require("express");
const cors = require("cors");
const config = require("./config");
const { connectDB } = require("./database"); // Importa a função connectDB

const app = express();
const path = require('path'); // Importar o módulo path

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rota de verificação
app.get("/", (req, res) => {
  res.send("LoyalFood API is running!");
});

// Rotas da API
const apiRoutes = require("./routes");
const apiRouter = express.Router(); // Crie um novo Router

apiRoutes(apiRouter); // Chame a função de rotas com o router
app.use("/api", apiRouter); // Use o router como middleware

// Error Handler
const { errorHandler } = require("./middlewares/errorMiddleware");
app.use(errorHandler);

const PORT = config.port;

// Conecta ao banco de dados e inicia o servidor
const startServer = async () => {
  await connectDB(); // Chama a função para conectar ao banco de dados
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Inicia os jobs agendados
    const dailyReportJob = require('./jobs/dailyReportJob');
    dailyReportJob.start();
  });
};

startServer(); // Inicia o servidor
