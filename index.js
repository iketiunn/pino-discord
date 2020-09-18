#!/usr/bin/env node

const {
  cli: { url, opts },
  post,
  makeBody,
} = require("./lib");

const split = require("split2");
const pump = require("pump");
const through = require("through2");

pump(
  process.stdin,
  split(JSON.parse),
  through.obj(function (chunk, _enc, cb) {
    if (opts.level && Number(chunk.level) >= Number(opts.level)) {
      // Send to hook
      post(url, makeBody(opts, chunk));
    }

    cb();
  })
);
