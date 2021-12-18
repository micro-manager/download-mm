import express = require('express');
import helmet = require('helmet');

import bucket_router = require('./bucket_router');

const PORT = Number(process.env.PORT) || 8080;

const app = express();
app.enable('strict routing')

app.use(helmet());

app.use('/ci', bucket_router('ci.artifacts.locimmbuild.org'));
app.use('/nightly', bucket_router('nightly.artifacts.locimmbuild.org'));
app.use('/release', bucket_router('release.artifacts.locimmbuild.org'));
app.use('/nightly-experimental',
  bucket_router('nightly-experimental.artifacts.locimmbuild.org'));

app.get('/', (req, res) => {
  res.redirect('https://micro-manager.org/downloads');
});

app.all('*', (req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

export = app;
