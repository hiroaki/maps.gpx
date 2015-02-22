function GPXCasualViewer(){
  this.initialize.apply(this, arguments);
}
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
      "version":node.getAttribute('version'),
      "creator":node.getAttribute('creator'),
      "metadata":{},
      "wpt":[],
      "rte":[],
      "trk":[]
      };
    if( obj.version != '1.1' ){
      throw( new Error("Cannot include unsupported version of GPX document.") );
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

//-- extends g overlay objects
GPXCasualViewer.Marker = function (){
  this.super = google.maps.Marker.prototype;
  this._overlayed = null;
  google.maps.Marker.apply(this, arguments);
}
  GPXCasualViewer.Marker.prototype = Object.create(google.maps.Marker.prototype, {
    constructor: { value: GPXCasualViewer.Marker },
    overlayed: function (){ this._overlayed } // extend
  });
  GPXCasualViewer.Marker.prototype.setMap = function (g_map){ // override
    this._overlayed = g_map ? true : false;
    this.super.setMap.call(this, g_map);
  }
GPXCasualViewer.Polyline = function (){
  this.super = google.maps.Polyline.prototype;
  this._overlayed = null;
  google.maps.Polyline.apply(this, arguments);
}
  GPXCasualViewer.Polyline.prototype = Object.create(google.maps.Polyline.prototype, {
    constructor: { value: GPXCasualViewer.Polyline },
    overlayed: function (){ this._overlayed } // extend
  });
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
GPXCasualViewer.create_marker = function(wpt, options){
  var options = options || {};
  options.position = new google.maps.LatLng(wpt.lat, wpt.lon);
  return new GPXCasualViewer.Marker(options);
}
GPXCasualViewer.create_polyline = function(pts, options){
  var options = options || {};
  options.path = new google.maps.MVCArray();
  var i = 0;
  for( var j = 0, m = pts.length; j < m; ++j ){
    options.path.insertAt(i++, new google.maps.LatLng(pts[j].lat, pts[j].lon));
  }
  return new GPXCasualViewer.Polyline(options);
}
//-- geo utils
GPXCasualViewer.latlng_distant_from_origin = function(/*GLatLng*/origin, /*pixel*/delta_x, /*pixel*/delta_y, current_zoom){
  // Original code by Masaru Kitajima: http://blog.section-9.jp/?p=260
  var lat   = origin.lat();
  var lng   = origin.lng();
  var offset  = 268435456; // [pixel] Circumference of the equator when the zoom level 21.
  var pi    = Math.PI;
  var radius  = offset / pi;
  var z     = 21 - current_zoom;

  var d_lat   = ((Math.round(Math.round(offset + radius * lng * pi / 180) + (delta_x << z)) - offset) / radius) * 180 / pi;

  var sin   = Math.sin(lat * pi / 180);
  var log   = Math.log((1 + sin) / (1 - sin));
  var exp   = Math.exp((Math.round(Math.round(offset - radius * log / 2) + (delta_y << z)) -  offset) / radius);
  var d_lng   = (pi / 2 - 2 * Math.atan(exp)) * 180 / pi;

  return new google.maps.LatLng(d_lng, d_lat);
}
GPXCasualViewer.index_of_vertex_nearest_click = function(/*MVCArray*/path, /*GLatLng*/glatlng, zoom){
  var EarthRound = 6378137;
  var min = EarthRound;
  var minindex = -1;

  // scan all segments
  var min_heading;
  for( var i = 0; i < path.getLength() -1; ++i ){
    var b = new google.maps.LatLngBounds();
    b.extend(path.getAt(i));
    b.extend(path.getAt(i+1));
    // append margin
    b.extend( GPXCasualViewer.latlng_distant_from_origin(b.getNorthEast(),  5, -5, zoom) );
    b.extend( GPXCasualViewer.latlng_distant_from_origin(b.getSouthWest(), -5,  5, zoom) );
    if( b.contains(glatlng) ){
      // point of click is in a rectangle
      var p0 = path.getAt(i);
      var p1 = glatlng;
      var p2 = path.getAt(i+1);
      var p10x = p1.lng() - p0.lng();
      var p10y = p1.lat() - p0.lat();
      var p20x = p2.lng() - p0.lng();
      var p20y = p2.lat() - p0.lat();
      // the absolute value of an angle
      var m = Math.abs( Math.atan2(p10y,p10x)
              - Math.atan2(p20y,p20x) );
      if( m < min ){
        min = m;
        minindex = i;
        min_heading = google.maps.geometry.spherical.computeHeading(path.getAt(i), path.getAt(i+1));
      }
    }
  }

  if( 0 <= minindex ){
    var p0 = google.maps.geometry.spherical.computeDistanceBetween( glatlng, path.getAt(minindex) );
    var p1 = google.maps.geometry.spherical.computeDistanceBetween( glatlng, path.getAt(minindex +1) );
    minindex = p0 < p1 ? minindex : minindex + 1;
  }

  return minindex;
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
    gpx.trk.polyline.setMap( show ? this.map : null );
  },
  show_overlay_wpts: function (url){ this._overlay_wpts(url, true ); },
  hide_overlay_wpts: function (url){ this._overlay_wpts(url, false); },
  show_overlay_rtes: function (url){ this._overlay_rtes(url, true ); },
  hide_overlay_rtes: function (url){ this._overlay_rtes(url, false); },
  show_overlay_trks: function (url){ this._overlay_trks(url, true ); },
  hide_overlay_trks: function (url){ this._overlay_trks(url, false); },
  import_gpx: function (url){
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
    
    // extend gpx.metadata
    gpx.metadata.latlngbounds = GPXCasualViewer.create_latlngbounds(gpx);

    // extend gpx.wpt(s)
    for( var i = 0, l = gpx.wpt.length; i < l; ++i ){
      gpx.wpt[i].marker = GPXCasualViewer.create_marker(gpx.wpt[i], {
        "title": gpx.wpt[i].name
        });
    }

    // extend gpx.rte(s)
    for( var i = 0, l = gpx.rte.length; i < l; ++i ){
      gpx.rte[i].polyline = GPXCasualViewer.create_polyline(gpx.rte[i].rtept, {
        "strokeColor": '#00FF99',
        "strokeOpacity": 0.5,
        "strokeWeight": 4
        });
    }

    // extend gpx.trk(s)
    var pts = [];
    for( var i = 0, l = gpx.trk.length; i < l; ++i ){
      for( var j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ){
        pts = pts.concat(gpx.trk[i].trkseg[j].trkpt);
      }
    }
    gpx.trk.polyline = GPXCasualViewer.create_polyline(pts, {
      "strokeColor": '#0099FF',
      "strokeOpacity": 0.5,
      "strokeWeight": 4
      });
    var self = this;
    gpx.trk.polyline.addListener('click',function (mouseevent){
      var path = this.getPath();
      var vertex = GPXCasualViewer.index_of_vertex_nearest_click(path, mouseevent.latLng, self.map.getZoom());
      if( 0 <= vertex ){
        var wpt = pts[vertex];
        var info = "#"+ vertex +"<br>lat="+ wpt.lat +"<br>lon="+ wpt.lon;
        if( wpt.time ){
          info = info + "<br>time="+ wpt.time;
        }
        var infowindow = new google.maps.InfoWindow({
          content: info,
          position: path.getAt(vertex)
          });
        infowindow.open(self.map);
      }      
    });

    // 
    this.data[url] = gpx;
  }
  
}
