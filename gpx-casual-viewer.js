function GPXCasualViewer(){
  this.initialize.apply(this, arguments);
}
GPXCasualViewer.strict = true;
GPXCasualViewer.parse_query_string = function(/* usually 'location.search' */qstring, separator){
  if( ! separator ){
    separator = '&';
  }
  var params = {};
  if( qstring ){
    var str = qstring.match(/^\?/) ? qstring.substring(1) : qstring
    var pairs = str.split(separator);
    for(var i=0, l=pairs.length; i<l; ++i){
      var pair = pairs[i].split('=');
      if( pair[0] ){
        params[pair[0]] = decodeURIComponent( pair[1] );
      }
    }
  }
  return params;
}
GPXCasualViewer.createXmlHttpRequest = function(){
  try{
    if( typeof ActiveXObject != 'undefined' ){
      return new ActiveXObject('Microsoft.XMLHTTP');
    }else if( window["XMLHttpRequest"] ){
      return new XMLHttpRequest();
    }
  }catch(e){
    throw( new Error("Cannot create XmlHttpRequest object.") );
  }
  return null;
}
GPXCasualViewer.parseXml = function(str){
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
//-- convert gpx to Object
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
  var latlngbounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(gpx.metadata.bounds.minlat, gpx.metadata.bounds.minlon),
    new google.maps.LatLng(gpx.metadata.bounds.maxlat, gpx.metadata.bounds.maxlon)
    );
  GPXCasualViewer.call_hook('on_create_latlngbounds', latlngbounds);
  return latlngbounds;
}
GPXCasualViewer.create_overlay_as_wpt = function(src, options){
  var overlay = new GPXCasualViewer.Marker(GPXCasualViewer.wptType, src, options);
  GPXCasualViewer.call_hook('on_create_marker', overlay);
  return overlay;
}
GPXCasualViewer.create_overlay_as_rte = function(src, options){
  var overlay = new GPXCasualViewer.Polyline(GPXCasualViewer.rteType, src, options);
  GPXCasualViewer.call_hook('on_create_polyline', overlay);
  return overlay;
}
GPXCasualViewer.create_overlay_as_trk = function(src, options){
  var overlay = new GPXCasualViewer.Polyline(GPXCasualViewer.trkType, src, options);
  GPXCasualViewer.call_hook('on_create_polyline', overlay);
  return overlay;
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
  },
  fit_bounds: function (url){
    var gpx = this.data[url];
    this.map.fitBounds( gpx.metadata.latlngbounds );
  },
  _overlay_wpts: function (url, show){
    var gpx = this.data[url];
    for( var i = 0, l = gpx.wpt.length; i < l; ++i ){
      gpx.wpt[i].marker.setMap( show ? this.map : null );
    }
  },
  _overlay_rtes: function (url, show){
    var gpx = this.data[url];
    for( var i = 0, l = gpx.rte.length; i < l; ++i ){
      gpx.rte[i].polyline.setMap( show ? this.map : null );
    }
  },
  _overlay_trks: function (url, show){
    var gpx = this.data[url];
    for( var i = 0, l = gpx.trk.length; i < l; ++i ){
      gpx.trk[i].polyline.setMap( show ? this.map : null );
    }
  },
  show_overlay_wpts: function (url){ this._overlay_wpts(url, true ); },
  hide_overlay_wpts: function (url){ this._overlay_wpts(url, false); },
  show_overlay_rtes: function (url){ this._overlay_rtes(url, true ); },
  hide_overlay_rtes: function (url){ this._overlay_rtes(url, false); },
  show_overlay_trks: function (url){ this._overlay_trks(url, true ); },
  hide_overlay_trks: function (url){ this._overlay_trks(url, false); },
  import_gpx: function (source){
    this.import_gpx_by_url(source);
  },
  import_gpx_by_url: function (url){
    // create gpx
    var gpx;
    var xhr = GPXCasualViewer.createXmlHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    try{
      gpx = GPXCasualViewer.gpx_to_json( GPXCasualViewer.parseXml(xhr.responseText) );
    }catch(e){
      throw( new Error("Catch an exception at import_gpx with "+ url +"\nreason: "+ e) );
    }

    // register gpx to cache
    this.data[url] = this._build_google_maps_objects(gpx);
  },
  _build_google_maps_objects: function (gpx){
    // extend gpx.metadata
    gpx.metadata.latlngbounds = GPXCasualViewer.create_latlngbounds(gpx);

    // extend gpx.wpt(s)
    for( var i = 0, l = gpx.wpt.length; i < l; ++i ){
      gpx.wpt[i].marker = GPXCasualViewer.create_overlay_as_wpt(gpx.wpt[i]);
    }
    // extend gpx.rte(s)
    for( var i = 0, l = gpx.rte.length; i < l; ++i ){
      gpx.rte[i].polyline = GPXCasualViewer.create_overlay_as_rte(gpx.rte[i].rtept);
    }
    // extend gpx.trk(s)
    for( var i = 0, l = gpx.trk.length; i < l; ++i ){
      var pts = [];
      for( var j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ){
        pts = pts.concat(gpx.trk[i].trkseg[j].trkpt);
      }
      gpx.trk[i].polyline = GPXCasualViewer.create_overlay_as_trk(pts);
    }
    return gpx;
  }
}

//-- define hook points and interface
GPXCasualViewer.hook = {
  on_create_latlngbounds: [],
  on_create_marker: [],
  on_create_polyline: []
};
GPXCasualViewer.register = function (name, callback){
  try {
    GPXCasualViewer.hook[name].push(callback);
  }catch(ex){
    console.log("catch an exception on register with '"+ name +"'");
    throw ex;
  }
}
GPXCasualViewer.call_hook = function (){
  var name = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);
  for( var i=0,l=GPXCasualViewer.hook[name].length; i<l; ++i ){
    try {
      GPXCasualViewer.hook[name][i].apply(this, args);
    }catch(ex){
      console.log("catch an exception on call_hook with '"+ name +"'");
      throw ex;
    }
  }
}

//-- register default hooks

// GPXCasualViewer.register('on_create_latlngbounds', function (latlngbounds){
//   console.log("created a latlngbounds");
// });

GPXCasualViewer.register('on_create_marker', function (marker){
  marker.setTitle(marker.getSource().name);
});

GPXCasualViewer.register('on_create_polyline', function (polyline){
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
});
