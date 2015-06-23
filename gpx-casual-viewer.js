/*
 * GPX Casual Viewer v3
 *   Copyright 2009-2015 WATANABE Hiroaki
 *   Released under the MIT license
 */

function GPXCasualViewer() {
  this.initialize.apply(this, arguments);
}

// constants, do not change these value
GPXCasualViewer.VERSION   = '2.3.0';
GPXCasualViewer.ELEMENTS  = {
  AGEOFDGPSDATA: 'ageofdgpsdata',
  AUTHOR: 'author',
  BOUNDS: 'bounds',
  CMT: 'cmt',
  COPYRIGHT: 'copyright',
  DESC: 'desc',
  DGPSID: 'dgpsid',
  ELE: 'ele',
  EMAIL: 'email',
  EXTENSIONS: 'extensions',
  FIX: 'fix',
  GEOIDHEIGHT: 'geoidheight',
  GPX: 'gpx',
  HDOP: 'hdop',
  KEYWORDS: 'keywords',
  LICENSE: 'license',
  LINK: 'link',
  MAGVAR: 'magvar',
  METADATA: 'metadata',
  NAME: 'name',
  NUMBER: 'number',
  PDOP: 'pdop',
  PT: 'pt',
  RTE: 'rte',
  RTEPT: 'rtept',
  SAT: 'sat',
  SRC: 'src',
  TEXT: 'text',
  TIME: 'time',
  TRK: 'trk',
  TRKPT: 'trkpt',
  TRKSEG: 'trkseg',
  TYPE: 'type',
  VDOP: 'vdop',
  WPT: 'wpt',
  YEAR: 'year'
}

// global properties, you can change
GPXCasualViewer.strict        = true;
GPXCasualViewer.join_trkseg   = true;
GPXCasualViewer.plugin_dir    = './plugins';
GPXCasualViewer.scrip_loader  = 'loader.js';
GPXCasualViewer.style_loader  = 'loader.css';

// common util
GPXCasualViewer.parseQueryString = function(/* usually 'location.search' */qstring) {
  var params = {};
  if ( qstring ) {
    var str = qstring.match(/^\?/) ? qstring.substring(1) : qstring;
    var pairs = str.split(/[;&]/);
    for (var i = 0, l = pairs.length; i < l; ++i) {
      var pair = pairs[i].split('=');
      if ( pair[0] ) {
        params[pair[0]] = decodeURIComponent(pair[1]);
      }
    }
  }
  return params;
}
GPXCasualViewer.parseXML = function(str) {
  if ( typeof ActiveXObject != 'undefined' && typeof GetObject != 'undefined' ) {
    var doc = new ActiveXObject('Microsoft.XMLDOM');
    doc.loadXML(str);
    return doc;
  }
  if ( typeof DOMParser != 'undefined' ) {
    return (new DOMParser()).parseFromString(str, 'text/xml');
  }
  throw( new Error('Cannot parse string as XML stream.') );
}
GPXCasualViewer.createXMLHttpRequest = function() {
  try {
    if ( typeof ActiveXObject != 'undefined' ) {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } else if ( window['XMLHttpRequest'] ) {
      return new XMLHttpRequest();
    }
  } catch(e) {
    throw( new Error('Cannot create XmlHttpRequest object.') );
  }
  return null;
}
GPXCasualViewer.resolveAsBlob = function(src) {
  if ((src instanceof Blob) || (src instanceof File)) {
    return Promise.resolve(src);
  } else if (typeof src == 'string') {
    return new Promise(function(resolve, reject) {
      var xhr = GPXCasualViewer.createXMLHttpRequest();
      xhr.open('GET', src, true);
      xhr.responseType = 'blob';
      xhr.onload = function (ev){
        if (this.readyState === 4 ) {
          if (this.status === 200 || this.status === 0 ) {
            resolve(this.response);
          }
        }
      };
      xhr.send();
    });
  }
}
GPXCasualViewer.resolveAsArrayBuffer = function(src) {
  return GPXCasualViewer.resolveAsBlob(src).then(function(blob) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(event) {
        resolve(event.target.result);
      };
      reader.readAsArrayBuffer(blob);
    });
  });
}
GPXCasualViewer.resolveAsObjectURL = function(src) {
  return GPXCasualViewer.resolveAsBlob(src).then(function(blob) {
    return new Promise(function(resolve, reject) {
      resolve(URL.createObjectURL(blob));
    });
  });
}
GPXCasualViewer.resolveAsDataURL = function(src) {
  return GPXCasualViewer.resolveAsBlob(src).then(function(blob) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(event) {
        resolve(event.target.result);
      };
      reader.readAsDataURL(blob);
    });
  });
}
GPXCasualViewer.resolveAsText = function(src, encoding) {
  return GPXCasualViewer.resolveAsBlob(src).then(function(blob) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(event) {
        resolve(event.target.result);
      };
      reader.readAsText(blob, encoding || 'UTF-8');
    });
  });
}

// convert gpx document to json
GPXCasualViewer.GPXToJSON = function( xml_document ) {
  var linkTypeToJson = function(/*dom node <link>*/node) {
    var obj = {
      href: node.getAttribute('href')
      };
    var nc = node.childNodes;
    for ( var i = 0, l = nc.length; i < l; ++i ) {
      if ( nc[i].firstChild ) {
        obj[nc[i].tagName] = nc[i].firstChild.nodeValue;
      }
    }
    return obj;
  };
  var wptTypeToJson = function(/*dom node <wpt>*/node) {
    var obj = {
      lat: node.getAttribute('lat'),
      lon: node.getAttribute('lon'),
      link: []
      };
    var nc = node.childNodes;
    for ( var i = 0, l = nc.length; i < l; ++i ) {
      var tag = nc[i].tagName;
      if ( tag == GPXCasualViewer.ELEMENTS.LINK ) {
        obj[GPXCasualViewer.ELEMENTS.LINK].push( linkTypeToJson(nc[i]) );
      } else if ( tag != GPXCasualViewer.ELEMENTS.EXTENSIONS ) {
        if ( nc[i].firstChild ) {
          obj[nc[i].tagName] = nc[i].firstChild.nodeValue;
        }
      }
    }
    return obj;
  };
  var rteTypeToJson = function(/*dom node <rte>*/node) {
    var obj = {
      rtept: []
      };
    var nc = node.childNodes;
    for ( var i = 0, l = nc.length; i < l; ++i ){
      var tag = nc[i].tagName;
      if ( tag == GPXCasualViewer.ELEMENTS.RTEPT ) {
        obj[GPXCasualViewer.ELEMENTS.RTEPT].push( wptTypeToJson(nc[i]) );
      } else if ( tag != GPXCasualViewer.ELEMENTS.EXTENSIONS ) {
        if ( nc[i].firstChild ){
          obj[tag] = nc[i].firstChild.nodeValue;
        }
      }
    }
    return obj;
  };
  var trksegTypeToJson = function(/*dom node <trkseg>*/node) {
    var obj = {
      trkpt: []
      };
    var nc = node.childNodes;
    for ( var i = 0, l = nc.length; i < l; ++i ) {
      var tag = nc[i].tagName;
      if ( tag == GPXCasualViewer.ELEMENTS.TRKPT ) {
        obj[GPXCasualViewer.ELEMENTS.TRKPT].push( wptTypeToJson(nc[i]) );
      } else if ( tag != GPXCasualViewer.ELEMENTS.EXTENSIONS ) {
        if ( nc[i].firstChild ) {
          obj[tag] = nc[i].firstChild.nodeValue;
        }
      }
    }
    return obj;
  };
  var trkTypeToJson = function(/*dom node <trk>*/node) {
    var obj = {
      trkseg: []
      };
    var nc = node.childNodes;
    for ( var i = 0, l = nc.length; i < l; ++i ) {
      var tag = nc[i].tagName;
      if ( tag == GPXCasualViewer.ELEMENTS.TRKSEG ) {
        obj[GPXCasualViewer.ELEMENTS.TRKSEG].push( trksegTypeToJson(nc[i]) );
      } else if ( tag != GPXCasualViewer.ELEMENTS.EXTENSIONS ) {
        if ( nc[i].firstChild ) {
          obj[tag] = nc[i].firstChild.nodeValue;
        }
      }
    }
    return obj;
  };
  var gpxTypeToJson = function(/*dom node <gpx>*/node) {
    var obj = {
      metadata: {},
      wpt: [],
      rte: [],
      trk: []
      };
    if ( GPXCasualViewer.strict ) {
      obj['version'] = node.getAttribute('version');
      obj['creator'] = node.getAttribute('creator');
      if ( obj.version != '1.1' ) {
        throw( new Error('GPX document is formatted as unsupported version, it requires 1.1 only.') );
      }
      if ( ! obj.creator ) {
        throw( new Error('Element "gpx" does not have attribute "creator" that is required.') );
      }
    }
    var nc = node.childNodes;
    for ( var i = 0, l = nc.length; i < l; ++i ) {
      var tag = nc[i].tagName;
      if ( tag == GPXCasualViewer.ELEMENTS.WPT ) {
        obj[GPXCasualViewer.ELEMENTS.WPT].push( wptTypeToJson(nc[i]) );
      } else if ( tag == GPXCasualViewer.ELEMENTS.RTE ) {
        obj[GPXCasualViewer.ELEMENTS.RTE].push( rteTypeToJson(nc[i]) );
      } else if ( tag == GPXCasualViewer.ELEMENTS.TRK ) {
        obj[GPXCasualViewer.ELEMENTS.TRK].push( trkTypeToJson(nc[i]) );
      } else if ( tag != GPXCasualViewer.ELEMENTS.EXTENSIONS && tag != GPXCasualViewer.ELEMENTS.METADATA ) {
        if ( nc[i].firstChild ) {
          obj[tag] = nc[i].firstChild.nodeValue;
        }
      }
    }
    return obj;
  };

  var gpx = gpxTypeToJson( xml_document.getElementsByTagName(GPXCasualViewer.ELEMENTS.GPX)[0] );
  var bounds, i, j;
  bounds = GPXCasualViewer.boundsOf(gpx.wpt, bounds);
  for ( i = 0, l = gpx.rte.length; i < l; ++i ) {
    bounds = GPXCasualViewer.boundsOf(gpx.rte[i].rtept, bounds);
  }
  for ( i = 0, l = gpx.trk.length; i < l; ++i ) {
    for ( j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ) {
      bounds = GPXCasualViewer.boundsOf(gpx.trk[i].trkseg[j].trkpt, bounds);
    }
  }
  gpx.metadata[GPXCasualViewer.ELEMENTS.BOUNDS] = bounds;
  return gpx;
}

// make bounds
GPXCasualViewer.boundsOf = function (pts, bounds){
  bounds = bounds || {
    minlat:  90.0,
    maxlat: -90.0,
    minlon: 180.0,
    maxlon:-180.0
    };
  for ( var i = 0, l = pts.length; i < l; ++i ) {
    if ( pts[i].lat < bounds.minlat ) {
      bounds.minlat = pts[i].lat;
    }
    if ( bounds.maxlat < pts[i].lat ) {
      bounds.maxlat = pts[i].lat;
    }
    if ( pts[i].lon < bounds.minlon ) {
      bounds.minlon = pts[i].lon;
    }
    if ( bounds.maxlon < pts[i].lon ) {
      bounds.maxlon = pts[i].lon;
    }
  }
  return bounds;
}

// extend google.maps.LatLngBounds
GPXCasualViewer.LatLngBounds = function(sw, ne) {
  this.super      = google.maps.LatLngBounds.prototype;
  google.maps.LatLngBounds.apply(this, arguments);
}
  GPXCasualViewer.LatLngBounds.prototype = Object.create(google.maps.LatLngBounds.prototype, {
    constructor: { value: GPXCasualViewer.LatLngBounds }
  });
  GPXCasualViewer.LatLngBounds.prototype.clone = function (){
    return new GPXCasualViewer.LatLngBounds(this.getSouthWest(), this.getNorthEast());
  }

// extend google.maps.Marker
GPXCasualViewer.Marker = function (element_name, src, opts) {
  this.super      = google.maps.Marker.prototype;
  this._element   = element_name;
  this._source    = src;
  this._overlayed = null;

  var wpt_type = src;
  var options = opts || {};
  options.position = new google.maps.LatLng(wpt_type.lat, wpt_type.lon);

  google.maps.Marker.apply(this, [options]);
}
  GPXCasualViewer.Marker.prototype = Object.create(google.maps.Marker.prototype, {
    constructor: { value: GPXCasualViewer.Marker },
    overlayed: function () { return this._overlayed } // extend
  });
  GPXCasualViewer.Marker.prototype.isWpt = function () {
    return this._element == GPXCasualViewer.WPT ? true : false
  };
  GPXCasualViewer.Marker.prototype.isRte = function () {
    return this._element == GPXCasualViewer.RTE ? true : false
  };
  GPXCasualViewer.Marker.prototype.isTrk = function () {
    return this._element == GPXCasualViewer.TRK ? true : false
  };
  GPXCasualViewer.Marker.prototype.getSource = function () {
    return this._source;
  };
  GPXCasualViewer.Marker.prototype.setMap = function (g_map) { // override
    this._overlayed = g_map ? true : false;
    this.super.setMap.call(this, g_map);
  }
// extend google.maps.Polyline
GPXCasualViewer.Polyline = function (element_name, src, opts) {
  this.super      = google.maps.Polyline.prototype;
  this._element   = element_name;
  this._source    = src;
  this._overlayed = null;

  var pts = src;
  var options = opts || {};
  options.path = new google.maps.MVCArray();
  var i = 0;
  for ( var j = 0, m = pts.length; j < m; ++j ) {
    options.path.insertAt(i++, new google.maps.LatLng(pts[j].lat, pts[j].lon));
  }

  google.maps.Polyline.apply(this, [options]);
}
  GPXCasualViewer.Polyline.prototype = Object.create(google.maps.Polyline.prototype, {
    constructor: { value: GPXCasualViewer.Polyline },
    overlayed: function () { return this._overlayed } // extend
  });
  GPXCasualViewer.Polyline.prototype.isWpt = function () {
    return this._element == GPXCasualViewer.ELEMENTS.WPT ? true : false
  };
  GPXCasualViewer.Polyline.prototype.isRte = function () {
    return this._element == GPXCasualViewer.ELEMENTS.RTE ? true : false
  };
  GPXCasualViewer.Polyline.prototype.isTrk = function () {
    return this._element == GPXCasualViewer.ELEMENTS.TRK ? true : false
  };
  GPXCasualViewer.Polyline.prototype.getSource = function () {
    return this._source;
  };
  GPXCasualViewer.Polyline.prototype.setMap = function (g_map) { // override
    this._overlayed = g_map ? true : false;
    this.super.setMap.call(this, g_map);
  };
  GPXCasualViewer.Polyline.prototype.computeDistanceLinear = function(origin, destination) {
    var src = this.getSource();
    return google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(src[parseInt(origin)].lat, src[parseInt(origin)].lon),
      new google.maps.LatLng(src[parseInt(destination)].lat, src[parseInt(destination)].lon)
      );
  };
  GPXCasualViewer.Polyline.prototype.computeDistanceTrack = function(origin, destination) {
    var src = this.getSource();
    var sum = 0.0, i, l;
    origin = parseInt(origin);
    destination = parseInt(destination);
    if ( origin <= destination ) {
      for ( i = origin, l = destination; i < l; ++i ) {
        var s = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(src[i].lat, src[i].lon),
                new google.maps.LatLng(src[i + 1].lat, src[i + 1].lon)
                );
        sum = parseFloat(sum) + parseFloat(s);
      }
    } else {
      for ( i = origin, l = destination; l < i; --i ) {
        var s = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(src[i].lat, src[i].lon),
                new google.maps.LatLng(src[i - 1].lat, src[i - 1].lon)
                );
        sum = parseFloat(sum) - parseFloat(s);
      }
    }
    return sum;
  };

// factories to create extended maps objects
GPXCasualViewer.createLatlngbounds = function (bounds) {
  return new GPXCasualViewer.LatLngBounds(
    new google.maps.LatLng(bounds.minlat, bounds.minlon),
    new google.maps.LatLng(bounds.maxlat, bounds.maxlon)
    );
}
GPXCasualViewer.createOverlayAsWpt = function (src, options) {
  if ( src instanceof Array ) {
    throw( new Error('overlay for wpt is not created from Array') );
  } else {
    return new GPXCasualViewer.Marker(GPXCasualViewer.ELEMENTS.WPT, src, options);
  }
}
GPXCasualViewer.createOverlayAsRte = function (src, options) {
  if ( src instanceof Array ) {
    return new GPXCasualViewer.Polyline(GPXCasualViewer.ELEMENTS.RTE, src, options);
  } else {
    return new GPXCasualViewer.Marker(GPXCasualViewer.ELEMENTS.RTE, src, options);
  }
}
GPXCasualViewer.createOverlayAsTrk = function (src, options) {
  if ( src instanceof Array ) {
    return new GPXCasualViewer.Polyline(GPXCasualViewer.ELEMENTS.TRK, src, options);
  } else {
    return new GPXCasualViewer.Marker(GPXCasualViewer.ELEMENTS.TRK, src, options);
  }
}

// Interface GPXCasualViewer.InputHandler
GPXCasualViewer.InputHandler = function() {
  this.initialize.apply(this, arguments);
}
GPXCasualViewer.InputHandler.prototype.initialize = function(type, handler) {
  this.type = type;
  this.handler = handler;
};
GPXCasualViewer.InputHandler.prototype.setType = function(type) {
  this.type = type;
  return this;
};
GPXCasualViewer.InputHandler.prototype.getType = function() {
  return this.type;
};
GPXCasualViewer.InputHandler.prototype.setHandler = function(handler) {
  this.handler = handler;
  return this;
};
GPXCasualViewer.InputHandler.prototype.getHandler = function() {
  return this.handler;
};
GPXCasualViewer.InputHandler.defaultHandler = function(key, src) {
  return Promise.then(function (obj){ return key });
};
GPXCasualViewer.InputHandler.prototype.execute = function (bind, key, src){
  return (this.getHandler() || GPXCasualViewer.InputHandler.defaultHandler).call(bind, key, src);
};

// default input handler for application/gpx
GPXCasualViewer.defaultInputHandlerApplicationGPX = function(key, src) {
  return GPXCasualViewer.resolveAsText(src)
    .then((function (gpx_text){ // resolveAsText makes gpx_text from src
      this.addGPX(key, gpx_text);
      return key;
    }).bind(this));
};

// constructor of class GPXCasualViewer
GPXCasualViewer.prototype.initialize = function(map_id, map_options, options) {
  this.map          = null;
  this.map_id       = map_id;
  this.map_options  = map_options || {};
  this.map_element  = document.getElementById(this.map_id);
  if ( ! this.map_element ) {
    throw( new Error('Could not get element by #'+ map_id) );
  }

  this.map_settings = {};
  this.map_defaults = {
    zoom: 5,
    keyboardShortcuts: false,
    center: new google.maps.LatLng(35.6841306, 139.774103),
    mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  for (var attr in this.map_defaults) { this.map_settings[attr] = this.map_defaults[attr] }
  for (var attr in this.map_options ) { this.map_settings[attr] = this.map_options[attr]  }

  // stash for gpx objects
  this.data = {}

  // stash for hooks
  this.hook = {
    onCreateLatlngbounds: [],
    onCreateMarker: [],
    onCreatePolyline: [],
    onAddGPX: []
  };

  // stash for input handlers by media types
  this.input_handler = {};

  // reset all
  this._afterInitialize();
};
GPXCasualViewer.prototype._afterInitialize = function() {
  // create universe
  this.map = new google.maps.Map(this.map_element, this.map_settings);

  // register default input handler for 'application/gpx'
  this.registerInputHandler(
    new GPXCasualViewer.InputHandler('application/gpx', GPXCasualViewer.defaultInputHandlerApplicationGPX));

  // apply default plugins
  this.use('SetTitleOnCreateMarker');
  this.use('SetStrokeOptionOnCreatePolyline');
};
GPXCasualViewer.prototype.getMap = function() {
  return this.map;
};
GPXCasualViewer.prototype.getMapElement = function() {
  return this.map_element;
};
GPXCasualViewer.prototype.getMapSettings = function() {
  return this.map_settings;
};
GPXCasualViewer.prototype.fitBounds = function() {
  var keys = [];
  if ( 0 < arguments.length ) {
    keys = Array.prototype.slice.call(arguments);
  } else {
    keys = this.getKeysOfGPX();
  }
  if ( 0 < keys.length ) {
    var bnd = this.getGPX(keys[0]).metadata.latlngbounds.clone();
    for ( var i = 1, l = keys.length; i < l; ++i ) {
      bnd.union( this.getGPX(keys[i]).metadata.latlngbounds );
    }
    this.getMap().fitBounds(bnd);
  }
  return this;
};
GPXCasualViewer.prototype._appearOverlay = function() {
  var to_show = arguments[0] ? this.map : null;
  var elem    = arguments[1];
  var keys    = Array.prototype.slice.call(arguments, 2);
  var i, il, j, jl, k, kl, m, ml;
  for ( i = 0, il = keys.length; i < il; ++i ) {
    var elements = this.data[keys[i]][elem];
    for ( j = 0, jl = elements.length; j < jl; ++j ) {
      if ( elements[j].overlay ){
        elements[j].overlay.setMap( to_show );
      }
      for ( k in elements[j] ) {
        if ( elements[j][k] instanceof Array ) {
          for ( m = 0, ml = elements[j][k].length; m < ml; ++m ) {
            if ( elements[j][k][m].overlay ) {
              elements[j][k][m].overlay.setMap( to_show );
            }
          }
        }
      }
    }
  }
  return this;
};
GPXCasualViewer.prototype.showOverlayWpts = function() {
  return this._appearOverlay( true, GPXCasualViewer.ELEMENTS.WPT, Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.hideOverlayWpts = function() {
  return this._appearOverlay(false, GPXCasualViewer.ELEMENTS.WPT, Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.showOverlayRtes = function() {
  return this._appearOverlay( true, GPXCasualViewer.ELEMENTS.RTE, Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.hideOverlayRtes = function() {
  return this._appearOverlay(false, GPXCasualViewer.ELEMENTS.RTE, Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.showOverlayTrks = function() {
  return this._appearOverlay( true, GPXCasualViewer.ELEMENTS.TRK, Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.hideOverlayTrks = function() {
  return this._appearOverlay(false, GPXCasualViewer.ELEMENTS.TRK, Array.prototype.slice.call(arguments));
};
GPXCasualViewer._guessType = function(src) {
  if ( typeof src == 'string' ) {
    // src may be URL string
    if ( new RegExp('\.jpe?g$', 'i').test(src) ) {
      return 'image/jpeg';
    }
  } else if ( src instanceof Blob ) {
    if ( src.type == 'image/jpeg' ) {
      return 'image/jpeg';
    }
  }
  return 'application/gpx';
};
GPXCasualViewer.prototype.registerInputHandler = function(input_handler) {
  if ( input_handler instanceof GPXCasualViewer.InputHandler ) {
    this.input_handler[input_handler.type] = input_handler;
  }else{
    throw( new Error('invalid argument, it requires instance of GPXCasualViewer.InputHandler') );
  }
  return this;
};
GPXCasualViewer.prototype._getInputHandlerByType = function(type) {
  var handler = this.input_handler[type];
  if ( handler ) {
    return handler;
  }
  return null;
};
GPXCasualViewer.prototype.input = function(key, src, type) {
  type = type || GPXCasualViewer._guessType(src);
  var handler = this._getInputHandlerByType(type);
  if ( handler ) {
    return handler.execute(this, key, src);
  } else {
    console.log('There is no handler for type=['+ type +']');
    return new GPXCasualViewer.InputHandler().execute(this, key, src);
  }
};
GPXCasualViewer.prototype.getGPX = function(key) {
  return this.data[key];
};
GPXCasualViewer.prototype.eachGPX = function(callback) {
  for ( i in this.data ) {
    gpx = this.data[i];
    callback(gpx, i);
  }
  return this;
};
GPXCasualViewer.prototype.getKeysOfGPX = function() {
  return Object.keys(this.data);
};
GPXCasualViewer.prototype.addGPX = function(key, gpx_text) {
  this.removeGPX(key);
  try {
    this.data[key] = this._build(gpx_text);
    this.applyHook('onAddGPX', key);
  } catch(e) {
    throw( new Error('Catch an exception at addGPX with '+ key +', reason: '+ e) );
  }
  return this;
};
GPXCasualViewer.prototype.removeGPX = function(key) {
  if ( this.data[key] ) {
    this.hideOverlayWpts(key);
    this.hideOverlayRtes(key);
    this.hideOverlayTrks(key);
  }
  this.data[key] = null;
  delete this.data[key];
  return this;
};
GPXCasualViewer.prototype._build = function(gpx_text) {
  var gpx = GPXCasualViewer.GPXToJSON( GPXCasualViewer.parseXML(gpx_text) );
  var i, j, k, l, m;

  // extend gpx.metadata
  gpx.metadata.latlngbounds = GPXCasualViewer.createLatlngbounds(gpx.metadata.bounds);
  this.applyHook('onCreateLatlngbounds', gpx.metadata.latlngbounds);

  // extend gpx.wpt(s)
  for ( i = 0, l = gpx.wpt.length; i < l; ++i ) {
    gpx.wpt[i].overlay = GPXCasualViewer.createOverlayAsWpt(gpx.wpt[i]);
    this.applyHook('onCreateMarker', gpx.wpt[i].overlay);
  }
  // extend gpx.rte(s)
  for ( i = 0, l = gpx.rte.length; i < l; ++i ) {
    gpx.rte[i].overlay = GPXCasualViewer.createOverlayAsRte(gpx.rte[i].rtept);
    this.applyHook('onCreatePolyline', gpx.rte[i].overlay);
    for ( j = 0, m = gpx.rte[i].rtept.length; j < m; ++j ){
      gpx.rte[i].rtept[j].overlay = GPXCasualViewer.createOverlayAsRte(gpx.rte[i].rtept[j]);
      this.applyHook('onCreateMarker', gpx.rte[i].rtept[j].overlay);
    }
  }
  // extend gpx.trk(s)
  if( GPXCasualViewer.join_trkseg ){
    for ( i = 0, l = gpx.trk.length; i < l; ++i ) {
      var pts = [];
      for ( j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ) {
        pts = pts.concat(gpx.trk[i].trkseg[j].trkpt);
      }
      gpx.trk[i].overlay = GPXCasualViewer.createOverlayAsTrk(pts);
      this.applyHook('onCreatePolyline', gpx.trk[i].overlay);
    }
  }else{
    for ( i = 0, l = gpx.trk.length; i < l; ++i ) {
      for ( j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ) {
        gpx.trk[i].trkseg[j].overlay = GPXCasualViewer.createOverlayAsTrk(gpx.trk[i].trkseg[j].trkpt);
        this.applyHook('onCreatePolyline', gpx.trk[i].trkseg[j].overlay);
      }
    }
  }

  return gpx;
};
GPXCasualViewer.prototype.use = function(plugin) {
  var hook      = GPXCasualViewer.plugin[plugin].hook;
  var callback  = GPXCasualViewer.plugin[plugin].callback;
  try {
    this._registerHook(hook, callback);
  } catch(ex) {
    console.log('Catch an exception on use('+ plugin + ') with hook "'+ hook +'"');
    throw(ex);
  }
  return this;
};
GPXCasualViewer.prototype.register = function(hook, callback) {
  try {
    this._registerHook(hook, callback);
  } catch(ex) {
    console.log('Catch an exception on register('+ hook +')');
    throw(ex);
  }
  return this;
};
GPXCasualViewer.prototype._registerHook = function(hook, callback) {
  if ( hook ) {
    this.hook[hook].push(callback.bind(this));
  } else {
    callback.bind(this)();
  }
};
GPXCasualViewer.prototype.applyHook = function() {
  var name = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);
  for ( var i = 0, l = this.hook[name].length; i < l; ++i ) {
    try {
      this.hook[name][i].apply(this, args);
    } catch(ex) {
      console.log('Catch an exception on applyHook "'+ name +'" with args ['+ args +']');
      throw(ex);
    }
  }
  return this;
};

// plugin mechanism
GPXCasualViewer.plugin = {};

// provide utility
GPXCasualViewer.plugin.detectPathOfPlugin = function(plugin_name) {
  if ( GPXCasualViewer.plugin[plugin_name].path ) {
    return false;
  }
  GPXCasualViewer.plugin[plugin_name].path = '';
  var scripts = document.getElementsByTagName('script'),
      re = new RegExp('/'+ plugin_name +'/loader\.js??.*'),
      i, l, src;
  for ( i = 0, l = scripts.length; i < l; ++i ) {
    src = scripts.item(i).getAttribute('src');
    if ( re.test(src) ) {
      GPXCasualViewer.plugin[plugin_name].path = src.replace(re, '/'+ plugin_name +'/');
      break;
    }
  }
  return true;
}

// define default plugins
GPXCasualViewer.plugin.SetTitleOnCreateMarker = {
  callback: function() {
    this.register('onCreateMarker', (function(marker) {
      marker.setTitle(marker.getSource().name);
    }).bind(this));
  }
};
GPXCasualViewer.plugin.SetStrokeOptionOnCreatePolyline = {
  callback: function() {
    this.register('onCreatePolyline', (function(polyline) {
      if ( polyline.isRte() ) {
        polyline.setOptions({
          strokeColor: '#00FF66',
          strokeOpacity: 0.75,
          strokeWeight: 2
        });
      } else if ( polyline.isTrk() ) {
        polyline.setOptions({
          strokeColor: '#0066FF',
          strokeOpacity: 0.5,
          strokeWeight: 4
        });
      }
    }).bind(this));
  }
};

GPXCasualViewer.load_script = function (src){
  return new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.onload = function (){
      resolve(src);
    };
    script.src = src;
    document.head.appendChild(script);
  });
}

GPXCasualViewer.prototype.require_plugin = function (plugin_name){
  var t = new Date().getTime(),
      src = [GPXCasualViewer.plugin_dir, plugin_name, GPXCasualViewer.scrip_loader +'?t='+ t].join('/');
  return GPXCasualViewer.load_script(src).then((function (src){
    GPXCasualViewer.plugin[plugin_name].path = [GPXCasualViewer.plugin_dir, plugin_name].join('/');
    this.use(plugin_name);
    return src;
  }).bind(this));
}

GPXCasualViewer.prototype.require_plugins = function (){
  var i, l;
  for ( i = 0, l = arguments.length; i < l; ++i ) {
    this.require_plugin(arguments[i]);
  }
}

GPXCasualViewer.load_css = function (src){
  return new Promise(function(resolve, reject) {
    var link = document.createElement('link');
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', src);
    link.onload = function (){
      resolve(src);
    };
    document.head.appendChild(link);
  });
}

GPXCasualViewer.prototype.require_css = function (plugin_name){
  var t = new Date().getTime(),
      src = [GPXCasualViewer.plugin_dir, plugin_name, GPXCasualViewer.style_loader +'?t='+ t].join('/');
  return GPXCasualViewer.load_css(src).then((function (src){
    return src;
  }).bind(this));
}

GPXCasualViewer.MapControl = function (){
  this.initialize.apply(this, arguments);
}
GPXCasualViewer.MapControl.prototype = {
  initialize: function (icons, options){
    this.icons    = icons; // {key1: src1, key2: src2, ...}
    this.options  = options || {};

    this.map          = this.options['map'] || null;
    this.current_key  = this.options['initial'] || Object.keys(this.icons)[0];
    this.$element     = this._createElement();
    if ( this.map ) {
      this.setMap(this.map);
    }
  },
  getCurrent: function() {
    return this.current_key;
  },
  getElement: function() {
    return this.$element;
  },
  _getIconByKey: function(key) {
    return this.icons[key];
  },
  _getCurrentIcon: function (){
    return this._getIconByKey(this.current_key);
  },
  _getIconElement: function (){
    return this.$element.getElementsByTagName('img').item(0);
  },
  _createElement: function (){
    var ic, div, vendor, anchor;

    ic = document.createElement('img');
    ic.setAttribute('src', this._getCurrentIcon());
    ic.setAttribute('width', this.options['width'] || 28);
    ic.setAttribute('height', this.options['height'] || 28);

    div = document.createElement('div');
    div.setAttribute('class', this.options['className'] || 'map_control_button');
    div.style.background = '#fff';
    div.style.margin = '16px';
    div.style.border = '1px solid transparent';
    div.style.borderRadius = '2px';
    div.style.outline = 'none';
    div.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    vendor = ['webkitB', 'mozB', 'oB', 'msB', 'b'];
    for ( var prefix in vendor ) {
      div.style[vendor[prefix] +'oxSizing'] = 'border-box';
    }

    // for effect instead of hover:cursor
    anchor = document.createElement('a');
    anchor.setAttribute('href', 'javascript:void(0)');
    anchor.style.display = 'block';

    div.appendChild(ic);
    anchor.appendChild(div);
    return anchor;
  },
  getMap: function() {
    return this.map;
  },
  setMap: function(map) {
    var pos = this.options['position'] || 'RIGHT_BOTTOM';
    this.map = map;
    this.getMap().controls[google.maps.ControlPosition[pos]].push(this.$element);
  },
  changeIcon: function(key) {
    this._getIconElement().src = this._getIconByKey(key);
    this.current_key = key;
    return this;
  }
};
