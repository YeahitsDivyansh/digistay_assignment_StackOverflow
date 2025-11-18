const path = require("path");
const { pathToFileURL } = require("url");
const { PrismaClient } = require("@prisma/client");

if (!process.env.DATABASE_URL) {
  const dbPath = path.resolve(__dirname, "..", "data", "stack-overflow.sqlite");
  const dbUrl = pathToFileURL(dbPath).href;
  process.env.DATABASE_URL = dbUrl;
}

const prisma = new PrismaClient();

module.exports = prisma;
