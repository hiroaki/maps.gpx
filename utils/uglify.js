#!/usr/bin/env node

/*
  uglify.js - concatenate and uglify source files

  To see the usage:

    $ node uglify.js --help

  Note:
    If you will see a message like "extra bundle"
    in the tail of stdout as result,
    then these are not contained in uglify files.

**/

var fs        = require('fs');
var path      = require('path');
var uglifyjs  = require('uglify-js');
var uglifycss = require('uglifycss');
var topdir    = path.join(__dirname, '..');

//
// parse command line
//
var argv = require('yargs')
    .usage('Usage: $0 [--options] [plugin names]')
    .example( '$0 -a -o packed.js -o packed.css',
              'All scripts (which includes the core) and styles')
    .example('')
    .example( '$0 --no-core -o packed.js Droppable QueryURL',
              'Specifying plugins only')
    .example('')
    .example( '$0 -o packed.js -u ext1.js -u ext2.js',
              'Append ext1.js and ext2.js to the head of list')
    .example('')
    .example( '$0 -o packed.css -p ext1.css -u ext2.js',
              'Append ext1.css to the tail of list (not include ext2 because it is "js")')
    .example('')
    .help('h').alias('h', 'help')
    .describe('all', 'All plugins').alias('a', 'all').boolean('all').default('all', false)
    .describe('core', 'With the core script (is maps-gpx.js)').alias('c', 'core').boolean('core').default('core', true)
    .describe('extra', 'Show extra bundles').alias('e', 'extra').boolean('extra').default('extra', true)
    .describe('force', 'Overwrite output file(s)').alias('f', 'force').boolean('force').default('force', false)   
    .describe('output', 'Output file of uglify ".js" or ".css"').alias('o', 'output').default('output', [])
    .describe('plugins-dir', 'Directory of the "plugins"').alias('d', 'plugins-dir').default('plugins-dir', path.join(topdir, 'plugins'))
    .describe('push', 'Append specifying script.js or style.css to tail of list').alias('p', 'push').default('push', [])
    .describe('unshift', 'Append specifying script.js or style.css to head of list').alias('u', 'unshift').default('unshift', [])
    .describe('verbose', 'Debug print').alias('v', 'verbose').boolean('verbose').default('verbose', false)
    .argv;

var debug_print = function(message) { if ( argv.verbose ) console.log(message) };
var filter_js   = function(name) { return name.match(/\.js$/) };
var filter_css  = function(name) { return name.match(/\.css$/) };

//
// target plugins
//
var expected_dirs = [];
if ( ! argv['all'] ) {
  expected_dirs = argv._;
} else {
  expected_dirs = fs.readdirSync(argv['plugins-dir']);
}
var dirs = expected_dirs.filter(function (file) {
    return file.substr(0,1).match(/^[A-Z]/);
  })
  .map(function(subdir) {
    return path.join(argv['plugins-dir'], subdir)
  })
  .filter(function(plugindir) {
    return fs.statSync(plugindir).isDirectory();
  });

//
// parse each plugins
//
var scripts   = [];
var styles    = [];
var extras    = [];
dirs.forEach(function(pluginpath) {
  var body,
      loaderjs = path.join(pluginpath, 'loader.js'),
      toplevel = uglifyjs.parse(fs.readFileSync(loaderjs).toString());
  toplevel.figure_out_scope();
  body = toplevel.globals.toObject().$MapsGPX.scope.body[0].body;
  debug_print("[plugin:path] "+ pluginpath);

  scripts.push(loaderjs);
  body.right.properties.forEach(function(element) {
    if ( element.key == 'bundles' ) {
      element.value.elements.forEach(function(bundle) {
        var target = bundle.value;
        debug_print('    [bundle] '+ target);
        if ( ! target.match(/\//) ) {
          if ( filter_css.call(null, target) ) {
            styles.push(path.join(pluginpath, target));
          } else if ( filter_js.call(null, target) ) {
            scripts.push(path.join(pluginpath, target));
          } else {
            extras.push(target);
          }
        } else {
          extras.push(target);
        }
      });
    }
  });
});

//
// results
//
var generator = function(list, filter, uglify) {
  var output = [].concat(this.output).filter(filter).shift();
  if ( ! output ) {
    return;
  }
  // appendixes
  if ( this['unshift'] ) {
    list = [].concat(this['unshift']).filter(filter).concat(list);
  }
  if ( this['push'] ) {
    list = list.concat(this['push'].filter(filter));
  }
  // output
  fs.access(output, fs.R_OK, function(err) {
    if ( ! err && ! this.force ) {
      throw new Error('file for writing already exists: '+ output);
    }
    debug_print('[list:output] '+ output);
    debug_print(list);
    fs.writeFileSync(output, uglify.call(null, list));
  }.bind(this));
};

// (A) generate an uglify js
if ( argv.core ) {
  var core_script = path.join(argv['plugins-dir'], '..', 'maps-gpx.js');
  fs.accessSync(core_script, fs.R_OK, function(err) {
    if ( err ) {
      throw new Error('the core script cannot be opened: '+ core_script);
    }
  });
  scripts.unshift(core_script);
}
generator.call(argv, scripts, filter_js, function(files) {
  return uglifyjs.minify(files).code;
});

// (B) generate an uglify css
generator.call(argv, styles, filter_css, function(files) {
  return uglifycss.processFiles(files);
});

// (C) extra information
if ( argv.extra ) {
  if ( 1 <= extras.length ) {
    if ( extras.length == 1 ) {
      console.info('an extra bundle is found: ');
    } else {
      console.info('extra bundles are found: ');
    }
    extras.forEach(function(target) {
      console.info(target);
    });
  }
}
