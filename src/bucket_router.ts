import express = require('express');

function bucket_router(bucket_name: string) {
  const router = express.Router();

  router.get('/:version/:platform', (req, res) => {
    res.send('dir: ' + req.path);
  });

  router.get('/:version/:platform/:filename', (req, res) => {
    res.send('file: ' + req.path);
  });

  return router;
}

export = bucket_router;
