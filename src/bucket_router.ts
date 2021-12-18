import express = require('express');
import {Storage} from '@google-cloud/storage';

const storage = new Storage();

function bucket_router(bucket_name: string) {
  const bucket = storage.bucket(bucket_name);

  const router = express.Router({ strict: true });

  router.get('/:version/:platform', (req, res) => {
    const platform = req.params.platform;
    res.redirect(`./${platform}/`);
  });

  router.get('/:version/:platform/', (req, res, next) => {
    const version = req.params.version;
    const platform = req.params.platform;

    bucket.getFiles({
      prefix: `${version}/${platform}/`
    }, (err, files) => {
      if (err) {
        next(err);
      } else if (!files || files.length == 0) {
        next(); // 404
      } else {
        // If a folder exists with no files, we get a single "file" which is the
        // folder path with a trailing slash. Do not show this item.
        const downloadables = files.filter(file => !file.name.endsWith('/'));

        res.send(`${downloadables.length} file(s) available`);
      }
    });
  });

  router.get('/:version/:platform/:filename', (req, res) => {
    const version = req.params.version;
    const platform = req.params.platform;
    const filename = req.params.filename;
    res.send(`file: ${version} ${platform} ${filename}`);
  });

  return router;
}

export = bucket_router;
