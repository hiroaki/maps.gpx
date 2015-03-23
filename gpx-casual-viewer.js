/*
 * GPX Casual Viewer v3
 *   Copyright 2009-2015 WATANABE Hiroaki
 *   Released under the MIT license
 */

function GPXCasualViewer(){
  this.initialize.apply(this, arguments);
}

GPXCasualViewer.strict = true;

GPXCasualViewer.parse_xml = function(str){
  if( typeof ActiveXObject != 'undefined' && typeof GetObject != 'undefined' ){
    var doc = new ActiveXObject('Microsoft.XMLDOM');
    doc.loadXML(str);
    return doc;
  }
  if( typeof DOMParser != 'undefined' ){
    return (new DOMParser()).parseFromString(str, 'text/xml');
  }
  throw( new Error("Cannot parse string as XML stream.") );
}

//-- convert gpx document to json
GPXCasualViewer.gpx_to_json = function( xml_document ){
  var linkType_to_json = function (/*dom node <link>*/node){
    var obj = {
      "href":node.getAttribute('href')
      };
    var nc = node.childNodes;
    for( var i = 0, l = nc.length; i < l; ++i ){
      if( nc[i].firstChild )
        obj[nc[i].tagName] = nc[i].firstChild.nodeValue;
    }
    return obj;
  };
  var wptType_to_json = function (/*dom node <wpt>*/node){
    var obj = {
      "lat":node.getAttribute('lat'),
      "lon":node.getAttribute('lon'),
      "link":[]
      };
    var nc = node.childNodes;
    for( var i = 0, l = nc.length; i < l; ++i ){
      var tag = nc[i].tagName;
      if( tag == 'link' ){
        obj["link"].push( linkType_to_json(nc[i]) );
      }else if( tag != 'extensions' ){
        if( nc[i].firstChild )
          obj[nc[i].tagName] = nc[i].firstChild.nodeValue;
      }
    }
    return obj;
  };
  var rteType_to_json = function (/*dom node <rte>*/node){
    var obj = {
      "rtept":[]
      };
    var nc = node.childNodes;
    for( var i = 0, l = nc.length; i < l; ++i ){
      var tag = nc[i].tagName;
      if( tag == 'rtept' ){
        obj["rtept"].push( wptType_to_json(nc[i]) );
      }else if( tag != 'extensions' ){
        if( nc[i].firstChild )
          obj[tag] = nc[i].firstChild.nodeValue;
      }
    }
    return obj;
  };
  var trksegType_to_json = function (/*dom node <trkseg>*/node){
    var obj = {
      "trkpt":[]
      };
    var nc = node.childNodes;
    for( var i = 0, l = nc.length; i < l; ++i ){
      var tag = nc[i].tagName;
      if( tag == 'trkpt' ){
        obj["trkpt"].push( wptType_to_json(nc[i]) );
      }else if( tag != 'extensions' ){
        if( nc[i].firstChild )
          obj[tag] = nc[i].firstChild.nodeValue;
      }
    }
    return obj;
  };
  var trkType_to_json = function (/*dom node <trk>*/node){
    var obj = {
      "trkseg":[]
      };
    var nc = node.childNodes;
    for( var i = 0, l = nc.length; i < l; ++i ){
      var tag = nc[i].tagName;
      if( tag == 'trkseg' ){
        obj["trkseg"].push( trksegType_to_json(nc[i]) );
      }else if( tag != 'extensions' ){
        if( nc[i].firstChild )
          obj[tag] = nc[i].firstChild.nodeValue;
      }
    }
    return obj;
  };
  var gpxType_to_json = function (/*dom node <gpx>*/node){
    var obj = {
      "metadata":{},
      "wpt":[],
      "rte":[],
      "trk":[]
      };
    if( GPXCasualViewer.strict ){
      obj["version"] = node.getAttribute('version');
      obj["creator"] = node.getAttribute('creator');
      if( obj.version != '1.1' ){
        throw(new Error("GPX document is formatted as unsupported version, it requires 1.1 only"));
      }
      if( ! obj.creator ){
        throw(new Error("Element 'gpx' does not have attribute 'creator' that is required."));
      }
    }
    var nc = node.childNodes;
    for( var i = 0, l = nc.length; i < l; ++i ){
      var tag = nc[i].tagName;
      if( tag == 'wpt' ){
        obj["wpt"].push( wptType_to_json(nc[i]) );
      }else if( tag == 'rte' ){
        obj["rte"].push( rteType_to_json(nc[i]) );
      }else if( tag == 'trk' ){
        obj["trk"].push( trkType_to_json(nc[i]) );
      }else if( tag != 'extensions' && tag != 'metadata' ){
        if( nc[i].firstChild )
          obj[tag] = nc[i].firstChild.nodeValue;
      }
    }
    return obj;
  };

  var gpx = gpxType_to_json( xml_document.getElementsByTagName('gpx')[0] );
  var bounds = {
    "minlat":  90.0,
    "maxlat": -90.0,
    "minlon": 180.0,
    "maxlon":-180.0
    };
  var bounding = function (bounds, wptType){
    if( wptType.lat < bounds.minlat ){
      bounds.minlat = wptType.lat;
    }
    if( bounds.maxlat < wptType.lat ){
      bounds.maxlat = wptType.lat;
    }
    if( wptType.lon < bounds.minlon ){
      bounds.minlon = wptType.lon;
    }
    if( bounds.maxlon < wptType.lon ){
      bounds.maxlon = wptType.lon;
    }
    return bounds;
  }
  for( var i = 0, l = gpx.wpt.length; i < l; ++i ){
    bounds = bounding(bounds, gpx.wpt[i]);
  }
  for( var i = 0, l = gpx.rte.length; i < l; ++i ){
    for( var j = 0, m = gpx.rte[i].rtept.length; j < m; ++j ){
      bounds = bounding(bounds, gpx.rte[i].rtept[j]);
    }
  }
  for( var i = 0, l = gpx.trk.length; i < l; ++i ){
    for( var j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ){
      for( var k = 0, n = gpx.trk[i].trkseg[j].trkpt.length; k < n; ++k ){
        bounds = bounding(bounds, gpx.trk[i].trkseg[j].trkpt[k]);
      }
    }
  }
  gpx.metadata["bounds"] = bounds;
  return gpx;
}

//-- constants
GPXCasualViewer.gpxType = 'gpxType';
GPXCasualViewer.wptType = 'wptType';
GPXCasualViewer.rteType = 'rteType';
GPXCasualViewer.trkType = 'trkType';

//-- extends g overlay objects
GPXCasualViewer.Marker = function (complex_type, src, opts){
  this.super = google.maps.Marker.prototype;
  this._complex_type = complex_type;
  this._source = src;
  this._overlayed = null;

  var wpt = src;
  var options = opts || {};
  options.position = new google.maps.LatLng(wpt.lat, wpt.lon);

  google.maps.Marker.apply(this, [options]);
}
  GPXCasualViewer.Marker.prototype = Object.create(google.maps.Marker.prototype, {
    constructor: { value: GPXCasualViewer.Marker },
    overlayed: function (){ return this._overlayed } // extend
  });
  GPXCasualViewer.Marker.prototype.is_wptType = function (){
    return this._complex_type == GPXCasualViewer.wptType ? true : false
  };
  GPXCasualViewer.Marker.prototype.is_rteType = function (){
    return this._complex_type == GPXCasualViewer.rteType ? true : false
  };
  GPXCasualViewer.Marker.prototype.is_trkType = function (){
    return this._complex_type == GPXCasualViewer.trkType ? true : false
  };
  GPXCasualViewer.Marker.prototype.getSource = function (){
    return this._source;
  };
  GPXCasualViewer.Marker.prototype.setMap = function (g_map){ // override
    this._overlayed = g_map ? true : false;
    this.super.setMap.call(this, g_map);
  }
GPXCasualViewer.Polyline = function (complex_type, src, opts){
  this.super = google.maps.Polyline.prototype;
  this._complex_type = complex_type;
  this._source = src;
  this._overlayed = null;

  var pts = src;
  var options = opts || {};
  options.path = new google.maps.MVCArray();
  var i = 0;
  for( var j = 0, m = pts.length; j < m; ++j ){
    options.path.insertAt(i++, new google.maps.LatLng(pts[j].lat, pts[j].lon));
  }

  google.maps.Polyline.apply(this, [options]);
}
  GPXCasualViewer.Polyline.prototype = Object.create(google.maps.Polyline.prototype, {
    constructor: { value: GPXCasualViewer.Polyline },
    overlayed: function (){ return this._overlayed } // extend
  });
  GPXCasualViewer.Polyline.prototype.is_wptType = function (){
    return this._complex_type == GPXCasualViewer.wptType ? true : false
  };
  GPXCasualViewer.Polyline.prototype.is_rteType = function (){
    return this._complex_type == GPXCasualViewer.rteType ? true : false
  };
  GPXCasualViewer.Polyline.prototype.is_trkType = function (){
    return this._complex_type == GPXCasualViewer.trkType ? true : false
  };
  GPXCasualViewer.Polyline.prototype.getSource = function (){
    return this._source;
  };
  GPXCasualViewer.Polyline.prototype.setMap = function (g_map){ // override
    this._overlayed = g_map ? true : false;
    this.super.setMap.call(this, g_map);
  }

//-- factory for extended g objects
GPXCasualViewer.create_latlngbounds = function(gpx, options){
  return new google.maps.LatLngBounds(
    new google.maps.LatLng(gpx.metadata.bounds.minlat, gpx.metadata.bounds.minlon),
    new google.maps.LatLng(gpx.metadata.bounds.maxlat, gpx.metadata.bounds.maxlon)
    );
}
GPXCasualViewer.create_overlay_as_wpt = function(src, options){
  return new GPXCasualViewer.Marker(GPXCasualViewer.wptType, src, options);
}
GPXCasualViewer.create_overlay_as_rte = function(src, options){
  return new GPXCasualViewer.Polyline(GPXCasualViewer.rteType, src, options);
}
GPXCasualViewer.create_overlay_as_trk = function(src, options){
  return new GPXCasualViewer.Polyline(GPXCasualViewer.trkType, src, options);
}

//-- GPXCasualViewer
GPXCasualViewer.prototype = {
  initialize: function (map_id, options){
    this.map_id = map_id;
    this.options = options || {};
    this.map_element = document.getElementById(this.map_id);
    if( ! this.map_element ){
      throw(new Error("Could not get element by #"+ map_id));
    }
    this.defaults = {
      "zoom":5,
      "center": new google.maps.LatLng(35.6841306,139.774103),
      "mapTypeId": google.maps.MapTypeId.ROADMAP
      };
    this.settings = {};
    for (var attr in this.defaults) { this.settings[attr] = this.defaults[attr]; }
    for (var attr in this.options) { this.settings[attr] = this.options[attr]; }
    this.map = new google.maps.Map(this.map_element, this.settings);
    this.data = {}
    this.hook = {
      on_create_latlngbounds: [],
      on_create_marker: [],
      on_create_polyline: [],
      on_add_gpx: []
    };
    // default plugins
    this.use("set_title_on_create_marker");
    this.use("set_stroke_option_on_create_polyline");
  },
  fit_bounds: function (){
    var keys = [];
    if( 0 < arguments.length ){
      keys = Array.prototype.slice.call(arguments)
    }else{
      for(var key in this.data){ keys.push(key) }
    }
    if( 0 < keys.length ){
      var bnd = this.data[keys[0]].metadata.latlngbounds;
      for(var i=1,l=keys.length; i<l; ++i){
        bnd.union( this.data[keys[i]].metadata.latlngbounds );
      }
      this.map.fitBounds(bnd);
    }
  },
  _overlay_wpts: function (key, show){
    var gpx = this.data[key];
    for( var i = 0, l = gpx.wpt.length; i < l; ++i ){
      gpx.wpt[i].marker.setMap( show ? this.map : null );
    }
  },
  _overlay_rtes: function (key, show){
    var gpx = this.data[key];
    for( var i = 0, l = gpx.rte.length; i < l; ++i ){
      gpx.rte[i].polyline.setMap( show ? this.map : null );
    }
  },
  _overlay_trks: function (key, show){
    var gpx = this.data[key];
    for( var i = 0, l = gpx.trk.length; i < l; ++i ){
      gpx.trk[i].polyline.setMap( show ? this.map : null );
    }
  },
  show_overlay_wpts: function (key){ this._overlay_wpts(key, true ); },
  hide_overlay_wpts: function (key){ this._overlay_wpts(key, false); },
  show_overlay_rtes: function (key){ this._overlay_rtes(key, true ); },
  hide_overlay_rtes: function (key){ this._overlay_rtes(key, false); },
  show_overlay_trks: function (key){ this._overlay_trks(key, true ); },
  hide_overlay_trks: function (key){ this._overlay_trks(key, false); },
  add_gpx: function (key, gpx_text){
    this.remove_gpx(key);
    try{
      this.data[key] = this._build(gpx_text);
      this.apply_hook('on_add_gpx', key);
    }catch(e){
      throw( new Error("Catch an exception at add_gpx with "+ key +"\nreason: "+ e) );
    }
  },
  remove_gpx: function (key){
      if( this.data[key] ){
        this.hide_overlay_wpts(key);
        this.hide_overlay_rtes(key);
        this.hide_overlay_trks(key);
      }
      this.data[key] = null;
  },
  _build: function (gpx_text){
    var gpx = GPXCasualViewer.gpx_to_json( GPXCasualViewer.parse_xml(gpx_text) );

    // extend gpx.metadata
    gpx.metadata.latlngbounds = GPXCasualViewer.create_latlngbounds(gpx);
    this.apply_hook('on_create_latlngbounds', gpx.metadata.latlngbounds);

    // extend gpx.wpt(s)
    for( var i = 0, l = gpx.wpt.length; i < l; ++i ){
      gpx.wpt[i].marker = GPXCasualViewer.create_overlay_as_wpt(gpx.wpt[i]);
      this.apply_hook('on_create_marker', gpx.wpt[i].marker);
    }
    // extend gpx.rte(s)
    for( var i = 0, l = gpx.rte.length; i < l; ++i ){
      gpx.rte[i].polyline = GPXCasualViewer.create_overlay_as_rte(gpx.rte[i].rtept);
      this.apply_hook('on_create_polyline', gpx.rte[i].polyline);
    }
    // extend gpx.trk(s)
    for( var i = 0, l = gpx.trk.length; i < l; ++i ){
      var pts = [];
      for( var j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ){
        pts = pts.concat(gpx.trk[i].trkseg[j].trkpt);
      }
      gpx.trk[i].polyline = GPXCasualViewer.create_overlay_as_trk(pts);
      this.apply_hook('on_create_polyline', gpx.trk[i].polyline);
    }
    return gpx;
  },
  use: function (plugin){
    var hook      = GPXCasualViewer.plugin[plugin].hook;
    var callback  = GPXCasualViewer.plugin[plugin].callback;
    this._register_hook(hook, callback);
  },
  register: function (hook, callback){
    this._register_hook(hook, callback);
  },
  _register_hook: function (hook, callback){
    if( hook ){
      try {
        this.hook[hook].push(callback.bind(this));
      }catch(ex){
        console.log("catch an exception on use("+ plugin + ") with hook '"+ hook +"'");
        throw ex;
      }
    }else{
      callback.bind(this)();
    }
  },
  apply_hook: function (){
    var name = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    for( var i=0,l=this.hook[name].length; i<l; ++i ){
      try {
        this.hook[name][i].apply(this, args);
      }catch(ex){
        console.log("catch an exception on apply_hook with '"+ name +"'");
        throw ex;
      }
    }
  }
}

GPXCasualViewer.plugin = {}

GPXCasualViewer.plugin.set_title_on_create_marker = {
  callback: function (marker){
    marker.setTitle(marker.getSource().name);
  },
  hook: 'on_create_marker'
}

GPXCasualViewer.plugin.set_stroke_option_on_create_polyline = {
  callback: function (polyline){
    if( polyline.is_rteType() ){
      polyline.setOptions({
        "strokeColor": '#00FF66',
        "strokeOpacity": 0.5,
        "strokeWeight": 4
      });
    }else if( polyline.is_trkType() ){
      polyline.setOptions({
        "strokeColor": '#0066FF',
        "strokeOpacity": 0.5,
        "strokeWeight": 4
      });
    }
  },
  hook: 'on_create_polyline'
}
