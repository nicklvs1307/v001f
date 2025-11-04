require('dotenv').config();

console.log('Server.js is being executed!');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require("express");
const cors = require("cors");
const config = require("./config");
const { connectDB } = require("./database"); // Importa a função connectDB

const app = express();
const path = require('path'); // Importar o módulo path

// Middlewares
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
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
    const couponReminderJob = require('./jobs/couponReminderJob');
    const birthdayAutomationJob = require('./jobs/birthdayAutomationJob');
    dailyReportJob.start();
    couponReminderJob.start();
    birthdayAutomationJob.start();
  });
};

startServer(); // Inicia o servidor
