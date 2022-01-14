import express = require('express');
import helmet = require('helmet');
import {Storage} from '@google-cloud/storage';

import bucket_router = require('./bucket_router');
import redirect_latest = require('./redirect_latest');

const storage = new Storage();

const PORT = Number(process.env.PORT) || 8080;

const app = express();
app.enable('strict routing')
app.set('view engine', 'pug')

app.use(helmet());

['ci', 'nightly', 'release', 'nightly-experimental'].
  forEach(category => {
    const prefix = `/${category}`;
    const bucket_name = `${category}.artifacts.locimmbuild.org`;
    app.use(prefix, bucket_router(prefix, storage, bucket_name));
  });

app.get('/latest/windows/MMSetup_x64_latest.exe',
  redirect_latest(storage, 'nightly.artifacts.locimmbuild.org',
    '/nightly', '2.0/Windows', '_64bit_'));

app.get('/latest/macos/Micro-Manager-x86_64-latest.dmg',
  redirect_latest(storage, 'nightly.artifacts.locimmbuild.org',
    '/nightly', '2.0/Mac', ''));

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
