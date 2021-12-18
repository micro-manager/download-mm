import express = require('express');

const PORT = Number(process.env.PORT) || 8080;

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello, World!').end();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

export = app;
