import express = require('express');

function bucket_router(bucket_name: string) {
  const router = express.Router({ strict: true });

  router.get('/:version/:platform', (req, res) => {
    const platform = req.params.platform;
    res.redirect(`./${platform}/`);
  });

  router.get('/:version/:platform/', (req, res) => {
    const version = req.params.version;
    const platform = req.params.platform;
    res.send(`dir: ${version} ${platform}`);
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
