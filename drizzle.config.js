require("dotenv/config");
const { defineConfig } = require("drizzle-kit");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

module.exports = defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.js",
    dialect: "postgresql",
    dbCredentials: {
    url: process.env.DATABASE_URL,
    },
});