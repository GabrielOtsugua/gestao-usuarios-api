require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error("ERRO: configure JWT_SECRET no arquivo .env");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API executando na porta ${PORT}`);
});
