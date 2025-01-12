// Generated by CoffeeScript 3.0.0
(function() {
  // This **Browser** compatibility layer extends core CoffeeScript functions
  // to make things work smoothly when compiling code directly in the browser.
  // We add support for loading remote Coffee scripts via **XHR**, and
  // `text/coffeescript` script tags, source maps via data-URLs, and so on.
  var CoffeeScript, compile,
    indexOf = [].indexOf;

  CoffeeScript = require('./coffeescript');

  ({compile} = CoffeeScript);

  // Use `window.eval` to evaluate code, rather than just `eval`, to run the
  // script in a clean global scope rather than inheriting the scope of the
  // CoffeeScript compiler. (So that `cake test:browser` also works in Node,
  // use either `window.eval` or `global.eval` as appropriate).
  CoffeeScript.eval = function(code, options = {}) {
    var globalRoot;
    if (options.bare == null) {
      options.bare = true;
    }
    globalRoot = typeof window !== "undefined" && window !== null ? window : global;
    return globalRoot['eval'](compile(code, options));
  };

  // Running code does not provide access to this scope.
  CoffeeScript.run = function(code, options = {}) {
    options.bare = true;
    options.shiftLine = true;
    return Function(compile(code, options))();
  };

  // Export this more limited `CoffeeScript` than what is exported by
  // `index.coffee`, which is intended for a Node environment.
  module.exports = CoffeeScript;

  // If we’re not in a browser environment, we’re finished with the public API.
  if (typeof window === "undefined" || window === null) {
    return;
  }

  // Include source maps where possible. If we’ve got a base64 encoder, a
  // JSON serializer, and tools for escaping unicode characters, we’re good to go.
  // Ported from https://developer.mozilla.org/en-US/docs/DOM/window.btoa
  if ((typeof btoa !== "undefined" && btoa !== null) && (typeof JSON !== "undefined" && JSON !== null)) {
    compile = function(code, options = {}) {
      options.inlineMap = true;
      return CoffeeScript.compile(code, options);
    };
  }

  // Load a remote script from the current domain via XHR.
  CoffeeScript.load = function(url, callback, options = {}, hold = false) {
    var xhr;
    options.sourceFiles = [url];
    xhr = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP') : new window.XMLHttpRequest();
    xhr.open('GET', url, true);
    if ('overrideMimeType' in xhr) {
      xhr.overrideMimeType('text/plain');
    }
    xhr.onreadystatechange = function() {
      var param, ref;
      if (xhr.readyState === 4) {
        if ((ref = xhr.status) === 0 || ref === 200) {
          param = [xhr.responseText, options];
          if (!hold) {
            CoffeeScript.run(...param);
          }
        } else {
          throw new Error(`Could not load ${url}`);
        }
        if (callback) {
          return callback(param);
        }
      }
    };
    return xhr.send(null);
  };

  // Activate CoffeeScript in the browser by having it compile and evaluate
  // all script tags with a content-type of `text/coffeescript`.
  // This happens on page load.
  CoffeeScript.runScripts = function() {
    var coffees, coffeetypes, execute, i, index, j, len, s, script, scripts;
    scripts = window.document.getElementsByTagName('script');
    coffeetypes = ['text/coffeescript', 'text/literate-coffeescript'];
    coffees = (function() {
      var j, len, ref, results;
      results = [];
      for (j = 0, len = scripts.length; j < len; j++) {
        s = scripts[j];
        if (ref = s.type, indexOf.call(coffeetypes, ref) >= 0) {
          results.push(s);
        }
      }
      return results;
    })();
    index = 0;
    execute = function() {
      var param;
      param = coffees[index];
      if (param instanceof Array) {
        CoffeeScript.run(...param);
        index++;
        return execute();
      }
    };
    for (i = j = 0, len = coffees.length; j < len; i = ++j) {
      script = coffees[i];
      (function(script, i) {
        var options, source;
        options = {
          literate: script.type === coffeetypes[1]
        };
        source = script.src || script.getAttribute('data-src');
        if (source) {
          options.filename = source;
          return CoffeeScript.load(source, function(param) {
            coffees[i] = param;
            return execute();
          }, options, true);
        } else {
          // `options.filename` defines the filename the source map appears as
          // in Developer Tools. If a script tag has an `id`, use that as the
          // filename; otherwise use `coffeescript`, or `coffeescript1` etc.,
          // leaving the first one unnumbered for the common case that there’s
          // only one CoffeeScript script block to parse.
          options.filename = script.id && script.id !== '' ? script.id : `coffeescript${i !== 0 ? i : ''}`;
          options.sourceFiles = ['embedded'];
          return coffees[i] = [script.innerHTML, options];
        }
      })(script, i);
    }
    return execute();
  };

  // Listen for window load, both in decent browsers and in IE.
  // Only attach this event handler on startup for the
  // non-ES module version of the browser compiler, to preserve
  // backward compatibility while letting the ES module version
  // be importable without side effects.
  if (this === window) {
    if (window.addEventListener) {
      window.addEventListener('DOMContentLoaded', CoffeeScript.runScripts, false);
    } else {
      window.attachEvent('onload', CoffeeScript.runScripts);
    }
  }

}).call(this);
