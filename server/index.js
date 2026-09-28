const { createServer } = require("./app.js");

const port = Number(process.env.PORT || 3001);
createServer().listen(port, () => {
  console.log(`calculation-history server listening on :${port}`);
});
