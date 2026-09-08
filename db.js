import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

//NOTE: Simple check para informar si no arranca.

pool
  .query("SELECT NOW()")
  .then(() => console.log(`\n[+] Postgress conectado...`))
  .catch((err) => console.error(`\n[x] No se puedo conectar:`, err.message));
