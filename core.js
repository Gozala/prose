#!/usr/bin/env javascript
var marked = require("marked")

function transpile(input) {
  return marked.lexer(input).

   filter(function(block) {
      return block.type === "code"
    }).map(function(block) {
      return block.text
    }).join("\n\n")
}

function compile(input, output) {

 var source = "";
  input.on("data", function onChunck(chunck) {
    source = source.concat(chunck)
  });

 input.once("end", function onRead() {
    try {
      output.write(transpile(source))
    } catch (error) {
      exit(error)
    }
  })

 input.on("error", exit)
  output.on("error", exit)
}

function exit(error) {
  if (error) {
    console.error(error)
    process.exit(1)
  } else {
    process.exit(0)
  }
}

function main() {
  if (process.argv.length < 3) {
    process.stdin.resume()
    process.stdin.setEncoding("utf8")
    compile(process.stdin, process.stdout)
  } else {
    Module._load(path.resolve(process.argv[2]), null, true);
  }
}

if (require.main === module)

  main()

module.exports = main