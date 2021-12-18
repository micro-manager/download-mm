import express = require('express');
import {Storage} from '@google-cloud/storage';

const storage = new Storage();

function bucket_router(path_prefix: string, bucket_name: string) {
  const buildtype = bucket_name.split('.')[0];
  const bucket = storage.bucket(bucket_name);

  const router = express.Router({ strict: true });

  router.get('/:version/:platform', (req, res) => {
    const platform = req.params.platform;
    res.redirect(`./${platform}/`);
  });

  router.get('/:version/:platform/', (req, res, next) => {
    const version = req.params.version;
    const platform = req.params.platform;
    const prefix = `${version}/${platform}/`;

    bucket.getFiles({ prefix: prefix }, (err, files) => {
      if (err) {
        next(err);
      } else if (!files || files.length == 0) {
        next(); // 404
      } else {
        const link_prefix = `${path_prefix}/${prefix}`;
        // If a folder exists with no files, we get a single "file" which is the
        // folder path with a trailing slash. Do not show this item.
        // Also sort in ascii descending order.
        const leaves = files.filter(file => !file.name.endsWith('/')).
          sort((a, b) => +(a.name < b.name) - +(a.name > b.name));

        res.render('directory', {
          title: `Micro-Manager ${version} ${platform} ${buildtype} downloads`,
          files: leaves,
          link_prefix: link_prefix,
        });
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
