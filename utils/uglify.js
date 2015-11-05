#!/usr/bin/env node

/*
  uglify.js - concatenate and uglify source files

    For usage:

      $ node uglify.js --help

    Example:

      ### cat all scripts include the core (maps-gpx.js)
      $ node uglify.js --all \
        --script=packed.js --style=packed.css

      ### cat specifying plugins only
      $ node uglify.js --no-core \
        --script=packed.js Droppable QueryURL

  Note:
    If you will see a message like "extra bundle"
    in the tail of stdout as result,
    then these are not contained in uglify files.

**/

var fs    = require('fs');
var path  = require('path');

//
// parse command line
//
var argv = require('yargs')
    .usage('Usage: $0 [--options] [plugin names]')
    .help('h')
    .alias('h', 'help')
    .boolean('core')
    .default('core', true)
    .alias('c', 'core')
    .describe('core', 'contains core script')
    .default('plugins-dir', '../plugins')
    .alias('d', 'plugins-dir')
    .describe('plugins-dir', 'plugins dir')
    .nargs('script', 1)
    .describe('script', 'output file of uglify script')
    .nargs('style', 1)
    .describe('style', 'output file of uglify style')
    .boolean('verbose')
    .default('verbose', false)
    .alias('v', 'verbose')
    .describe('verbose', 'with debug print')
    .boolean('force')
    .default('force', false)
    .alias('f', 'force')
    .describe('force', 'overwrite output file(s)')
    .boolean('extra')
    .default('extra', true)
    .alias('e', 'extra')
    .describe('extra', 'show extra bundles')
    .boolean('all')
    .default('all', false)
    .alias('a', 'all')
    .describe('all', 'contains all plugins')
    .argv;

var debug_print = function(message){
  if ( argv.verbose ) {
    console.log(message)
  }
};


//
// target plugins
//
var expected_dirs = [];
if ( ! argv['all'] ) {
  expected_dirs = argv._;
} else {
  expected_dirs = fs.readdirSync(argv['plugins-dir']);
}
var dirs = expected_dirs.filter(function (file){
    return file.substr(0,1).match(/^[A-Z]/);
  })
  .map(function (subdir){
    return path.join(argv['plugins-dir'], subdir)
  })
  .filter(function (plugindir){
    return fs.statSync(plugindir).isDirectory();
  });

//
// parse
//
var UglifyJS  = require('uglify-js');
var scripts   = [];
var styles    = [];
var extras    = [];
dirs.forEach(function (pluginpath){
  var body,
      loaderjs = path.join(pluginpath, 'loader.js'),
      toplevel = UglifyJS.parse(fs.readFileSync(loaderjs).toString());
  toplevel.figure_out_scope();
  body = toplevel.globals.toObject().$MapsGPX.scope.body[0].body;
  debug_print("- "+ pluginpath);

  scripts.push(loaderjs);
  body.right.properties.forEach(function(element) {
    if ( element.key == 'bundles' ) {
      element.value.elements.forEach(function(bundle) {
        var target = bundle.value;
        debug_print('  + '+ target);
        if ( ! target.match(/\//) ) {
          if ( target.match(/\.css$/) ) {
            styles.push(path.join(pluginpath, target));
          } else if ( target.match(/\.js$/) ) {
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

if ( argv.script ) {
  debug_print('bundle these scripts:');
  scripts.forEach(function (target){
    debug_print('- '+ target);
  });
  if ( argv.core ) {
    // check core
    var core_script = path.join(argv['plugins-dir'], '..', 'maps-gpx.js');
    fs.access(core_script, fs.R_OK, function (err){
      if ( err ) {
        throw new Error('the core script cannot be opened: '+ core_script);
      }
    });
    scripts.unshift(core_script);
  }
  fs.access(argv.script, fs.R_OK, function (err){
    if ( ! err && ! argv.force ) {
      throw new Error('file for writing exists: '+ argv.script);
    }
    fs.writeFileSync(argv.script, UglifyJS.minify(scripts).code);
  });
}

if ( argv.style ) {
  debug_print('bundle these styles:');
  styles.forEach(function (target){
    debug_print('- '+ target);
  });
  fs.access(argv.style, fs.R_OK, function (err){
    if ( ! err && ! argv.force ) {
      throw new Error('file for writing exists: '+ argv.style);
    }
    fs.writeFileSync(argv.style, require('uglifycss').processFiles(styles));
  });
}

if ( argv.extra ) {
  if ( extras.length < 1 ) {
    console.info('no extra bundle is found');
  } else {
    if ( extras.length == 1 ) {
      console.info('an extra bundle is found: ');
    } else {
      console.info('extra bundles are found: ');
    }
    extras.forEach(function (target){
      console.info(target);
    });
  }
}
