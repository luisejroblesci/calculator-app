const http = require("http");
const { createPool } = require("./db.js");

// A minimal "calculation history" API backed by Postgres — the kind of
// integration-tested workload that needs a real backing service and doesn't
// fit cleanly on a laptop without Docker/Postgres already set up.
function createServer(pool = createPool()) {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === "POST" && req.url === "/calculations") {
        let body = "";
        for await (const chunk of req) body += chunk;
        const { expression, result } = JSON.parse(body || "{}");
        if (typeof expression !== "string" || typeof result !== "number") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "expression (string) and result (number) are required" }));
          return;
        }
        const { rows } = await pool.query(
          "INSERT INTO calculations (expression, result) VALUES ($1, $2) RETURNING id, expression, result, created_at",
          [expression, result]
        );
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(rows[0]));
        return;
      }

      if (req.method === "GET" && req.url === "/calculations") {
        const { rows } = await pool.query(
          "SELECT id, expression, result, created_at FROM calculations ORDER BY id DESC"
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(rows));
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "not found" }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err) }));
    }
  });
}

module.exports = { createServer };
