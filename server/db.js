const { Pool } = require("pg");

function createPool() {
  return new Pool({
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || "calc",
    password: process.env.PGPASSWORD || "calc",
    database: process.env.PGDATABASE || "calculator",
  });
}

module.exports = { createPool };
