// require("dotenv").config();

// const { drizzle } = require("drizzle-orm/neon-http");


// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not defined in the environment variables.");
// }


// const db = drizzle(process.env.DATABASE_URL);

// sql`SELECT 1`
//   .then(() => {
//     console.log("BD conectada");
//   })
//   .catch((err) => {
//     console.log("Fallo conexion:", err.message);
//   });

// module.exports = db;

require("dotenv").config();

const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// prueba de conexión a la base de datos
sql`SELECT 1`
  .then(() => {
    console.log("BD conectada");
  })
  .catch((err) => {
    console.log("Fallo conexion:", err.message);
  });

module.exports = db;