// Integration test — requires a live Postgres connection (PGHOST/PGPORT/etc,
// or the defaults in server/db.js). This is the workload that doesn't fit on
// a laptop without Docker/Postgres already running: it genuinely fails
// without a real backing service, by design.
const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createServer } = require("./app.js");
const { createPool } = require("./db.js");
const { migrate } = require("./migrate.js");

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      { hostname: "127.0.0.1", port: server.address().port, path, method,
        headers: data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {} },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }));
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

test("calculation history: POST then GET round-trips through Postgres", async (t) => {
  await migrate();
  const pool = createPool();
  await pool.query("DELETE FROM calculations");

  const server = createServer(pool);
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });

  const created = await request(server, "POST", "/calculations", { expression: "2 + 2", result: 4 });
  assert.equal(created.status, 201);
  assert.equal(created.body.expression, "2 + 2");
  assert.equal(Number(created.body.result), 4);

  const listed = await request(server, "GET", "/calculations");
  assert.equal(listed.status, 200);
  assert.equal(listed.body.length, 1);
  assert.equal(listed.body[0].expression, "2 + 2");
});
