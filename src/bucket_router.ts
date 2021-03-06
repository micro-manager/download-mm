import express = require('express');
import { Storage, Bucket, File } from '@google-cloud/storage';

function redirect_to_signed_download_url(req: express.Request, res: express.Response, next: express.NextFunction, file: File) {
  file.exists({}, (err, exists) => {
    if (err) {
      next(err);
    } else if (!exists) {
      next(); // 404
    } else {
      const now = new Date();
      const valid_seconds = 3600;
      const deadline = new Date(now.getTime() + 1000 * valid_seconds);
      file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: deadline
      },
        (err, url) => {
          if (err) {
            next(err);
          } else if (!url) {
            next(); // Unexpected
          } else {
            res.redirect(url);
          }
        });
    }
  });
}

function bucket_router(path_prefix: string, storage: Storage, bucket_name: string) {
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

    // No directory listing for hotfix directories.
    if (version == 'hotfix') {
      next();
      return;
    }

    bucket.getFiles({ prefix: prefix }, (err, files) => {
      if (err) {
        next(err);
      } else if (!files || files.length == 0) {
        next(); // 404
      } else {
        const link_prefix = `${path_prefix}/${prefix}`;

        const get_timestamp_ms = (file: File) => {
          if (file.metadata.metadata && 'valelab4-mtime' in file.metadata.metadata) {
            return 1000 * parseInt(file.metadata.metadata['valelab4-mtime'])
          } else {
            return Date.parse(file.metadata.timeCreated);
          }
        };

        const compare_files = (a: any, b: any) => {
          const r = +(a.date < b.date) - +(a.date > b.date);
          if (r == 0) {
            return +(a.name < b.name) - +(a.name > b.name);
          }
          return r;
        };

        const leaves = files.
          filter(file => !file.name.endsWith('/')).  // Skip directory object
          map(file => ({
            name: file.name,
            size: file.metadata.size,
            date: get_timestamp_ms(file),
          })).
          sort(compare_files);

        res.render('directory', {
          version: version,
          platform: platform,
          buildtype: buildtype,
          files: leaves,
          link_prefix: link_prefix,
        });
      }
    });
  });

  router.get('/hotfix/:version/:date/:platform/:bits/:filename', (req, res, next) => {
    const version = req.params.version;
    const date = req.params.date;
    const platform = req.params.platform;
    const bits = req.params.bits;
    const filename = req.params.filename;

    const file = bucket.file(`hotfix/${version}/${date}/${platform}/${bits}/${filename}`);
    redirect_to_signed_download_url(req, res, next, file);
  });

  router.get('/:version/:platform/:filename', (req, res, next) => {
    const version = req.params.version;
    const platform = req.params.platform;
    const filename = req.params.filename;

    const file = bucket.file(`${version}/${platform}/${filename}`);
    redirect_to_signed_download_url(req, res, next, file);
  });

  return router;
}

export = bucket_router;
