// 데이터베이스 연결

const mongodb = require("mongodb");

const mongoClient = mongodb.MongoClient;

let database;

async function connect() {
  const client = await mongoClient.connect("mongodb://0.0.0.0:27017"); // Local MongoDB Server
  database = client.db("blog") // blog database in MongoDB Server
}

function getDb() {
  if (!database) {
    throw { message: "Database connection not established!" };
  }
  return database;
}

module.exports = {
  connectToDatabase: connect,
  getDb: getDb,
}
