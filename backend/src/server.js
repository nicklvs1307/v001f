require("dotenv").config();

console.log("Server.js is being executed!");

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");
const { connectDB } = require("./database"); // Importa a função connectDB

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
const path = require("path"); // Importar o módulo path

// Middlewares
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : [];
    if (process.env.NODE_ENV !== "production") {
      allowedOrigins.push("http://localhost:3000");
    }

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Servir arquivos estáticos da pasta 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Rota de verificação
app.get("/", (req, res) => {
  res.send("LoyalFood API is running!");
});

// Rotas da API
const apiRoutes = require("./routes");
const apiRouter = express.Router(); // Crie um novo Router

apiRoutes(apiRouter); // Chame a função de rotas com o router
app.use("/api", apiRouter); // Use o router como middleware

const http = require("http");
const server = http.createServer(app);
const { initSocket } = require("./socket");
const io = initSocket(server);

app.set("io", io);

// Error Handler
const { errorHandler } = require("./middlewares/errorMiddleware");
app.use(errorHandler);

const PORT = config.port;

// Conecta ao banco de dados e inicia o servidor
const startServer = async () => {
  await connectDB(); // Chama a função para conectar ao banco de dados
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Inicia os jobs agendados
    const dailyReportJob = require("./jobs/dailyReportJob");
    const weeklyReportJob = require("./jobs/weeklyReportJob");
    const monthlyReportJob = require("./jobs/monthlyReportJob");
    const couponReminderJob = require("./jobs/couponReminderJob");
    const birthdayAutomationJob = require("./jobs/birthdayAutomationJob");
    const couponExpirationJob = require("./jobs/couponExpirationJob");
    const resetSenderCountsJob = require("./jobs/resetSenderCountsJob");
    const { initSenderMonitorJob } = require("./jobs/senderMonitorJob");
    const { initWarmingUpProgressJob } = require("./jobs/warmingUpProgressJob");
    const { initCampaignMonitorJob } = require("./jobs/campaignMonitorJob");
    const awardProcessorJob = require("./jobs/awardProcessorJob");
    const ifoodPollingJob = require("./jobs/ifoodPollingJob"); // Importar o job de polling do iFood
    const deliveryMuchPollingJob = require("./jobs/deliveryMuchPollingJob"); // Importar o job de polling da Delivery Much
    const postSaleSurveyJob = require("./jobs/postSaleSurveyJob"); // Job de envio de pesquisas pós-venda

    dailyReportJob.start();
    weeklyReportJob.start();
    monthlyReportJob.start();
    couponReminderJob.start();
    birthdayAutomationJob.start();
    couponExpirationJob.start();
    resetSenderCountsJob.start();
    initSenderMonitorJob();
    initWarmingUpProgressJob();
    initCampaignMonitorJob();
    awardProcessorJob.start();
    ifoodPollingJob.start(); // Iniciar o job de polling do iFood
    deliveryMuchPollingJob.start(); // Iniciar o job de polling da Delivery Much
    postSaleSurveyJob.start(); // Iniciar processamento de pesquisas agendadas

    // Instanciar dependências e inicializar agendamentos de campanha
    const CampanhaService = require("./services/campanhaService");
    const campanhaRepository = require("./repositories/campanhaRepository");
    const clientRepository = require("./repositories/clientRepository");
    const cupomRepository = require("./repositories/cupomRepository");
    const roletaSpinRepository = require("./repositories/roletaSpinRepository");
    const whatsappService = require("./services/whatsappService");

    const campanhaServiceInstance = new CampanhaService(
      campanhaRepository,
      clientRepository,
      cupomRepository,
      roletaSpinRepository,
      whatsappService,
    );
    campanhaServiceInstance.initScheduledCampaigns();
  });
};

startServer(); // Inicia o servidor
