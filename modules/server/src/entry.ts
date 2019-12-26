const express = require('express');
const app = express();

const port = 8080;

app.use((req, res) => {
  console.log(`=> ${req.path}`);
  res.send('Hello World!!');
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

