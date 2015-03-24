/*
 * GPX Casual Viewer v3
 *   Copyright 2009-2015 WATANABE Hiroaki
 *   Released under the MIT license
 */

function GPXCasualViewer() {
  this.initialize.apply(this, arguments);
}

// constants, do not change these value
GPXCasualViewer.VERSION   = '2.0.0';
GPXCasualViewer.GPX_TYPE  = 'gpxType';
GPXCasualViewer.WPT_TYPE  = 'wptType';
GPXCasualViewer.RTE_TYPE  = 'rteType';
GPXCasualViewer.TRK_TYPE  = 'trkType';

// global properties, this value can be changed
GPXCasualViewer.strict = true;

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

// convert gpx document to json
GPXCasualViewer.GPXToJSON = function( xml_document ) {
  var linkTypeToJson = function(/*dom node <link>*/node) {
    var obj = {
      href: node.getAttribute('href')
      };
    var nc = node.childNodes;
    for( var i = 0, l = nc.length; i < l; ++i ){
      if( nc[i].firstChild ){
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
      if ( tag == 'link' ) {
        obj['link'].push( linkTypeToJson(nc[i]) );
      } else if ( tag != 'extensions' ) {
        if( nc[i].firstChild ){
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
      if ( tag == 'rtept' ) {
        obj['rtept'].push( wptTypeToJson(nc[i]) );
      } else if ( tag != 'extensions' ) {
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
      if ( tag == 'trkpt' ) {
        obj['trkpt'].push( wptTypeToJson(nc[i]) );
      } else if ( tag != 'extensions' ) {
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
      if ( tag == 'trkseg' ) {
        obj['trkseg'].push( trksegTypeToJson(nc[i]) );
      } else if ( tag != 'extensions' ) {
        if ( nc[i].firstChild ){
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
        throw( new Error('GPX document is formatted as unsupported version, it requires 1.1 only') );
      }
      if ( ! obj.creator ) {
        throw( new Error('Element "gpx" does not have attribute "creator" that is required.') );
      }
    }
    var nc = node.childNodes;
    for ( var i = 0, l = nc.length; i < l; ++i ) {
      var tag = nc[i].tagName;
      if ( tag == 'wpt' ) {
        obj['wpt'].push( wptTypeToJson(nc[i]) );
      } else if( tag == 'rte' ) {
        obj['rte'].push( rteTypeToJson(nc[i]) );
      } else if( tag == 'trk' ) {
        obj['trk'].push( trkTypeToJson(nc[i]) );
      } else if( tag != 'extensions' && tag != 'metadata' ) {
        if ( nc[i].firstChild ){
          obj[tag] = nc[i].firstChild.nodeValue;
        }
      }
    }
    return obj;
  };

  var gpx = gpxTypeToJson( xml_document.getElementsByTagName('gpx')[0] );
  var bounds = {
    minlat:  90.0,
    maxlat: -90.0,
    minlon: 180.0,
    maxlon:-180.0
    };
  var bounding = function(bounds, wptType) {
    if ( wptType.lat < bounds.minlat ) {
      bounds.minlat = wptType.lat;
    }
    if ( bounds.maxlat < wptType.lat ) {
      bounds.maxlat = wptType.lat;
    }
    if ( wptType.lon < bounds.minlon ) {
      bounds.minlon = wptType.lon;
    }
    if ( bounds.maxlon < wptType.lon ) {
      bounds.maxlon = wptType.lon;
    }
    return bounds;
  }
  var i, j, k;
  for (i = 0, l = gpx.wpt.length; i < l; ++i ) {
    bounds = bounding(bounds, gpx.wpt[i]);
  }
  for (i = 0, l = gpx.rte.length; i < l; ++i ) {
    for (j = 0, m = gpx.rte[i].rtept.length; j < m; ++j ) {
      bounds = bounding(bounds, gpx.rte[i].rtept[j]);
    }
  }
  for (i = 0, l = gpx.trk.length; i < l; ++i ) {
    for (j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ) {
      for (k = 0, n = gpx.trk[i].trkseg[j].trkpt.length; k < n; ++k ) {
        bounds = bounding(bounds, gpx.trk[i].trkseg[j].trkpt[k]);
      }
    }
  }
  gpx.metadata['bounds'] = bounds;
  return gpx;
}

// extend google.maps.Marker
GPXCasualViewer.Marker = function (complex_type, src, opts) {
  this.super          = google.maps.Marker.prototype;
  this._complex_type  = complex_type;
  this._source        = src;
  this._overlayed     = null;

  var wpt = src;
  var options = opts || {};
  options.position = new google.maps.LatLng(wpt.lat, wpt.lon);

  google.maps.Marker.apply(this, [options]);
}
  GPXCasualViewer.Marker.prototype = Object.create(google.maps.Marker.prototype, {
    constructor: { value: GPXCasualViewer.Marker },
    overlayed: function () { return this._overlayed } // extend
  });
  GPXCasualViewer.Marker.prototype.isWptType = function () {
    return this._complex_type == GPXCasualViewer.WPT_TYPE ? true : false
  };
  GPXCasualViewer.Marker.prototype.isRteType = function () {
    return this._complex_type == GPXCasualViewer.RTE_TYPE ? true : false
  };
  GPXCasualViewer.Marker.prototype.isTrkType = function () {
    return this._complex_type == GPXCasualViewer.TRK_TYPE ? true : false
  };
  GPXCasualViewer.Marker.prototype.getSource = function () {
    return this._source;
  };
  GPXCasualViewer.Marker.prototype.setMap = function (g_map) { // override
    this._overlayed = g_map ? true : false;
    this.super.setMap.call(this, g_map);
  }
// extend google.maps.Polyline
GPXCasualViewer.Polyline = function (complex_type, src, opts) {
  this.super          = google.maps.Polyline.prototype;
  this._complex_type  = complex_type;
  this._source        = src;
  this._overlayed     = null;

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
  GPXCasualViewer.Polyline.prototype.isWptType = function () {
    return this._complex_type == GPXCasualViewer.WPT_TYPE ? true : false
  };
  GPXCasualViewer.Polyline.prototype.isRteType = function () {
    return this._complex_type == GPXCasualViewer.RTE_TYPE ? true : false
  };
  GPXCasualViewer.Polyline.prototype.isTrkType = function () {
    return this._complex_type == GPXCasualViewer.TRK_TYPE ? true : false
  };
  GPXCasualViewer.Polyline.prototype.getSource = function () {
    return this._source;
  };
  GPXCasualViewer.Polyline.prototype.setMap = function (g_map) { // override
    this._overlayed = g_map ? true : false;
    this.super.setMap.call(this, g_map);
  }

// factories to create extended maps overlay objects
GPXCasualViewer.createLatlngbounds = function (gpx, options) {
  return new google.maps.LatLngBounds(
    new google.maps.LatLng(gpx.metadata.bounds.minlat, gpx.metadata.bounds.minlon),
    new google.maps.LatLng(gpx.metadata.bounds.maxlat, gpx.metadata.bounds.maxlon)
    );
}
GPXCasualViewer.createOverlayAsWpt = function (src, options) {
  return new GPXCasualViewer.Marker(GPXCasualViewer.WPT_TYPE, src, options);
}
GPXCasualViewer.createOverlayAsRte = function (src, options) {
  return new GPXCasualViewer.Polyline(GPXCasualViewer.RTE_TYPE, src, options);
}
GPXCasualViewer.createOverlayAsTrk = function (src, options) {
  return new GPXCasualViewer.Polyline(GPXCasualViewer.TRK_TYPE, src, options);
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
    center: new google.maps.LatLng(35.6841306, 139.774103),
    mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  for (var attr in this.defaults) { this.settings[attr] = this.defaults[attr] }
  for (var attr in this.options) {  this.settings[attr] = this.options[attr]  }

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
    for (var i = 1, l = keys.length; i < l; ++i) {
      bnd.union( this.data[keys[i]].metadata.latlngbounds );
    }
    this.map.fitBounds(bnd);
  }
  return this;
};
GPXCasualViewer.prototype._appearOverlay = function() {
  var is_show = arguments[0] ? this.map : null;
  var complex = arguments[1];
  var keys = Array.prototype.slice.call(arguments, 2);
  for ( var i = 0, l = keys.length; i < l; ++i ) {
    var gpx = this.data[keys[i]];
    for ( var j = 0, m = gpx[complex].length; j < m; ++j ) {
      if ( gpx[complex][j].marker ){
        gpx[complex][j].marker.setMap( is_show );
      }
      if ( gpx[complex][j].polyline ){
        gpx[complex][j].polyline.setMap( is_show );
      }
    }
  }
  return this;
};
GPXCasualViewer.prototype.showOverlayWpts = function() {
  return this._appearOverlay( true, 'wpt', Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.hideOverlayWpts = function() {
  return this._appearOverlay(false, 'wpt', Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.showOverlayRtes = function() {
  return this._appearOverlay( true, 'rte', Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.hideOverlayRtes = function() {
  return this._appearOverlay(false, 'rte', Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.showOverlayTrks = function() {
  return this._appearOverlay( true, 'trk', Array.prototype.slice.call(arguments));
};
GPXCasualViewer.prototype.hideOverlayTrks = function() {
  return this._appearOverlay(false, 'trk', Array.prototype.slice.call(arguments));
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
  return this;
};
GPXCasualViewer.prototype._build = function(gpx_text) {
  var gpx = GPXCasualViewer.GPXToJSON( GPXCasualViewer.parseXML(gpx_text) );

  // extend gpx.metadata
  gpx.metadata.latlngbounds = GPXCasualViewer.createLatlngbounds(gpx);
  this.applyHook('onCreateLatlngbounds', gpx.metadata.latlngbounds);

  // extend gpx.wpt(s)
  for ( var i = 0, l = gpx.wpt.length; i < l; ++i ) {
    gpx.wpt[i].marker = GPXCasualViewer.createOverlayAsWpt(gpx.wpt[i]);
    gpx.wpt[i].polyline = null;
    this.applyHook('onCreateMarker', gpx.wpt[i].marker);
  }
  // extend gpx.rte(s)
  for ( var i = 0, l = gpx.rte.length; i < l; ++i ) {
    gpx.rte[i].marker = null;
    gpx.rte[i].polyline = GPXCasualViewer.createOverlayAsRte(gpx.rte[i].rtept);
    this.applyHook('onCreatePolyline', gpx.rte[i].polyline);
  }
  // extend gpx.trk(s)
  for ( var i = 0, l = gpx.trk.length; i < l; ++i ) {
    var pts = [];
    for ( var j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ) {
      pts = pts.concat(gpx.trk[i].trkseg[j].trkpt);
    }
    gpx.trk[i].marker = null;
    gpx.trk[i].polyline = GPXCasualViewer.createOverlayAsTrk(pts);
    this.applyHook('onCreatePolyline', gpx.trk[i].polyline);
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
    marker.setTitle(marker.getSource().name);
  },
  hook: 'onCreateMarker'
};
GPXCasualViewer.plugin.SetStrokeOptionOnCreatePolyline = {
  callback: function(polyline) {
    if ( polyline.isRteType() ) {
      polyline.setOptions({
        strokeColor: '#00FF66',
        strokeOpacity: 0.5,
        strokeWeight: 4
      });
    } else if( polyline.isTrkType() ) {
      polyline.setOptions({
        strokeColor: '#0066FF',
        strokeOpacity: 0.5,
        strokeWeight: 4
      });
    }
  },
  hook: 'onCreatePolyline'
};
