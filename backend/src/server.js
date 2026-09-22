require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 10000;

if (!process.env.JWT_SECRET) {
  console.error("ERRO: configure JWT_SECRET no arquivo .env");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`API executando em http://localhost:${PORT}`);
});
