// require("dotenv/config");
// const { defineConfig } = require("drizzle-kit");

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL environment variable is not set");
// }

// module.exports = defineConfig({
//     out: "./drizzle",
//     schema: "./src/db/schema.js",
//     dialect: "postgresql",
//     dbCredentials: {
//     url: process.env.DATABASE_URL,
//     },
// });

require("dotenv/config");
const { defineConfig } = require("drizzle-kit");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

module.exports = defineConfig({
  // schema: "./src/db/schema.js",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: ["!user_sessions"],
});