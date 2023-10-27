const app = require("./src/app");
const dotenv = require("dotenv");
const path = require("path");

const PORT = 3010;

async function startServer() {
  const __dirname = path.resolve();
  dotenv.config({
    path: path.resolve(__dirname, ".env"),
  });

  /**
   * start server on PORT
   */
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Access it from http://localhost:${PORT}`);
  });
}

startServer();
