function query_string(){
    var params = {};
    if( location.search ){
        var pairs = location.search.substring(1).split('&');
        for(var i=0, l=pairs.length; i<l; ++i){
            var pair = pairs[i].split('=');
            if( pair[0] ){
                params[pair[0]] = decodeURIComponent( pair[1] );
            }
        }
    }
    return params;
}

//-- utils
function createXmlHttpRequest(){
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

function parseXml(str){
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

//-- convert gpx to object
function gpx_to_json( xml_document ){
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

//-- overlay factory
function create_g_marker(wptType, options){
    var options = options || {};
    options.position = new google.maps.LatLng(wptType.lat, wptType.lon);
    return new google.maps.Marker(options);
}

function create_g_polyline(wptTypes, options){
    var options = options || {};
    options.path = new google.maps.MVCArray();
    var i = 0;
    for( var j = 0, m = wptTypes.length; j < m; ++j ){
        options.path.insertAt(i++, new google.maps.LatLng(wptTypes[j].lat, wptTypes[j].lon));
    }
    return new google.maps.Polyline(options);
}

// Original code by Masaru Kitajima: http://blog.section-9.jp/?p=260#sthash.Dpl2Oojk.dpuf
function latlng_distant_from_origin(/*GLatLng*/origin, /*pixel*/delta_x, /*pixel*/delta_y, current_zoom){
    var lat     = origin.lat();
    var lng     = origin.lng();
    var offset  = 268435456; // [pixel] Circumference of the equator when the zoom level 21.
    var pi      = Math.PI;
    var radius  = offset / pi;
    var z       = 21 - current_zoom;

    var d_lat   = ((Math.round(Math.round(offset + radius * lng * pi / 180) + (delta_x << z)) - offset) / radius) * 180 / pi;

    var sin     = Math.sin(lat * pi / 180);
    var log     = Math.log((1 + sin) / (1 - sin));
    var exp     = Math.exp((Math.round(Math.round(offset - radius * log / 2) + (delta_y << z)) -  offset) / radius);
    var d_lng   = (pi / 2 - 2 * Math.atan(exp)) * 180 / pi;

    return new google.maps.LatLng(d_lng, d_lat);
}

//-- this application
function GPXCasualViewer(){
    this.initialize.apply(this, arguments);
}
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
    },
    import_gpx: function (url){
        // create gpx
        var gpx;
        var xhr = createXmlHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        try{
            gpx = gpx_to_json( parseXml(xhr.responseText) );
        }catch(e){
            throw( new Error("Catch an exception at import_gpx with "+ url +"\nreason: "+ e) );
        }
        
        // bounds
        var latlngbounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(gpx.metadata.bounds.minlat, gpx.metadata.bounds.minlon),
            new google.maps.LatLng(gpx.metadata.bounds.maxlat, gpx.metadata.bounds.maxlon)
            );
        this.map.fitBounds( latlngbounds );
        
        // overlays
        for( var i = 0, l = gpx.wpt.length; i < l; ++i ){
            create_g_marker(gpx.wpt[i], {
                "title": gpx.wpt[i].name
                }).setMap(this.map);
        }
        for( var i = 0, l = gpx.rte.length; i < l; ++i ){
            create_g_polyline(gpx.rte[i].rtept, {
                "strokeColor": '#00FF99',
                "strokeOpacity": 0.5,
                "strokeWeight": 4
                }).setMap(this.map);
        }
        var pts = [];
        for( var i = 0, l = gpx.trk.length; i < l; ++i ){
            for( var j = 0, m = gpx.trk[i].trkseg.length; j < m; ++j ){
                pts = pts.concat(gpx.trk[i].trkseg[j].trkpt);
            }
        }
        var po = create_g_polyline(pts, {
            "strokeColor": '#0099FF',
            "strokeOpacity": 0.5,
            "strokeWeight": 4
            });
        var self = this;
        po.addListener('click',function (mouseevent){
            var path = this.getPath();
            var vertex = self.index_of_vertex_nearest_click(path, mouseevent.latLng);
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
        po.setMap(this.map);
    },
    index_of_vertex_nearest_click: function (/*MVCArray*/path, /*GLatLng*/glatlng){
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
            b.extend( latlng_distant_from_origin(b.getNorthEast(),  5, -5, this.map.getZoom()) );
            b.extend( latlng_distant_from_origin(b.getSouthWest(), -5,  5, this.map.getZoom()) );
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
    
}
