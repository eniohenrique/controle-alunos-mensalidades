const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const testeRoutes = require("./routes/teste.routes");
const authRoutes = require("./routes/auth.routes");
const alunosRoutes = require("./routes/alunos.routes");
const mensalidadesRoutes = require("./routes/mensalidades.routes");
const uploadRoutes = require("./routes/upload.routes");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/teste", testeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/alunos", alunosRoutes);
app.use("/api/mensalidades", mensalidadesRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.json({
    app: "Controle de Alunos e Mensalidades",
    status: "online",
  });
});

app.get("/healthcheck", (req, res) => {
  res.json({
    status: "ok",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
