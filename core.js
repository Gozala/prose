#!/usr/bin/env node
/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false */

var Module = require("module").Module;
var path = require("path");
var marked = require("marked");

function transpile(input) {
  return marked.lexer(input).filter(function(node) {
    return node.type === "code"
  }).map(function(node) {
    return node.text
  }).join("\n\n")
}

function exit(error) {
  if (error) {
    console.error(error)
    process.exit(1)
  } else {
    process.exit(0)
  }
}

function compile(input, output, uri) {
  var source = "";
  input.on("data", function onChunck(chunck) {
    source = source.concat(chunck)
  });
  input.on("end", function onRead() {
    try {
      output.write(transpile(source))
    } catch (error) {
      exit(error)
    }
  })
  input.on("error", exit)
  output.on("error", exit)
}


function main() {
  if (process.argv.length < 3) {
    process.stdin.resume()
    process.stdin.setEncoding("utf8")
    compile(process.stdin, process.stdout, process.cwd())
  } else {
    Module._load(path.resolve(process.argv[2]), null, true);
  }
}

if (require.main === module) main()
