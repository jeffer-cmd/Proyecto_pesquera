
// require("dotenv").config();

// const { drizzle } = require("drizzle-orm/neon-http");
// const { neon } = require("@neondatabase/serverless");

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not defined in the environment variables.");
// }

// const sql = neon(process.env.DATABASE_URL);
// const db = drizzle(sql);

// // prueba de conexión a la base de datos
// sql`SELECT 1`
//   .then(() => {
//     console.log("BD conectada");
//   })
//   .catch((err) => {
//     console.log("Fallo conexion:", err.message);
//   });

require("dotenv").config();

const postgres = require("postgres");
const { drizzle } = require("drizzle-orm/postgres-js");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const client = postgres(process.env.DATABASE_URL);

const db = drizzle(client);

// prueba conexión
client`SELECT 1`
  .then(() => console.log("BD conectada"))
  .catch(err => console.log("Fallo conexion:", err.message));

module.exports = db;
