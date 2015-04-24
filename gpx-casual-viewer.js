/*
 * GPX Casual Viewer v3
 *   Copyright 2009-2015 WATANABE Hiroaki
 *   Released under the MIT license
 */

function GPXCasualViewer() {
  this.initialize.apply(this, arguments);
}

// constants, do not change these value
GPXCasualViewer.VERSION   = '2.2.0';
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
GPXCasualViewer.strict      = true;
GPXCasualViewer.join_trkseg = true;

// common util
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
GPXCasualViewer.preloadAsBlob = function(src) {
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
GPXCasualViewer.createPromiseReadingBlobAsArrayBuffer = function(src) {
  return GPXCasualViewer.preloadAsBlob(src).then(function(blob) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(event) {
        resolve(event.target.result);
      };
      reader.readAsArrayBuffer(blob);
    });
  });
}
GPXCasualViewer.createPromiseReadingBlobAsObjectURL = function(src) {
  return GPXCasualViewer.preloadAsBlob(src).then(function(blob) {
    return new Promise(function(resolve, reject) {
      resolve(URL.createObjectURL(blob));
    });
  });
}
GPXCasualViewer.createPromiseReadingBlobAsDataURL = function(src) {
  return GPXCasualViewer.preloadAsBlob(src).then(function(blob) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(event) {
        resolve(event.target.result);
      };
      reader.readAsDataURL(blob);
    });
  });
}
GPXCasualViewer.createPromiseReadingBlobAsText = function(src, encoding) {
  return GPXCasualViewer.preloadAsBlob(src).then(function(blob) {
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
  return new google.maps.LatLngBounds(
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

// constructor of class GPXCasualViewer
GPXCasualViewer.prototype.initialize = function (map_id, options) {
  this.map_id       = map_id;
  this.options      = options || {};
  this.map_element  = document.getElementById(this.map_id);
  if ( ! this.map_element ) {
    throw( new Error('Could not get element by #'+ map_id) );
  }

  this.settings = {};
  this.defaults = {
    zoom: 5,
    keyboardShortcuts: false,
    center: new google.maps.LatLng(35.6841306, 139.774103),
    mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  for (var attr in this.defaults) { this.settings[attr] = this.defaults[attr] }
  for (var attr in this.options ) { this.settings[attr] = this.options[attr]  }

  this.map  = new google.maps.Map(this.map_element, this.settings);
  this.data = {}
  this.hook = {
    onCreateLatlngbounds: [],
    onCreateMarker: [],
    onCreatePolyline: [],
    onAddGPX: []
  };

  // apply default plugins
  this.use('SetTitleOnCreateMarker');
  this.use('SetStrokeOptionOnCreatePolyline');
};
GPXCasualViewer.prototype.fitBounds = function() {
  var keys = [];
  if ( 0 < arguments.length ) {
    keys = Array.prototype.slice.call(arguments);
  } else {
    for (var key in this.data){ keys.push(key) }
  }
  if ( 0 < keys.length ) {
    var bnd = this.data[keys[0]].metadata.latlngbounds;
    for ( var i = 1, l = keys.length; i < l; ++i ) {
      bnd.union( this.data[keys[i]].metadata.latlngbounds );
    }
    this.map.fitBounds(bnd);
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
GPXCasualViewer.prototype.promiseToAddGPX = function(key, src) {
  return GPXCasualViewer.createPromiseReadingBlobAsText(src)
  .then((function (gpx_text){
    this.addGPX(key, gpx_text);
    return key;
  }).bind(this))
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
    throw ex;
  }
  return this;
};
GPXCasualViewer.prototype.register = function(hook, callback) {
  try {
    this._registerHook(hook, callback);
  } catch(ex) {
    console.log('Catch an exception on register('+ hook +')');
    throw ex;
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
      throw ex;
    }
  }
  return this;
};

// plugin mechanism
GPXCasualViewer.plugin = {};

// define default plugins
GPXCasualViewer.plugin.SetTitleOnCreateMarker = {
  callback: function(marker) {
    this.register('onCreateMarker', (function(marker) {
      marker.setTitle(marker.getSource().name);
    }).bind(this));
  }
};
GPXCasualViewer.plugin.SetStrokeOptionOnCreatePolyline = {
  callback: function(polyline) {
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
