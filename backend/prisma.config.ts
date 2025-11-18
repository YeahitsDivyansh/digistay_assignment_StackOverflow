import { defineConfig } from "prisma/config";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sqlitePath = path.resolve("data", "stack-overflow.sqlite");
const fallbackUrl = pathToFileURL(sqlitePath).href;
const datasourceUrl = process.env.DATABASE_URL ?? fallbackUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: datasourceUrl,
  },
});
