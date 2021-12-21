import express = require('express');
import {Storage} from '@google-cloud/storage';
import bucket_router = require('./bucket_router');

function redirect_latest(storage: Storage, bucket_name: string,
  target_prefix: string, target_path: string, filename_substring: string) {
  const bucket = storage.bucket(bucket_name);
  const router = express.Router({ strict: true });

  return (req: express.Request, res: express.Response,
    next: express.NextFunction) => {
    bucket.getFiles({ prefix: target_path }, (err, files) => {
      if (err) {
        next(err);
      } else if (!files || files.length == 0) {
        next(); // 404
      } else {
        const matching_leaves = files.filter(file =>
          !file.name.endsWith('/') && file.name.includes(filename_substring)).
          sort((a, b) => +(a.name < b.name) - +(a.name > b.name));
        if (matching_leaves.length == 0) {
          next(); // 404
        } else {
          const file = matching_leaves[0];
          res.redirect(`${target_prefix}/${file.name}`);
        }
      }
    });
  };
}

export = redirect_latest;
