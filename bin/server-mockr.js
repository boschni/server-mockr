#!/usr/bin/env node

var program = require("commander");
var ServerMockr = require("../dist");
var packageJson = require("../package");

// parse process arguments
program
  .version(packageJson.version)
  .usage("[options] <file ...>")
  .parse(process.argv);

// construct config
var config = {};

// start server
var serverMockr = new ServerMockr(config);
serverMockr.start();
