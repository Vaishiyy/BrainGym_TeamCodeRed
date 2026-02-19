const { MongoClient } = require("mongodb");

let client;
let database;

async function ensureIndexes(db) {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("login_events").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("game_progress_events").createIndex({ userId: 1, completedAt: -1 });
  await db.collection("game_progress_events").createIndex({ sessionId: 1, stage: 1 });
}

async function connectToDatabase({ uri, dbName }) {
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);
  await ensureIndexes(database);
  return database;
}

function getDatabase() {
  if (!database) {
    throw new Error("Database has not been initialized yet.");
  }
  return database;
}

async function closeDatabase() {
  if (client) {
    await client.close();
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabase
};
