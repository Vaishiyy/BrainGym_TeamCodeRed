const http = require("http");
const { env } = require("./config/env");
const { connectToDatabase, closeDatabase } = require("./config/database");
const { createUserRepository } = require("./repositories/userRepository");
const { createAuthService } = require("./services/authService");
const { createProgressService } = require("./services/progressService");
const { createApp } = require("./app");

async function startServer() {
  const db = await connectToDatabase({
    uri: env.mongodbUri,
    dbName: env.mongodbDbName
  });

  const userRepository = createUserRepository(db);
  const authService = createAuthService(userRepository);
  const progressService = createProgressService(userRepository);
  const app = createApp({ authService, progressService });

  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(env.port, resolve);
  });

  // eslint-disable-next-line no-console
  console.log(`Brain Gym server running at http://localhost:${env.port}`);

  const shutdown = async () => {
    await new Promise((resolve) => server.close(resolve));
    await closeDatabase();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = { startServer };
