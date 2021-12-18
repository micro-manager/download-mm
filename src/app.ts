import express = require('express');
import helmet = require('helmet');

import bucket_router = require('./bucket_router');

const PORT = Number(process.env.PORT) || 8080;

const app = express();
app.enable('strict routing')
app.set('view engine', 'pug')

app.use(helmet());

['ci', 'nightly', 'release', 'nightly-experimental'].
  forEach(category => {
    const prefix = `/${category}`;
    const bucket_name = `${category}.artifacts.locimmbuild.org`;
    app.use(prefix, bucket_router(prefix, bucket_name));
  });

app.get('/', (req, res) => {
  res.redirect('https://micro-manager.org/downloads');
});

app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

export = app;
