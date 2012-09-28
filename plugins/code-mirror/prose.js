CodeMirror.defineMode("prose", function(cmCfg, modeCfg) {
  // Prose mode for code-mirror bring "Literate programming" paradigm.
  // It treats all the text as ordinary human language written in markdown.
  // Markdown codeblocks 

  // Shim String.prototype.trim() if runtime does not implements it.
  if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, "");
    };
  }


  var startState = CodeMirror.startState;
  var copyState = CodeMirror.copyState;

  // Prose literate mode is based of markdown, if embedding has no markdown
  // handler fallback to text/plain for literate.
  var base = CodeMirror.mimeModes.hasOwnProperty("text/x-markdown") ?
    CodeMirror.getMode(cmCfg, "text/x-markdown") :
    CodeMirror.getMode(cmCfg, "text/plain");

  function figureMode(stream) {
    // Line will be shebang
    var line = stream.string.trim();
    return line.substr(0, 2) === "#!" ? line.split(' ').pop().split('/').pop()
                                      : null;
  }

  function getMode(name) {
    return CodeMirror.modes.hasOwnProperty(name) &&
           CodeMirror.getMode(cmCfg, name);
  }

  return {
    startState: function() {
      var outer = { mode: base, state: startState(base) };
      var inner = { mode: null, state: null };
      return { inner: inner, outer: outer, active: outer };
    },
    copyState: function(state) {
      var outer = {
        mode: state.outer.mode,
        state: copyState(state.outer.mode, state.outer.state)
      };
      var inner = {
        mode: state.inner.mode,
        state: state.inner.state &&
               copyState(state.inner.mode, state.inner.state)
      };
      var active = state.outer === state.active ? outer : inner;
      return { outer: outer, inner: inner, active: active };
    },
    token: function(stream, state) {
      var active = state.active;
      var inner = state.inner;
      var outer = state.outer;
      var token = active.mode.token(stream, active.state);
      if (active === outer && token === "comment") {
        if (stream.current() === '`') {
          stream.skipTo('`');
          token = token.concat(' code');
        } else {
          var lang = figureMode(stream);
          var mode = lang && getMode(lang) || outer.mode;
          if (!lang) {
            state.active = state.inner;
          } else if (inner.mode != mode) {
            state.inner = {
              mode: mode,
              state: startState(mode, stream.indentation())
            };
            state.active = state.inner;
          }
          if (!lang && state.active !== outer) {
            stream.backUp(stream.current().length);
            token = state.active.mode.token(stream, state.active.state);
          }
        }
      }
      if (state.active === outer) token = token ? token.concat(' prose') : 'prose'
      return token;
    },
    blankLine: function(state) {
      var outer = state.outer;
      state.active = outer;
      return outer.mode.blankLine(outer.state);
    },

    indent: function(state, suffix) {
      var active = state.active;
      return active.mode.indent ? active.mode.indent(active.state, suffix)
                                : CodeMirror.Pass;
    },
    electricChars: base.electricChars
  };
});

