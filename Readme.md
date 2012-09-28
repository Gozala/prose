# Prose

Prose is an experimental take on [Literate_programming][] inspired by
[Literate coffeescript][]. It attempts to focus embrace problem solving,
without binding you to any specific programing language.

-------------------------------------------- 

Prose uses [markdown][] as a primary format for describing problems and
solutions for the particular problem that program is trying to solve.

Actual solutions to the problem are embedded as code blocks, written in
any [programing language that can compile to javascript](http://altjs.org/).



### Embedding code



Prose treats any markdown [code block][] as an embedded program. Code can
be written in any language as long as it can compile to JS and of course
JS :) Standard [shebang][] trick can be used to identify language the code
is written in. 

In order to demonstrate prose we will use it to write itself *(yeah we're
that meta!!)*. Since primary input format is markdown, we use a full
featured markdown parser library [marked][]:


    #!/usr/bin/env javascript
    var marked = require("marked")


In order to transpile prose into program we will need to parse a given
markdown input. Library provides convenient function for that



    function transpile(input) {
      return marked.lexer(input).


> Prose will recognizes code block above as a javascript. If shebang
> is not provided code block is treated as a previous one.


To assemble an executable we will only need to combine text from the code
blocks


       filter(function(block) {
          return block.type === "code"
        }).map(function(block) {
          return block.text
        }).join("\n\n")
    }


Prose is designed in an idiomatic Unix style, in a sense that it takes
program input from the standard input and writes compiled program into
standard output.


    #!/usr/bin/env coffeescript
    compile = (input, output) ->


All the data from the standard input is aggregated before running through a
transpiler since individual data chunks may not represent valid / parseable
data.


      source = ""
      input.on("data", (chunck) -> source = source.concat(chunck))


Once all data from the input has being read, we attempt to tranpile it
and write it to standard output.


      input.once("end", ->
        try
          output.write(transpile(source))
        catch error
          exit(error))


If anything goes wrong during reading / writing or transpilation we
**exit** a program.


      input.once("error", exit)
      output.once("error", exit)


Although we don't just exit, if we run into error we report it and exit
with exit code `1`. If there are no errors we still exit, but with exit
code `0`.


    #!/usr/bin/env clojure
    (defn exit [error]
      (if (nil? error)
        (.exit process 0)
        (do (.log console error)
            (.exit process 1))))


Also main task is wrapped in a function that opens standard input and
passes both input and output to the compiler to do the job.


    (defn main []
      (if (< process.argv.length 3)
        (do (.resume process.stdin)
            (.set-encoding :utf-8 process.stdin)
            (compile process.stdin process.stdout))
        (._load Module (.resolve path (get process.argv 2)) nil true)))


If code is executed as a program (in which case it will it's going to be
a main module)


    (if (identical? require.main module)


Program performs it's primary task by executing `main` function.


      (main))


Also we will be exporting main function such that it could be called from
the other programs:


    #!/usr/bin/env javascript
    module.exports = main


----------------------------------------- 

> While editor mode recognizes languages that can compile to JS, prose compiler
> does not, but support for that is coming soon!

[markdown]:http://daringfireball.net/projects/markdown
[marked]:https://github.com/chjj/marked
[Literate_programming]:http://en.wikipedia.org/wiki/Literate_programming
[Literate coffeescript]:https://gist.github.com/3790135
[code block]:http://daringfireball.net/projects/markdown/syntax#precode
[shebang]:http://en.wikipedia.org/wiki/Shebang_%28Unix%29 


