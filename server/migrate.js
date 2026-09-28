const { createPool } = require("./db.js");

async function migrate() {
  const pool = createPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calculations (
      id SERIAL PRIMARY KEY,
      expression TEXT NOT NULL,
      result NUMERIC NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.end();
  console.log("Migration complete: calculations table ready.");
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { migrate };
