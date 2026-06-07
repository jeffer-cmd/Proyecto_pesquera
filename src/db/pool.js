require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    });

pool.connect()
    .then((client) => {
        console.log("BD conectada 🔥");
        client.release();
    })
    .catch((err) => {
        console.log("Fallo conexión:", err.message);
    });

module.exports = pool;